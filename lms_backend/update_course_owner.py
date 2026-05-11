import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from courses.models import Course
from users.models import User

# Get the new admin user
admin_user = User.objects.get(email='admin@gmail.com')
print(f"Found admin user: {admin_user.email}")

# Update all courses to be owned by admin@gmail.com
courses = Course.objects.all()
for course in courses:
    course.created_by = admin_user
    course.save()
    print(f"Updated course '{course.title}' to be owned by {admin_user.email}")

print(f"Updated {courses.count()} courses successfully!")
