from django.urls import path
from .views import (
    SubjectView, SubjectDetailView,
    CourseView, CourseDetailView,
    ModuleView, ModuleDetailView,
    TopicView, TopicDetailView,
    ModuleRecordingView, ModuleRecordingDetailView,
    ModuleMaterialView, ModuleMaterialDetailView
)

urlpatterns = [

    # 🔹 SUBJECT

    path("subjects/", SubjectView.as_view(), name="subjects"),
    path("subjects/<int:id>/", SubjectDetailView.as_view(), name="subject-detail"),

    # 🔹 COURSE

    path("courses/", CourseView.as_view(), name="courses"),
    path("courses/<int:id>/", CourseDetailView.as_view(), name="course-detail"),

    # 🔹 MODULE

    path("modules/", ModuleView.as_view(), name="modules"),
    path("modules/<int:id>/", ModuleDetailView.as_view(), name="module-detail"),

    # 🔹 TOPIC

    path("topics/", TopicView.as_view(), name="topics"),
    path("topics/<int:id>/", TopicDetailView.as_view(), name="topic-detail"),

    # 🔹 RECORDINGS

    path("recordings/", ModuleRecordingView.as_view(), name="recordings"),
    path("recordings/<int:id>/", ModuleRecordingDetailView.as_view(), name="recording-detail"),

    # 🔹 MATERIALS
    path("materials/", ModuleMaterialView.as_view(), name="materials"),
    path("materials/<int:id>/", ModuleMaterialDetailView.as_view(), name="material-detail"),
]