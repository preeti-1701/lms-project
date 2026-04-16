

# Create your views here.
from .models import Enrollment, Video

def student_courses(request):
    user = request.user
    enrollments = Enrollment.objects.filter(student=user)

    course_videos = []
    for enroll in enrollments:
        videos = Video.objects.filter(course=enroll.course)
        course_videos.append({
            'course': enroll.course,
            'videos': videos
        })

    return render(request, 'student_courses.html', {'course_videos': course_videos})