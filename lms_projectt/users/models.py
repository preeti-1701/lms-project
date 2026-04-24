from django.db import models
from django.contrib.auth.models import User


# ---------------- COURSE ----------------
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.CharField(max_length=100)

    def __str__(self):
        return self.title


# ---------------- COURSE CONTENT ----------------
class CourseContent(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)
    url = models.URLField(blank=True, null=True)
    file = models.FileField(upload_to='course_content/', blank=True, null=True)

    uploaded_by = models.CharField(max_length=100)

    def __str__(self):
        return self.title


# ---------------- ENROLLMENT ----------------
class Enrollment(models.Model):
    username = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)


# ---------------- ASSIGNMENT ----------------
class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.CharField(max_length=100)
    file = models.FileField(upload_to='assignments/')

    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('reviewed', 'Reviewed'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )

    def __str__(self):
        return f"{self.student} - {self.course.title}"


# ---------------- PROFILE ----------------
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20)

    def __str__(self):
        return self.user.username


# ---------------- PROGRESS ----------------
class Progress(models.Model):
    username = models.CharField(max_length=100)
    content = models.ForeignKey(CourseContent, on_delete=models.CASCADE)
    time_watched = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)