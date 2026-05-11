import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from courses.models import Course, Video
from users.models import User

# Get or create an admin user
admin_user, created = User.objects.get_or_create(
    email='admin@gmail.com',
    defaults={
        'role': 'admin',
        'name': 'Admin User',
        'mobile': '+911234567890'
    }
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print("Created admin user")

# Create courses
courses_data = [
    {
        'title': 'Python',
        'description': 'Learn Python programming from basics to advanced concepts. Master data structures, algorithms, and more.',
        'image_url': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
        'videos': [
            {'title': 'Introduction to Python', 'youtube_url': 'https://www.youtube.com/watch?v=kqtD5dpn9C8'},
            {'title': 'Python Variables and Data Types', 'youtube_url': 'https://www.youtube.com/watch?v=cQT33yu9pY8'},
        ]
    },
    {
        'title': 'Django',
        'description': 'Build powerful web applications with Django. Learn models, views, templates, and REST API development.',
        'image_url': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
        'videos': [
            {'title': 'Introduction to Django', 'youtube_url': 'https://www.youtube.com/watch?v=F5mRW0jo-U4'},
            {'title': 'Django Models and Views', 'youtube_url': 'https://www.youtube.com/watch?v=UmljXZIypDc'},
        ]
    },
    {
        'title': 'React',
        'description': 'Create modern user interfaces with React. Master components, hooks, state management, and more.',
        'image_url': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
        'videos': [
            {'title': 'Introduction to React', 'youtube_url': 'https://www.youtube.com/watch?v=SqcY0GlETPk'},
            {'title': 'React Components and Props', 'youtube_url': 'https://www.youtube.com/watch?v=Ke90Tje7VS0'},
        ]
    }
]

for course_data in courses_data:
    course, created = Course.objects.get_or_create(
        title=course_data['title'],
        defaults={
            'description': course_data['description'],
            'image_url': course_data.get('image_url'),
            'created_by': admin_user
        }
    )
    if created:
        print(f"Created course: {course.title}")
        # Add videos
        for video_data in course_data['videos']:
            Video.objects.create(
                course=course,
                title=video_data['title'],
                youtube_url=video_data['youtube_url']
            )
            print(f"  Added video: {video_data['title']}")
    else:
        print(f"Course already exists: {course.title}")
        # Update image_url if it exists
        if course_data.get('image_url'):
            course.image_url = course_data['image_url']
            course.save()
            print(f"  Updated image_url for: {course.title}")

print("Courses added successfully!")
