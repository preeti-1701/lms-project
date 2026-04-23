from django.db import models

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    trainer = models.CharField(max_length=200, blank=True, default="")

    class Meta:
        db_table = "course"

    def __str__(self):
        return self.title


class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    youtube_link = models.URLField()


    def __str__(self):
        return self.title


class Student(models.Model):
    names = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, db_column="course")

    class Meta:
        db_table = "students"

    def __str__(self):
        return self.names


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "student_course_enrollment"
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student} -> {self.course}"