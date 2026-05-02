#!/usr/bin/env python
"""
Seed script - creates demo data for EduTrack LMS
Run: python seed_data.py
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edutrack.settings')
django.setup()

from django.contrib.auth.models import User
from lms.models import Profile, Category, Course, Lesson, Enrollment

print("🌱 Seeding EduTrack demo data...")

# Categories
cats = [
    ('programming', 'Programming', '💻'),
    ('design', 'Design', '🎨'),
    ('data-science', 'Data Science', '📊'),
    ('business', 'Business', '💼'),
    ('marketing', 'Marketing', '📣'),
]
cat_objs = {}
for slug, name, icon in cats:
    c, _ = Category.objects.get_or_create(slug=slug, defaults={'name': name, 'icon': icon})
    cat_objs[slug] = c
print(f"  ✓ {len(cats)} categories")

# Admin superuser
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser('admin', 'admin@edutrack.com', 'admin123')
    Profile.objects.get_or_create(user=admin, defaults={'role': 'trainer'})
    print("  ✓ Superuser: admin / admin123")

# Trainers
trainer_data = [
    ('trainer1', 'Alex', 'Morgan', 'trainer@edutrack.com'),
    ('trainer2', 'Sam', 'Rivera', 'sam@edutrack.com'),
]
trainers = []
for uname, fn, ln, email in trainer_data:
    if not User.objects.filter(username=uname).exists():
        u = User.objects.create_user(uname, email, 'trainer123', first_name=fn, last_name=ln)
        Profile.objects.get_or_create(user=u, defaults={'role': 'trainer'})
    else:
        u = User.objects.get(username=uname)
        Profile.objects.update_or_create(user=u, defaults={'role': 'trainer'})
    trainers.append(u)
print(f"  ✓ {len(trainers)} trainers (password: trainer123)")

# Students
student_data = [
    ('student1', 'Jordan', 'Lee', 'jordan@example.com'),
    ('student2', 'Taylor', 'Kim', 'taylor@example.com'),
]
students = []
for uname, fn, ln, email in student_data:
    if not User.objects.filter(username=uname).exists():
        u = User.objects.create_user(uname, email, 'student123', first_name=fn, last_name=ln)
        Profile.objects.get_or_create(user=u, defaults={'role': 'student'})
    else:
        u = User.objects.get(username=uname)
        Profile.objects.update_or_create(user=u, defaults={'role': 'student'})
    students.append(u)
print(f"  ✓ {len(students)} students (password: student123)")

# Courses
courses_data = [
    {
        'title': 'Python for Beginners',
        'description': 'Learn Python from scratch! This comprehensive course covers variables, loops, functions, OOP, and building real projects. Perfect for anyone starting their programming journey.',
        'trainer': trainers[0],
        'category': cat_objs['programming'],
        'level': 'beginner',
        'price': 0.00,
        'lessons': [
            ('Introduction to Python', 'Welcome to Python! Learn what Python is and why it\'s one of the most popular programming languages in the world.', 10),
            ('Variables & Data Types', 'Master Python variables, strings, integers, floats, and booleans. Learn how to store and manipulate data.', 15),
            ('Control Flow: If/Else', 'Learn how to make decisions in your code using if, elif, and else statements.', 20),
            ('Loops: For & While', 'Automate repetitive tasks using for loops and while loops.', 25),
            ('Functions', 'Write reusable code with functions. Learn parameters, return values, and scope.', 20),
            ('Lists & Dictionaries', 'Work with Python\'s most powerful built-in data structures.', 30),
            ('File Handling', 'Read and write files using Python\'s built-in file I/O capabilities.', 20),
            ('Final Project: CLI App', 'Build a command-line application applying everything you\'ve learned.', 45),
        ]
    },
    {
        'title': 'UI/UX Design Fundamentals',
        'description': 'Master the principles of user interface and user experience design. From wireframing to prototyping, learn to create beautiful, intuitive digital products.',
        'trainer': trainers[1],
        'category': cat_objs['design'],
        'level': 'beginner',
        'price': 49.99,
        'lessons': [
            ('Design Thinking', 'Introduction to the design thinking methodology and human-centered design.', 15),
            ('User Research', 'Learn to conduct user interviews, surveys, and usability testing.', 25),
            ('Wireframing Basics', 'Create low-fidelity wireframes to sketch your ideas quickly.', 30),
            ('Color Theory', 'Master color psychology and how to create effective color palettes.', 20),
            ('Typography', 'Choose and pair fonts to create beautiful, readable interfaces.', 15),
            ('Prototyping with Figma', 'Build interactive prototypes using Figma.', 40),
        ]
    },
    {
        'title': 'Data Science with Python',
        'description': 'Dive into data science using Python, Pandas, NumPy, and visualization libraries. Learn to extract insights from data and build machine learning models.',
        'trainer': trainers[0],
        'category': cat_objs['data-science'],
        'level': 'intermediate',
        'price': 79.99,
        'lessons': [
            ('Intro to Data Science', 'What is data science? The data science lifecycle and tools.', 20),
            ('NumPy Essentials', 'Numerical computing with NumPy arrays and operations.', 30),
            ('Pandas for Data Analysis', 'Data manipulation and analysis with Pandas DataFrames.', 45),
            ('Data Visualization', 'Create compelling charts with Matplotlib and Seaborn.', 35),
            ('Statistical Analysis', 'Descriptive statistics, distributions, and hypothesis testing.', 40),
        ]
    },
]

for cd in courses_data:
    course, created = Course.objects.get_or_create(
        title=cd['title'],
        defaults={
            'description': cd['description'],
            'trainer': cd['trainer'],
            'category': cd['category'],
            'level': cd['level'],
            'price': cd['price'],
            'is_published': True,
        }
    )
    if created:
        for i, (title, content, duration) in enumerate(cd['lessons'], 1):
            Lesson.objects.create(
                course=course,
                title=title,
                content=content,
                order=i,
                duration_minutes=duration,
                is_free_preview=(i == 1),
            )
    # Enroll students
    for student in students:
        Enrollment.objects.get_or_create(student=student, course=course)

print(f"  ✓ {len(courses_data)} courses with lessons")
print(f"  ✓ Students enrolled in all courses")

print("""
✅ Done! EduTrack is ready.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin:    admin / admin123     → /admin/
Trainer:  trainer1 / trainer123
Student:  student1 / student123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")
