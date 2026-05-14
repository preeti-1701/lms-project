import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Course, Video, Enrollment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with demo data (users, courses, videos, enrollments)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create Admin
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'role': 'admin'
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created Admin user'))

        # 2. Create Trainers
        trainers = []
        for i in range(1, 4):
            trainer, created = User.objects.get_or_create(
                username=f'trainer{i}',
                defaults={
                    'email': f'trainer{i}@example.com',
                    'role': 'trainer'
                }
            )
            if created:
                trainer.set_password('test123')
                trainer.save()
            trainers.append(trainer)
        self.stdout.write(self.style.SUCCESS(f'Ensured {len(trainers)} Trainers exist'))

        # 3. Create Students
        students = []
        for i in range(1, 6):
            student, created = User.objects.get_or_create(
                username=f'student{i}',
                defaults={
                    'email': f'student{i}@example.com',
                    'role': 'student'
                }
            )
            if created:
                student.set_password('test123')
                student.save()
            students.append(student)
        self.stdout.write(self.style.SUCCESS(f'Ensured {len(students)} Students exist'))

        # 4. Create Courses
        course_data = [
            ('Python Basics', 'Master the fundamentals of Python programming, including data types, loops, and functions. Perfect for absolute beginners.', '3h'),
            ('Advanced Python', 'Dive deep into Python with decorators, generators, context managers, and advanced OOP concepts.', '5h'),
            ('Django Development', 'Build robust web applications from scratch using Django. Covers ORM, views, templates, and deployment.', '8h'),
            ('Data Structures', 'Learn essential data structures like arrays, linked lists, trees, and graphs to write efficient code.', '4h'),
            ('Algorithms', 'Master common algorithms including sorting, searching, and dynamic programming for coding interviews.', '6h'),
            ('Machine Learning', 'Introduction to ML concepts using Scikit-Learn. Build regression and classification models.', '7h'),
            ('Deep Learning', 'Explore neural networks, CNNs, and RNNs using TensorFlow and PyTorch for advanced AI applications.', '10h'),
            ('SQL Database', 'Learn relational database design, complex queries, joins, and optimization techniques.', '3h'),
            ('DevOps', 'Automate your infrastructure with CI/CD pipelines, Docker, Kubernetes, and AWS basics.', '6h'),
            ('Cloud Computing', 'Understand cloud architecture and services on major providers like AWS, Azure, and Google Cloud.', '5h'),
            ('React JS', 'Build interactive user interfaces with React, hooks, state management, and component-based design.', '6h'),
            ('Full Stack Development', 'Connect frontend and backend technologies to build complete, scalable web applications.', '12h'),
            ('Java Programming', 'Comprehensive guide to Java, covering object-oriented programming, exception handling, and multithreading.', '8h'),
            ('C++ Programming', 'Master C++ for high-performance applications, game development, and systems programming.', '7h')
        ]
        
        courses = []
        for title, desc, dur in course_data:
            course, created = Course.objects.update_or_create(
                title=title,
                defaults={
                    'description': desc,
                    'duration': dur,
                    'trainer': random.choice(trainers)
                }
            )
            courses.append(course)
        self.stdout.write(self.style.SUCCESS(f'Ensured {len(course_data)} Courses exist with detailed descriptions'))

        # 5. Create Videos
        dummy_video_links = [
            'https://www.youtube.com/watch?v=rfscVS0vtbw',
            'https://www.youtube.com/watch?v=HGOBQPFzWKo',
            'https://www.youtube.com/watch?v=nLRL_NcnK-4',
            'https://www.youtube.com/watch?v=kqtD5dpn9C8'
        ]
        
        video_count = 0
        for course in courses:
            # Check existing videos for this course
            existing_videos = Video.objects.filter(course=course).count()
            videos_to_create = max(0, random.randint(3, 5) - existing_videos)
            
            for i in range(videos_to_create):
                Video.objects.create(
                    course=course,
                    title=f'{course.title} - Part {existing_videos + i + 1}',
                    youtube_link=random.choice(dummy_video_links),
                    duration=f'{random.randint(5, 20)}:{random.randint(10, 59):02d}'
                )
                video_count += 1
        self.stdout.write(self.style.SUCCESS(f'Created {video_count} new Videos'))

        # 6. Create Enrollments
        enrollment_count = 0
        for student in students:
            # Pick 1 to 2 unique random courses
            num_courses = random.randint(1, 2)
            enrolled_courses = random.sample(courses, min(num_courses, len(courses)))
            
            for course in enrolled_courses:
                enrollment, created = Enrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        'progress': random.randint(10, 30)
                    }
                )
                if created:
                    enrollment_count += 1

        self.stdout.write(self.style.SUCCESS(f'Created {enrollment_count} new Enrollments'))

        self.stdout.write(self.style.SUCCESS('\n--- Seeding Summary ---'))
        self.stdout.write(f'Users: 1 Admin, 3 Trainers, 5 Students')
        self.stdout.write(f'Courses: {len(courses)}')
        self.stdout.write(f'Videos Added: {video_count}')
        self.stdout.write(f'Enrollments Added: {enrollment_count}')
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
