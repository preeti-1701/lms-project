from rest_framework import serializers
from .models import Category, Course, Lesson


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'title', 'description', 'order', 'is_preview', 'created_at')
        read_only_fields = ('id', 'created_at')


class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    instructor = serializers.StringRelatedField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'slug', 'description', 'instructor',
            'category', 'category_name', 'level', 'thumbnail',
            'price', 'is_published', 'created_at', 'lessons'
        )
        read_only_fields = ('id', 'slug', 'instructor', 'created_at')


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing courses — no lessons"""
    instructor = serializers.StringRelatedField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'slug', 'instructor', 'category_name',
            'level', 'thumbnail', 'price', 'is_published', 'created_at'
        )