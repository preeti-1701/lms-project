from __future__ import annotations

from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import Profile

from .models import Course, CourseItem, Enrollment
from .permissions import IsAdmin, IsApprovedTrainer, IsStudent
from .serializers import CourseUpsertSerializer, serialize_course


def _role(user) -> str:
    if user.is_superuser or user.is_staff:
        return Profile.ROLE_ADMIN
    try:
        return user.profile.role
    except Profile.DoesNotExist:
        return Profile.ROLE_STUDENT


class CourseListCreateView(APIView):
    """List courses visible to current user; trainers can create."""

    def get(self, request):
        role = _role(request.user)

        if role == Profile.ROLE_ADMIN:
            qs = Course.objects.all().select_related('trainer').order_by('-created_at')
        elif role == Profile.ROLE_TRAINER:
            qs = Course.objects.filter(trainer=request.user).order_by('-created_at')
        else:
            qs = Course.objects.filter(status=Course.STATUS_APPROVED).order_by('-created_at')

        return Response([serialize_course(c) for c in qs], status=status.HTTP_200_OK)

    def post(self, request):
        # Only approved trainers (or admins) can create
        role = _role(request.user)
        if role == Profile.ROLE_ADMIN:
            pass
        else:
            perm = IsApprovedTrainer()
            if not perm.has_permission(request, self):
                return Response({'detail': 'Trainer not approved.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CourseUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        items = data.pop('items', [])

        with transaction.atomic():
            course = Course.objects.create(
                trainer=request.user,
                title=data['title'],
                description=data.get('description', ''),
                total_hours=data.get('total_hours') or 0,
                status=Course.STATUS_PENDING,
                approved_by=None,
                approved_at=None,
                rejected_reason='',
            )

            for idx, item in enumerate(items):
                CourseItem.objects.create(
                    course=course,
                    title=item['title'],
                    description=item.get('description', ''),
                    youtube_url=item['youtube_url'],
                    hours=item.get('hours') or 0,
                    order=item.get('order') if item.get('order') is not None else idx,
                )

        course = Course.objects.filter(id=course.id).prefetch_related('items').get()
        return Response(serialize_course(course, include_items=True), status=status.HTTP_201_CREATED)


class CourseDetailView(APIView):
    def get(self, request, course_id: int):
        course = Course.objects.filter(id=course_id).select_related('trainer').first()
        if course is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        role = _role(request.user)
        if role == Profile.ROLE_ADMIN:
            return Response(serialize_course(course, include_items=True), status=status.HTTP_200_OK)

        if role == Profile.ROLE_TRAINER and course.trainer_id == request.user.id:
            return Response(serialize_course(course, include_items=True), status=status.HTTP_200_OK)

        # Students / others only see approved metadata
        if course.status != Course.STATUS_APPROVED:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(serialize_course(course, include_items=False), status=status.HTTP_200_OK)

    def put(self, request, course_id: int):
        # Only owner trainer can edit; editing bumps to pending.
        perm = IsApprovedTrainer()
        if not perm.has_permission(request, self):
            return Response({'detail': 'Trainer not approved.'}, status=status.HTTP_403_FORBIDDEN)

        course = Course.objects.filter(id=course_id, trainer=request.user).prefetch_related('items').first()
        if course is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        items = data.pop('items', None)

        with transaction.atomic():
            course.title = data['title']
            course.description = data.get('description', '')
            if 'total_hours' in data:
                course.total_hours = data.get('total_hours') or 0
            course.status = Course.STATUS_PENDING
            course.approved_by = None
            course.approved_at = None
            course.rejected_reason = ''
            course.save()

            if items is not None:
                course.items.all().delete()
                for idx, item in enumerate(items):
                    CourseItem.objects.create(
                        course=course,
                        title=item['title'],
                        description=item.get('description', ''),
                        youtube_url=item['youtube_url'],
                        hours=item.get('hours') or 0,
                        order=item.get('order') if item.get('order') is not None else idx,
                    )

        course.refresh_from_db()
        course = Course.objects.filter(id=course.id).prefetch_related('items').get()
        return Response(serialize_course(course, include_items=True), status=status.HTTP_200_OK)


class CourseItemsView(APIView):
    """Returns course items (YouTube URLs). Students must be enrolled."""

    def get(self, request, course_id: int):
        course = Course.objects.filter(id=course_id).prefetch_related('items').first()
        if course is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        role = _role(request.user)
        if role == Profile.ROLE_ADMIN:
            return Response(serialize_course(course, include_items=True)['items'], status=status.HTTP_200_OK)

        if role == Profile.ROLE_TRAINER and course.trainer_id == request.user.id:
            return Response(serialize_course(course, include_items=True)['items'], status=status.HTTP_200_OK)

        if course.status != Course.STATUS_APPROVED:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        enrolled = Enrollment.objects.filter(course_id=course_id, student=request.user).exists()
        if not enrolled:
            return Response({'detail': 'Enroll to access course content.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(serialize_course(course, include_items=True)['items'], status=status.HTTP_200_OK)


class CourseEnrollView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, course_id: int):
        course = Course.objects.filter(id=course_id, status=Course.STATUS_APPROVED).first()
        if course is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        enrollment, created = Enrollment.objects.get_or_create(course=course, student=request.user)
        return Response(
            {
                'course_id': course.id,
                'student_id': request.user.id,
                'enrolled_at': enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
                'created': created,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class MyEnrollmentsView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        enrollments = (
            Enrollment.objects.filter(student=request.user)
            .select_related('course')
            .order_by('-enrolled_at')
        )
        return Response(
            [
                {
                    'id': e.id,
                    'course': serialize_course(e.course),
                    'enrolled_at': e.enrolled_at.isoformat() if e.enrolled_at else None,
                }
                for e in enrollments
            ],
            status=status.HTTP_200_OK,
        )


class AdminPendingCoursesView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        pending = Course.objects.filter(status=Course.STATUS_PENDING).order_by('-created_at')
        return Response([serialize_course(c) for c in pending], status=status.HTTP_200_OK)


class AdminApproveCourseView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, course_id: int):
        course = Course.objects.filter(id=course_id).first()
        if course is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        course.status = Course.STATUS_APPROVED
        course.approved_by = request.user
        course.approved_at = timezone.now()
        course.rejected_reason = ''
        course.save(update_fields=['status', 'approved_by', 'approved_at', 'rejected_reason', 'updated_at'])
        return Response(serialize_course(course), status=status.HTTP_200_OK)


class AdminRejectCourseView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, course_id: int):
        course = Course.objects.filter(id=course_id).first()
        if course is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        reason = str(request.data.get('reason', '') or '')
        course.status = Course.STATUS_REJECTED
        course.approved_by = None
        course.approved_at = None
        course.rejected_reason = reason
        course.save(update_fields=['status', 'approved_by', 'approved_at', 'rejected_reason', 'updated_at'])
        return Response(serialize_course(course), status=status.HTTP_200_OK)


class AdminEnrollmentsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        enrollments = (
            Enrollment.objects.all()
            .select_related('course', 'student')
            .order_by('-enrolled_at')
        )
        return Response(
            [
                {
                    'id': e.id,
                    'enrolled_at': e.enrolled_at.isoformat() if e.enrolled_at else None,
                    'course': serialize_course(e.course),
                    'student': {
                        'id': e.student_id,
                        'username': e.student.get_username(),
                        'email': e.student.email,
                    },
                }
                for e in enrollments
            ],
            status=status.HTTP_200_OK,
        )
