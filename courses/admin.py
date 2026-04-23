from django.contrib import admin
from .models import Category, Course, Lesson

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}  # auto-fills slug from name
    search_fields = ('name',)


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1  # shows 1 empty lesson row by default
    fields = ('title', 'order', 'is_preview')
    ordering = ('order',)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'category', 'level', 'is_published', 'created_at')
    list_filter = ('level', 'is_published', 'category')
    search_fields = ('title', 'instructor__username')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_published',)  # toggle publish directly from list view
    inlines = [LessonInline]           # manage lessons inside course page


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'is_preview')
    list_filter = ('course', 'is_preview')
    search_fields = ('title', 'course__title')
    ordering = ('course', 'order')