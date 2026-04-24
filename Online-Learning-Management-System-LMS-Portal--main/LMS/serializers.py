from rest_framework import serializers
from .models import *

class ModuleMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model=ModuleMaterial
        fields="__all__"

class ModuleRecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model=ModuleRecording
        fields="__all__"

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model=Topic
        fields="__all__"

class ModuleSerializer(serializers.ModelSerializer):
    topics=TopicSerializer(many=True,read_only=True)
    moduleRecordings=ModuleRecordingSerializer(many=True,read_only=True)
    moduleMaterials=ModuleMaterialSerializer(many=True,read_only=True)
    class Meta:
        model=Module
        fields="__all__"

class SubjectSerializer(serializers.ModelSerializer):
    modules=ModuleSerializer(many=True,read_only=True)
    class Meta:
        model=Subject
        fields="__all__"

class CourseSerializer(serializers.ModelSerializer):
    subject=SubjectSerializer(many=True,read_only=True)
    class Meta:
        model=Course
        fields="__all__"

'''
class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model=Module
        fields="__all__"

class ModuleRecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model=ModuleRecording
        fields="__all__"

class ModuleMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model=ModuleMaterial
        fields="__all__"

'''
