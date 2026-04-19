from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=50)
   

    def __str__(self):
        return self.username
#------------------------------course model-------------------------------
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.CharField(max_length=100)

    def __str__(self):
        return self.title
class Enrollment(models.Model):
    username = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.username} - {self.course.title}"
class CourseContent(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='course_files/')
    uploaded_by = models.CharField(max_length=100)

    def __str__(self):
        return self.title

class Progress(models.Model):
    username = models.CharField(max_length=100)
    content = models.ForeignKey(CourseContent, on_delete=models.CASCADE)
    time_watched = models.FloatField(default=0)
    completed = models.BooleanField(default=False)


#---------------------assignment model-------------------------------
class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.CharField(max_length=100)
    file = models.FileField(upload_to='assignments/')
    submitted_at = models.DateTimeField(auto_now_add=True)

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
#---------------------Profile model-------------------------------
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20)

    def __str__(self):
        return self.user.username
