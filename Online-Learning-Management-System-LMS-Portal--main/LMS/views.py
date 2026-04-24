from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404

from .models import Subject, Course, Module, Topic, ModuleRecording, ModuleMaterial
from .serializers import (
    SubjectSerializer, CourseSerializer, ModuleSerializer,
    TopicSerializer, ModuleRecordingSerializer, ModuleMaterialSerializer
)

# ================= SUBJECT =================

class SubjectView(APIView):
    def get(self, request):
        return Response(SubjectSerializer(Subject.objects.all(), many=True).data)

    def post(self, request):
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class SubjectDetailView(APIView):
    def get_object(self, id):
        return Subject.objects.get(id=id)

    def get(self, request, id):
        return Response(SubjectSerializer(self.get_object(id)).data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = SubjectSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response(status=204)

# ================= COURSE =================

class CourseView(APIView):
    def get(self, request):
        return Response(CourseSerializer(Course.objects.all(), many=True).data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class CourseDetailView(APIView):
    def get_object(self, id):
        return Course.objects.get(id=id)

    def get(self, request, id):
        return Response(CourseSerializer(self.get_object(id)).data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = CourseSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response(status=204)

# ================= MODULE =================

class ModuleView(APIView):
    def get(self, request):
        return Response(ModuleSerializer(Module.objects.all(), many=True).data)

    def post(self, request):
        serializer = ModuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ModuleDetailView(APIView):
    def get_object(self, id):
        return Module.objects.get(id=id)

    def get(self, request, id):
        return Response(ModuleSerializer(self.get_object(id)).data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = ModuleSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response(status=204)

# ================= TOPIC =================

class TopicView(APIView):
    def get(self, request):
        return Response(TopicSerializer(Topic.objects.all(), many=True).data)

    def post(self, request):
        serializer = TopicSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class TopicDetailView(APIView):
    def get_object(self, id):
        return Topic.objects.get(id=id)

    def get(self, request, id):
        return Response(TopicSerializer(self.get_object(id)).data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = TopicSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response(status=204)

# ================= RECORDING =================

class ModuleRecordingView(APIView):
    def get(self, request):
        return Response(ModuleRecordingSerializer(ModuleRecording.objects.all(), many=True).data)

    def post(self, request):
        serializer = ModuleRecordingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ModuleRecordingDetailView(APIView):
    def get_object(self, id):
        return ModuleRecording.objects.get(id=id)

    def get(self, request, id):
        return Response(ModuleRecordingSerializer(self.get_object(id)).data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = ModuleRecordingSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response(status=204)

# ================= MATERIAL =================

class ModuleMaterialView(APIView):
    def get(self, request):
        return Response(ModuleMaterialSerializer(ModuleMaterial.objects.all(), many=True).data)

    def post(self, request):
        serializer = ModuleMaterialSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ModuleMaterialDetailView(APIView):
    def get_object(self, id):
        return ModuleMaterial.objects.get(id=id)

    def get(self, request, id):
        return Response(ModuleMaterialSerializer(self.get_object(id)).data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = ModuleMaterialSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response(status=204)