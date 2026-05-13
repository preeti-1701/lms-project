from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from elearning.models import Category, Course, Lesson, UserProfile


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # Categories
        categories_data = [
            ('Python', '🐍'), ('Web Development', '🌐'), ('Data Science', '📊'),
            ('Machine Learning', '🤖'), ('Design', '🎨'), ('Mobile Dev', '📱'),
        ]
        categories = {}
        for name, icon in categories_data:
            cat, _ = Category.objects.get_or_create(name=name, defaults={'icon': icon})
            categories[name] = cat

        # Instructor user
        if not User.objects.filter(username='instructor').exists():
            instructor = User.objects.create_user(
                username='instructor', password='pass1234',
                first_name='Alex', last_name='Johnson', email='alex@edulearn.com'
            )
            UserProfile.objects.create(user=instructor, is_instructor=True,
                bio='Senior software engineer with 10+ years of experience.')
        else:
            instructor = User.objects.get(username='instructor')

        # Student user
        if not User.objects.filter(username='student').exists():
            student = User.objects.create_user(
                username='student', password='pass1234',
                first_name='Sara', last_name='Smith', email='sara@example.com'
            )
            UserProfile.objects.create(user=student, is_instructor=False)

        # Admin superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@edulearn.com', 'admin1234')
            self.stdout.write('  Created admin user (admin/admin1234)')

        # Courses
        courses_data = [
            {
                'title': 'Python for Beginners',
                'description': 'Learn Python from scratch. Perfect for absolute beginners who want to start their coding journey with the most popular programming language in the world.',
                'category': 'Python', 'level': 'beginner',
                'lessons': [
                    ('Introduction to Python', 'What is Python and why learn it?', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 10),
                    ('Variables & Data Types', 'Understanding variables, strings, numbers.', 'https://www.youtube.com/watch?v=cQT33yu9pY8', 15),
                    ('Control Flow', 'If statements, loops, and conditionals.', 'https://www.youtube.com/watch?v=DZwmZ8Usvnk', 18),
                    ('Functions', 'Defining and calling functions in Python.', 'https://www.youtube.com/watch?v=9Os0o3wzS_I', 20),
                ]
            },
            {
                'title': 'Django Web Development',
                'description': 'Build real web applications using Django. Covers models, views, templates, authentication, and deployment. Great for those with basic Python knowledge.',
                'category': 'Web Development', 'level': 'intermediate',
                'lessons': [
                    ('Django Setup', 'Installing Django and creating your first project.', 'https://www.youtube.com/watch?v=UmljXZIypDc', 12),
                    ('Models & Database', 'Creating models and working with SQLite.', 'https://www.youtube.com/watch?v=F5mRW0jo-U4', 25),
                    ('Views & URLs', 'Writing views and mapping URLs.', 'https://www.youtube.com/watch?v=W1GvX2ZcUmY', 20),
                    ('Templates & Static Files', 'Building HTML templates with Django.', 'https://www.youtube.com/watch?v=qDwdMDQ8oX4', 22),
                    ('User Authentication', 'Login, logout, registration with Django.', 'https://www.youtube.com/watch?v=1UvTNMH7zDo', 28),
                ]
            },
            {
                'title': 'Data Science with Python',
                'description': 'Dive into the world of data science using Python libraries like pandas, numpy, and matplotlib. Learn to analyze and visualize real datasets.',
                'category': 'Data Science', 'level': 'intermediate',
                'lessons': [
                    ('Intro to NumPy', 'Arrays, operations, and numerical computing.', 'https://www.youtube.com/watch?v=QUT1VHiLmmI', 20),
                    ('Pandas DataFrames', 'Loading, cleaning, and analyzing data.', 'https://www.youtube.com/watch?v=vmEHCJofslg', 30),
                    ('Data Visualization', 'Creating charts with Matplotlib & Seaborn.', 'https://www.youtube.com/watch?v=3Xc3CA655Y4', 25),
                ]
            },
            {
                'title': 'Machine Learning Fundamentals',
                'description': 'An introduction to machine learning concepts including supervised learning, regression, classification, and using scikit-learn.',
                'category': 'Machine Learning', 'level': 'advanced',
                'lessons': [
                    ('What is ML?', 'Overview of machine learning and its types.', 'https://www.youtube.com/watch?v=ukzFI9rgwfU', 15),
                    ('Linear Regression', 'Building your first predictive model.', 'https://www.youtube.com/watch?v=NUXdtN1W1FE', 30),
                    ('Classification', 'Logistic regression and decision trees.', 'https://www.youtube.com/watch?v=yIYKR4sgzI8', 35),
                ]
            },
        ]

        for cd in courses_data:
            course, created = Course.objects.get_or_create(
                title=cd['title'],
                defaults={
                    'description': cd['description'],
                    'instructor': instructor,
                    'category': categories[cd['category']],
                    'level': cd['level'],
                    'is_published': True,
                }
            )
            if created:
                for i, (title, desc, url, dur) in enumerate(cd['lessons'], 1):
                    Lesson.objects.create(
                        course=course, title=title, description=desc,
                        video_url=url, duration_minutes=dur, order=i
                    )
                self.stdout.write(f'  Created course: {course.title}')

        self.stdout.write(self.style.SUCCESS('\n✅ Seed complete!'))
        self.stdout.write('  Accounts:')
        self.stdout.write('    instructor / pass1234  (Instructor account)')
        self.stdout.write('    student    / pass1234  (Student account)')
        self.stdout.write('    admin      / admin1234 (Django Admin)')
