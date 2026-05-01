from django.db import models

# USER MODEL
class User(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('student', 'Student'),
        ('trainer', 'Trainer'),
    )

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# COURSE MODEL
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    trainer = models.ForeignKey(User, on_delete=models.CASCADE)

    topics = models.TextField()
    duration = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default="active")

    def __str__(self):
        return self.title
    
    is_active = models.BooleanField(default=True)
    
class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.student.name} - {self.course.title}"
    progress = models.IntegerField(default=0)
    
    from django.db import models

class Video(models.Model):
    title = models.CharField(max_length=200)
    youtube_link = models.URLField()
    course = models.ForeignKey('users.Course', on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
    