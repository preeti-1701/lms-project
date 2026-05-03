from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Course, Lesson
from .serializers import CourseSerializer, LessonSerializer
from .permissions import IsAdmin, IsTrainer, IsStudent
from enrollments.models import Enrollment
from progress.models import Progress
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from io import BytesIO


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [IsAdmin | IsTrainer]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin | IsTrainer]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Course.objects.all()
        elif user.role == 'trainer':
            return Course.objects.filter(trainer=user)
        elif user.role == 'student':
            enrolled_course_ids = Enrollment.objects.filter(
                student=user
            ).values_list('course_id', flat=True)
            return Course.objects.filter(id__in=enrolled_course_ids)
        return Course.objects.none()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if user.role == 'trainer' and obj.trainer != user:
            self.permission_denied(
                self.request,
                message="You do not have permission to access this course."
            )
        if user.role == 'student':
            is_enrolled = Enrollment.objects.filter(
                student=user,
                course=obj
            ).exists()
            if not is_enrolled:
                self.permission_denied(
                    self.request,
                    message="You are not enrolled in this course."
                )
        return obj

    def perform_create(self, serializer):
        if self.request.user.role == 'trainer':
            serializer.save(trainer=self.request.user)
        else:
            serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role == 'trainer' and serializer.instance.trainer != self.request.user:
            raise permissions.PermissionDenied("You can only update your own courses.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role == 'trainer' and instance.trainer != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own courses.")
        instance.delete()

    @action(detail=True, methods=['get'])
    def certificate(self, request, pk=None):
        user = request.user
        course = self.get_object()

        if user.role != 'student':
            return Response({'detail': 'Only students can download certificates.'}, status=403)

        is_enrolled = Enrollment.objects.filter(student=user, course=course).exists()
        if not is_enrolled:
            return Response({'detail': 'You are not enrolled in this course.'}, status=403)

        lessons = course.lessons.all()
        total = lessons.count()
        completed = Progress.objects.filter(
            student=user,
            lesson__in=lessons,
            is_completed=True
        ).count()

        if total == 0 or completed < total:
            return Response({'detail': 'Complete all lessons to earn a certificate.'}, status=403)

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=landscape(A4))
        width, height = landscape(A4)

        # Background
        p.setFillColor(HexColor('#f7f8fa'))
        p.rect(0, 0, width, height, fill=1, stroke=0)

        # Border
        p.setStrokeColor(HexColor('#1865f2'))
        p.setLineWidth(4)
        p.rect(40, 40, width - 80, height - 80, fill=0, stroke=1)

        # Title
        p.setFillColor(HexColor('#1865f2'))
        p.setFont('Helvetica-Bold', 42)
        p.drawCentredString(width / 2, height - 120, 'CERTIFICATE OF COMPLETION')

        # Subtitle
        p.setFillColor(HexColor('#686f7a'))
        p.setFont('Helvetica', 18)
        p.drawCentredString(width / 2, height - 170, 'This is to certify that')

        # Student Name
        p.setFillColor(HexColor('#21242c'))
        p.setFont('Helvetica-Bold', 32)
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username
        p.drawCentredString(width / 2, height - 220, full_name)

        # Course completion text
        p.setFillColor(HexColor('#686f7a'))
        p.setFont('Helvetica', 18)
        p.drawCentredString(width / 2, height - 270, 'has successfully completed the course')

        # Course Title
        p.setFillColor(HexColor('#21242c'))
        p.setFont('Helvetica-Bold', 28)
        p.drawCentredString(width / 2, height - 320, course.title)

        # Date
        from datetime import date
        p.setFillColor(HexColor('#686f7a'))
        p.setFont('Helvetica', 16)
        p.drawCentredString(width / 2, height - 380, f"Date: {date.today().strftime('%B %d, %Y')}")

        # Footer
        p.setFillColor(HexColor('#1865f2'))
        p.setFont('Helvetica-Bold', 14)
        p.drawCentredString(width / 2, 80, 'LMS Learning Platform')

        p.showPage()
        p.save()

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificate_{course.course_id}.pdf"'
        return response


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin | IsTrainer]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Lesson.objects.all()
        elif user.role == 'trainer':
            return Lesson.objects.filter(course__trainer=user)
        elif user.role == 'student':
            enrolled_course_ids = Enrollment.objects.filter(
                student=user
            ).values_list('course_id', flat=True)
            return Lesson.objects.filter(course_id__in=enrolled_course_ids)
        return Lesson.objects.none()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if user.role == 'trainer' and obj.course.trainer != user:
            self.permission_denied(
                self.request,
                message="You do not have permission to access this lesson."
            )
        if user.role == 'student':
            is_enrolled = Enrollment.objects.filter(
                student=user,
                course=obj.course
            ).exists()
            if not is_enrolled:
                self.permission_denied(
                    self.request,
                    message="You are not enrolled in this course."
                )
        return obj

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if self.request.user.role == 'trainer' and course.trainer != self.request.user:
            raise permissions.PermissionDenied("You can only add lessons to your own courses.")
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role == 'trainer' and serializer.instance.course.trainer != self.request.user:
            raise permissions.PermissionDenied("You can only update lessons in your own courses.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role == 'trainer' and instance.course.trainer != self.request.user:
            raise permissions.PermissionDenied("You can only delete lessons from your own courses.")
        instance.delete()

