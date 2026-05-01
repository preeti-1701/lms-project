from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.utils import timezone


class User(AbstractUser):
    """Custom user supporting both students and instructors."""
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('instructor', 'Instructor'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    bio = models.TextField(blank=True)
    avatar_color = models.CharField(max_length=7, default='#6366f1', help_text='Hex color for avatar')
    is_verified = models.BooleanField(default=False, help_text='Email verified via OTP')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_instructor(self):
        return self.role == 'instructor'

    @property
    def is_student(self):
        return self.role == 'student'

    @property
    def initials(self):
        if self.first_name and self.last_name:
            return f"{self.first_name[0]}{self.last_name[0]}".upper()
        return self.username[:2].upper()


class Course(models.Model):
    """A course created by an instructor, containing lessons."""
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_teaching')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    category = models.CharField(max_length=100, default='General')
    thumbnail_emoji = models.CharField(max_length=10, default='📚')
    accent_color = models.CharField(max_length=7, default='#6366f1')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            n = 1
            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def lesson_count(self):
        return self.lessons.count()

    @property
    def enrollment_count(self):
        return self.enrollments.count()


class Lesson(models.Model):
    """A lesson within a course, with ordering."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField(help_text='Lesson content')
    video_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['course', 'order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    """A student enrolled in a course."""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [['student', 'course']]
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.student.username} in {self.course.title}"

    @property
    def progress_percent(self):
        total_lessons = self.course.lessons.count()
        if total_lessons == 0:
            return 0
        completed = LessonProgress.objects.filter(
            enrollment=self, is_completed=True
        ).count()
        return int((completed / total_lessons) * 100)

    def check_completion(self):
        if self.progress_percent == 100 and not self.completed:
            self.completed = True
            self.completed_at = timezone.now()
            self.save()


class LessonProgress(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [['enrollment', 'lesson']]

    def __str__(self):
        status = "✓" if self.is_completed else "○"
        return f"{status} {self.lesson.title}"


class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    pass_score = models.PositiveIntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Quizzes'

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    @property
    def question_count(self):
        return self.questions.count()


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    choice_a = models.CharField(max_length=300)
    choice_b = models.CharField(max_length=300)
    choice_c = models.CharField(max_length=300)
    choice_d = models.CharField(max_length=300)
    CORRECT_CHOICES = [('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')]
    correct_answer = models.CharField(max_length=1, choices=CORRECT_CHOICES)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text[:60]


class QuizAttempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-attempted_at']

    def __str__(self):
        return f"{self.student.username}: {self.quiz.title} ({self.score}%)"


class EmailOTP(models.Model):
    """One-time password for email verification."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.user.email} ({self.code})"

    def is_valid(self):
        if self.is_used:
            return False
        if timezone.now() > self.expires_at:
            return False
        if self.attempts >= 5:
            return False
        return True
