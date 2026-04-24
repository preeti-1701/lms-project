from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404

from .models import (
    Subject, Course, Module, Topic,
    ModuleRecording, ModuleMaterial
)

from .serializers import (
    SubjectSerializer, CourseSerializer, ModuleSerializer,
    TopicSerializer, ModuleRecordingSerializer, ModuleMaterialSerializer
)


# ========================= SUBJECT =========================

class SubjectView(APIView):

    def get(self, request):
        data = Subject.objects.all()
        serializer = SubjectSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubjectDetailView(APIView):

    def get_object(self, id):
        try:
            return Subject.objects.get(id=id)
        except Subject.DoesNotExist:
            raise Http404

    def get(self, request, id):
        serializer = SubjectSerializer(self.get_object(id))
        return Response(serializer.data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = SubjectSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)


# ========================= COURSE =========================

class CourseView(APIView):

    def get(self, request):
        data = Course.objects.all()
        serializer = CourseSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseDetailView(APIView):

    def get_object(self, id):
        try:
            return Course.objects.get(id=id)
        except Course.DoesNotExist:
            raise Http404

    def get(self, request, id):
        serializer = CourseSerializer(self.get_object(id))
        return Response(serializer.data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = CourseSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)


# ========================= MODULE =========================

class ModuleView(APIView):

    def get(self, request):
        data = Module.objects.all()
        serializer = ModuleSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ModuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModuleDetailView(APIView):

    def get_object(self, id):
        try:
            return Module.objects.get(id=id)
        except Module.DoesNotExist:
            raise Http404

    def get(self, request, id):
        serializer = ModuleSerializer(self.get_object(id))
        return Response(serializer.data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = ModuleSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)


# ========================= TOPIC =========================

class TopicView(APIView):

    def get(self, request):
        data = Topic.objects.all()
        serializer = TopicSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TopicSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TopicDetailView(APIView):

    def get_object(self, id):
        try:
            return Topic.objects.get(id=id)
        except Topic.DoesNotExist:
            raise Http404

    def get(self, request, id):
        serializer = TopicSerializer(self.get_object(id))
        return Response(serializer.data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = TopicSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)


# ========================= RECORDING =========================

class ModuleRecordingView(APIView):

    def get(self, request):
        data = ModuleRecording.objects.all()
        serializer = ModuleRecordingSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ModuleRecordingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModuleRecordingDetailView(APIView):

    def get_object(self, id):
        try:
            return ModuleRecording.objects.get(id=id)
        except ModuleRecording.DoesNotExist:
            raise Http404

    def get(self, request, id):
        serializer = ModuleRecordingSerializer(self.get_object(id))
        return Response(serializer.data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = ModuleRecordingSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)


# ========================= MATERIAL =========================

class ModuleMaterialView(APIView):

    def get(self, request):
        data = ModuleMaterial.objects.all()
        serializer = ModuleMaterialSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ModuleMaterialSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModuleMaterialDetailView(APIView):

    def get_object(self, id):
        try:
            return ModuleMaterial.objects.get(id=id)
        except ModuleMaterial.DoesNotExist:
            raise Http404

    def get(self, request, id):
        serializer = ModuleMaterialSerializer(self.get_object(id))
        return Response(serializer.data)

    def put(self, request, id):
        obj = self.get_object(id)
        serializer = ModuleMaterialSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        self.get_object(id).delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)