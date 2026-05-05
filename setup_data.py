"""
Run this to create/fix all users and sample courses.
Command: python setup_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms.settings')
django.setup()

from django.contrib.auth.models import User
from courses.models import Profile, Course

def create_or_fix_user(username, password, first, last, role):
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        user.set_password(password)
        user.first_name = first
        user.last_name  = last
        user.save()
        print(f"  🔄 Fixed: {username}")
    else:
        user = User.objects.create_user(
            username=username, password=password,
            first_name=first, last_name=last
        )
        print(f"  ✅ Created: {username}")
    profile, _ = Profile.objects.get_or_create(user=user)
    profile.role = role
    profile.save()
    print(f"     → Role: {role}")
    return user

print("\n📦 Setting up users...")
admin   = create_or_fix_user('admin',   'admin123',   'Admin',  'User',    'admin')
student = create_or_fix_user('student', 'student123', 'Alex',   'Student', 'student')
preeti  = create_or_fix_user('preeti',  'trainer123', 'Preeti', 'Sharma',  'trainer')
rahul   = create_or_fix_user('rahul',   'trainer123', 'Rahul',  'Kumar',   'trainer')

print("\n📚 Setting up courses...")

# These YouTube videos are verified to allow embedding
courses_data = [
    {
        'title': 'Python Basics',
        'edition': 'Python Basics 2026 Edition',
        'description': 'Learn Python from scratch. This course covers all fundamental concepts needed to start your programming journey with Python.',
        'topics': 'Variables & Data Types,Control Flow,Functions,Lists & Dictionaries,File Handling,OOP Basics,Error Handling',
        'duration': '8 Weeks',
        'trainer': preeti,
        'status': 'active',
        # freeCodeCamp Python full course — embedding allowed
        'youtube_url': 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    },
    {
        'title': 'Python Advanced',
        'edition': 'Python Advanced 2026 Edition',
        'description': 'Deep dive into advanced Python — decorators, generators, async programming, and building production-grade applications.',
        'topics': 'Decorators,Generators,Async/Await,Metaclasses,Design Patterns,Testing,Performance',
        'duration': '10 Weeks',
        'trainer': preeti,
        'status': 'upcoming',
        'youtube_url': '',
    },
    {
        'title': 'Java Fundamentals',
        'edition': 'Java Fundamentals 2026',
        'description': 'Master Java programming from the ground up, covering OOP principles, collections, and enterprise patterns.',
        'topics': 'OOP Concepts,Collections Framework,Generics,Exception Handling,Streams,Multithreading,JDBC',
        'duration': '12 Weeks',
        'trainer': rahul,
        'status': 'active',
        # freeCodeCamp Java full course — embedding allowed
        'youtube_url': 'https://www.youtube.com/watch?v=GoXwIVyNvX0',
    },
    {
        'title': 'React & Frontend',
        'edition': 'React 2026 Edition',
        'description': 'Build modern web applications with React, hooks, Redux, and the latest frontend ecosystem tools.',
        'topics': 'JSX & Components,Hooks,State Management,Redux Toolkit,React Router,API Integration,Testing',
        'duration': '8 Weeks',
        'trainer': rahul,
        'status': 'active',
        # freeCodeCamp React full course — embedding allowed
        'youtube_url': 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    },
    {
        'title': 'SQL & Databases',
        'edition': 'SQL Mastery 2026',
        'description': 'Complete SQL training from basics to advanced queries, indexing, and database design principles.',
        'topics': 'SELECT & JOINs,Aggregations,Subqueries,Indexing,Transactions,Stored Procedures,DB Design',
        'duration': '6 Weeks',
        'trainer': preeti,
        'status': 'upcoming',
        'youtube_url': '',
    },
]

for data in courses_data:
    existing = Course.objects.filter(title=data['title']).first()
    if existing:
        # Update youtube_url in case it changed
        existing.youtube_url = data['youtube_url']
        existing.save()
        print(f"  🔄 Updated: {data['title']}")
    else:
        Course.objects.create(**data)
        print(f"  ✅ Created: {data['title']} ({data['status']})")

print("\n🎉 All done!")
print("\n🔐 Login credentials:")
print("   Admin:   admin   / admin123")
print("   Student: student / student123")
print("   Trainer: preeti  / trainer123")
print("   Trainer: rahul   / trainer123")
print("\n🚀 Run: python manage.py runserver")
print("   Open: http://127.0.0.1:8000/login/\n")
