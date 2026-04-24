
from django.db import models

# Create your models here.

class Subject(models.Model):
    title=models.CharField(max_length=200)
    description=models.TextField(default="")
class Course(models.Model):
    name=models.CharField(max_length=200)
    description=models.TextField()
    subject=models.ManyToManyField(Subject,related_name="courses")

class Module(models.Model):
    name=models.CharField(max_length=200)
    description=models.TextField()
    subject=models.ForeignKey(Subject,on_delete=models.CASCADE,related_name="modules")

class Topic(models.Model):
    name=models.CharField(max_length=200)
    order=models.PositiveIntegerField()
    module=models.ForeignKey(Module,on_delete=models.CASCADE,related_name="topics")

class ModuleRecording(models.Model):
    title=models.CharField(max_length=200)
    url=models.URLField()
    module=models.ForeignKey(Module,on_delete=models.CASCADE,related_name="module_recordings")

class ModuleMaterial(models.Model):
    title=models.CharField(max_length=200)
    file=models.FileField(upload_to="module_materials/")
