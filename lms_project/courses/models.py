from django.db import models
from django.conf import settings

# Create your models here.
User = settings.AUTH_USER_MODEL

class Course(models.Model):
    title = models.CharField(max_length=200)
    trainer = models.ForeignKey(User , on_delete=models.CASCADE , related_name='created_courses')
    students = models.ManyToManyField(User,related_name='enrolled_courses' , blank=True)


    def __str__(self):
        return self.title
    

class Video(models.Model):
    course = models.ForeignKey(Course,on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    youtube_link = models.URLField()


    def __str__(self):
        return self.title