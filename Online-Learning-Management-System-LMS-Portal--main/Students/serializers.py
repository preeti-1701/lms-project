from rest_framework import serializers
from .models import *

# 🔹 Module Material
class ModuleMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleMaterial
        fields = "__all__"

# 🔹 Module Recording
class ModuleRecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleRecording
        fields = "__all__"

# 🔹 Topic
class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = "__all__"


# 🔹 Module
class ModuleSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    module_recordings = ModuleRecordingSerializer(many=True, read_only=True)
    materials = ModuleMaterialSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = "__all__"

# 🔹 Subject
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


# 🔹 Course
class CourseSerializer(serializers.ModelSerializer):
    subject = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Subject.objects.all()
    )
    class Meta:
        model = Course
        fields = "__all__"