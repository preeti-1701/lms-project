import random
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from core.models import User, Category, Course, Video, Enrollment, VideoProgress, Quiz, Question, Choice
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seeds the database with initial demo data for LMS'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database seeding...")

        # 1. Create Users (Admins, Trainers, Students)
        self.stdout.write("Creating users...")
        User.objects.all().delete()
        
        # Admin
        User.objects.create_superuser(
            username='admin', email='admin@lms.com', password='password123', role='admin'
        )
        
        # Trainers
        trainers = []
        for i in range(1, 5):
            trainer = User.objects.create(
                username=f'trainer{i}', email=f'trainer{i}@lms.com', password=make_password('password123'), role='trainer'
            )
            trainers.append(trainer)
            
        # Students
        students = []
        for i in range(1, 11):
            student = User.objects.create(
                username=f'student{i}', email=f'student{i}@lms.com', password=make_password('password123'), role='student'
            )
            students.append(student)

        # 2. Create Categories
        self.stdout.write("Creating categories...")
        Category.objects.all().delete()
        cat_names = ['Web Development', 'Data Science', 'Design', 'Marketing', 'Business']
        categories = []
        for name in cat_names:
            categories.append(Category.objects.create(name=name))

        # 3. Create Courses
        self.stdout.write("Creating courses...")
        Course.objects.all().delete()
        course_titles = [
            "Full-Stack Web Development Bootcamp",
            "Python for Data Science and Machine Learning",
            "UI/UX Design Masterclass",
            "Digital Marketing 101",
            "Agile Project Management",
            "JavaScript: The Advanced Concepts",
            "React - The Complete Guide",
            "Django Web Framework",
            "Introduction to Cybersecurity",
            "Cloud Computing with AWS",
            "Financial Analyst Training",
            "SEO Strategies for 2026",
            "Mobile App Development with Flutter",
            "Data Engineering Basics",
            "Artificial Intelligence Fundamentals"
        ]
        
        courses = []
        for i, title in enumerate(course_titles):
            course = Course.objects.create(
                title=title,
                category=random.choice(categories),
                description=f"This is a comprehensive course on {title}. Learn from industry experts and master the skills required to succeed. We cover from basics to advanced topics.",
                trainer=random.choice(trainers),
                duration=f"{random.randint(2, 20)} hours",
                featured=(i < 3) # Make first 3 featured
            )
            courses.append(course)

        # 4. Create Videos for Courses
        self.stdout.write("Creating videos...")
        Video.objects.all().delete()
        youtube_links = [
            "https://www.youtube.com/embed/jNQXAC9IVRw", # Me at the zoo (dummy)
            "https://www.youtube.com/embed/dQw4w9WgXcQ", # Rickroll (dummy)
            "https://www.youtube.com/embed/tgbNymZ7vqY",
            "https://www.youtube.com/embed/YQHsXMglC9A"
        ]
        
        for course in courses:
            num_videos = random.randint(3, 8)
            for j in range(num_videos):
                Video.objects.create(
                    course=course,
                    title=f"Module {j+1}: Introduction to {course.title.split()[0]} Part {j+1}",
                    youtube_link=random.choice(youtube_links),
                    duration=f"{random.randint(5, 25)}:00",
                    order=j
                )

        # 5. Create Quizzes
        self.stdout.write("Creating quizzes...")
        Quiz.objects.all().delete()
        for course in courses:
            quiz = Quiz.objects.create(
                course=course,
                title=f"Final Assessment: {course.title}"
            )
            
            # Add 3 questions to each quiz
            for q_num in range(1, 4):
                question = Question.objects.create(
                    quiz=quiz,
                    text=f"Which of the following is a core concept in {course.title}?"
                )
                
                # Add 4 choices
                correct_idx = random.randint(0, 3)
                for c_num in range(4):
                    Choice.objects.create(
                        question=question,
                        text=f"Option {c_num+1} for Question {q_num}",
                        is_correct=(c_num == correct_idx)
                    )

        # 6. Create Enrollments and Progress
        self.stdout.write("Creating enrollments & progress...")
        Enrollment.objects.all().delete()
        
        for student in students:
            # Enroll each student in 2-4 random courses
            enrolled_courses = random.sample(courses, random.randint(2, 4))
            for course in enrolled_courses:
                course_videos = list(Video.objects.filter(course=course).order_by('order'))
                if not course_videos:
                    continue
                    
                # Determine random progress status (Not Started, In Progress, Completed)
                status_choice = random.choices(['Not Started', 'In Progress', 'Completed'], weights=[20, 50, 30])[0]
                
                if status_choice == 'Not Started':
                    progress = 0
                    last_watched = None
                    videos_to_complete = 0
                elif status_choice == 'Completed':
                    progress = 100
                    last_watched = course_videos[-1]
                    videos_to_complete = len(course_videos)
                else: # In Progress
                    progress = random.randint(10, 90)
                    # Rough calculation of videos watched based on progress %
                    videos_to_complete = int(len(course_videos) * (progress / 100))
                    if videos_to_complete == 0 and progress > 0:
                        videos_to_complete = 1
                    last_watched = course_videos[videos_to_complete-1] if videos_to_complete > 0 else course_videos[0]

                enrollment = Enrollment.objects.create(
                    student=student,
                    course=course,
                    progress=progress,
                    status=status_choice,
                    last_watched_video=last_watched
                )
                
                # Create VideoProgress records
                for v_idx in range(videos_to_complete):
                    VideoProgress.objects.create(
                        student=student,
                        video=course_videos[v_idx],
                        is_completed=True
                    )
                
                # If completed, maybe they passed the quiz and got a certificate?
                if status_choice == 'Completed' and hasattr(course, 'quiz'):
                    if random.random() > 0.3: # 70% chance of taking quiz if course completed
                        from core.models import QuizAttempt, Certificate
                        QuizAttempt.objects.create(
                            student=student,
                            quiz=course.quiz,
                            score=random.randint(70, 100),
                            passed=True
                        )
                        Certificate.objects.create(
                            student=student,
                            course=course
                        )
        
        self.stdout.write(self.style.SUCCESS("Successfully seeded the database!"))
        self.stdout.write("Created:")
        self.stdout.write("- 1 Admin (admin / password123)")
        self.stdout.write("- 4 Trainers (trainer1...4 / password123)")
        self.stdout.write("- 10 Students (student1...10 / password123)")
        self.stdout.write(f"- {len(categories)} Categories")
        self.stdout.write(f"- {len(courses)} Courses with videos and quizzes")
