"""Course, Lesson, Enrollment and LessonProgress models."""
from django.conf import settings
from django.db import models


class Course(models.Model):
    """A course created by an Admin (Instructor)."""

    title = models.CharField(max_length=200)  # ✅ already required

    # ❗ CHANGED → now required
    description = models.TextField(
        blank=False,
        null=False
    )

    # optional (keep as is)
    video_url = models.URLField(
        blank=True,
        help_text="Link to the course video (e.g. YouTube)."
    )

    # ❗ CHANGED → required instructor
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courses_taught',
        blank=False,
        null=False
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.title

    @property
    def lesson_count(self) -> int:
        return self.lessons.count()


class Lesson(models.Model):
    """A single unit of content within a course."""

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='lessons',
    )

    title = models.CharField(max_length=200)  # required

    # ❗ CHANGED → now required
    content = models.TextField(
        blank=False,
        help_text="Lesson notes or description."
    )

    video_url = models.URLField(
        blank=True,
        help_text="Optional embeddable lesson video."
    )

    order = models.PositiveIntegerField(
        default=0,
        help_text="Display order within the course."
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self) -> str:
        return f"{self.course.title} — {self.title}"


class Enrollment(models.Model):
    """Join row between a student and a course."""

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-enrolled_at']

    def __str__(self) -> str:
        return f"{self.student.username} -> {self.course.title}"

    # progress helpers
    @property
    def total_lessons(self) -> int:
        return self.course.lessons.count()

    @property
    def completed_lessons(self) -> int:
        return LessonProgress.objects.filter(
            student=self.student,
            lesson__course=self.course,
            completed=True,
        ).count()

    @property
    def progress_percentage(self) -> int:
        total = self.total_lessons
        if total == 0:
            return 0
        return int(round((self.completed_lessons / total) * 100))

    @property
    def is_completed(self) -> bool:
        return self.total_lessons > 0 and self.completed_lessons >= self.total_lessons


class LessonProgress(models.Model):
    """Tracks lesson completion."""

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lesson_progress',
    )

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='progress_entries',
    )

    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'lesson')

    def __str__(self) -> str:
        flag = '✓' if self.completed else '·'
        return f"{flag} {self.student.username} — {self.lesson.title}"


