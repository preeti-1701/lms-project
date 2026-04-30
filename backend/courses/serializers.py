from __future__ import annotations

from decimal import Decimal

from rest_framework import serializers

from .models import Course, CourseItem


class CourseItemInputSerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    youtube_url = serializers.URLField()
    hours = serializers.DecimalField(max_digits=6, decimal_places=2, required=False)
    order = serializers.IntegerField(required=False)


class CourseUpsertSerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    total_hours = serializers.DecimalField(max_digits=6, decimal_places=2, required=False)
    items = CourseItemInputSerializer(many=True, required=False)


def serialize_course(course: Course, *, include_items: bool = False) -> dict:
    base = {
        'id': course.id,
        'trainer_id': course.trainer_id,
        'title': course.title,
        'description': course.description,
        'total_hours': str(course.total_hours),
        'status': course.status,
        'rejected_reason': course.rejected_reason,
        'approved_at': course.approved_at.isoformat() if course.approved_at else None,
        'created_at': course.created_at.isoformat() if course.created_at else None,
        'updated_at': course.updated_at.isoformat() if course.updated_at else None,
    }

    if include_items:
        base['items'] = [
            {
                'id': item.id,
                'title': item.title,
                'description': item.description,
                'youtube_url': item.youtube_url,
                'hours': str(item.hours),
                'order': item.order,
            }
            for item in course.items.all()
        ]

    return base
