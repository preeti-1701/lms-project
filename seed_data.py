"""
Seed the database with demo users, courses, lessons, and quizzes.
Run with: python manage.py shell < seed_data.py
Or via management command.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_core.settings')
django.setup()

from core.models import User, Course, Lesson, Quiz, Question, Enrollment, LessonProgress


print("🌱 Seeding Coursify database...")

# Clear existing demo data (keep superuser)
print("  Clearing old demo data...")
User.objects.filter(is_superuser=False).delete()
Course.objects.all().delete()

# ============= INSTRUCTORS =============
print("  Creating instructors...")
instructor1 = User.objects.create_user(
    username='priya_sharma',
    email='priya@newgen.com',
    password='demo1234',
    first_name='Priya',
    last_name='Sharma',
    role='instructor',
    avatar_color='#ff6b4a',
    bio='Python backend developer with 8 years of experience. Ex-Flipkart.',
)

instructor2 = User.objects.create_user(
    username='rahul_verma',
    email='rahul@newgen.com',
    password='demo1234',
    first_name='Rahul',
    last_name='Verma',
    role='instructor',
    avatar_color='#8b5cf6',
    bio='Full-stack engineer, open source contributor.',
)

instructor3 = User.objects.create_user(
    username='anita_iyer',
    email='anita@newgen.com',
    password='demo1234',
    first_name='Anita',
    last_name='Iyer',
    role='instructor',
    avatar_color='#c7f443',
    bio='Data scientist and ML educator.',
)

# ============= STUDENTS =============
print("  Creating students...")
student1 = User.objects.create_user(
    username='student_demo',
    email='student@demo.com',
    password='demo1234',
    first_name='Jyotsna',
    last_name='',
    role='student',
    avatar_color='#6366f1',
    is_verified=True,
)

student2 = User.objects.create_user(
    username='sara_mehta',
    email='sara@demo.com',
    password='demo1234',
    first_name='Sara',
    last_name='Mehta',
    role='student',
    avatar_color='#ec4899',
    is_verified=True,
)

student3 = User.objects.create_user(
    username='vikram_singh',
    email='vikram@demo.com',
    password='demo1234',
    first_name='Vikram',
    last_name='Singh',
    role='student',
    avatar_color='#14b8a6',
    is_verified=True,
)

# ============= COURSES =============
print("  Creating courses...")

# Course 1: Python Fundamentals
c1 = Course.objects.create(
    title='Python Fundamentals for Backend Developers',
    description='Master Python from the ground up with a backend-first approach. Cover data types, functions, OOP, file handling, and modern Python features used daily in production backend systems.',
    instructor=instructor1,
    level='beginner',
    category='Python',
    thumbnail_emoji='🐍',
    accent_color='#c7f443',
)

lessons_c1 = [
    ('Introduction to Python', 'Python is a high-level, interpreted programming language known for its readable syntax and versatility. It powers web apps, data pipelines, ML systems, and more.\n\nIn this lesson we will cover:\n\n1. Why Python is the go-to language for backend development\n2. Installing Python and setting up your environment\n3. Running your first script\n4. Using the interactive REPL\n\nPython\'s design philosophy emphasizes code readability with its use of significant whitespace. Its syntax allows programmers to express concepts in fewer lines of code than would be possible in languages like C++ or Java.', 15),
    ('Variables and Data Types', 'Python has several built-in data types: integers, floats, strings, booleans, lists, tuples, dictionaries, and sets.\n\nVariables in Python are dynamically typed — you do not need to declare them with a type. Python figures it out at runtime.\n\nExample:\n\n    name = "Priya"\n    age = 28\n    is_instructor = True\n    skills = ["Python", "Django", "SQL"]\n\nLists are ordered and mutable. Tuples are ordered and immutable. Dictionaries store key-value pairs. Sets store unique elements.', 20),
    ('Functions and Scope', 'Functions are first-class objects in Python, meaning they can be passed around just like any other value. This is a powerful feature you will use every day as a backend developer.\n\n    def greet(name, greeting="Hello"):\n        return f"{greeting}, {name}!"\n\nPython supports:\n- Default arguments\n- Keyword arguments\n- Variable-length *args and **kwargs\n- Lambda (anonymous) functions\n- Nested functions and closures\n\nUnderstanding variable scope (LEGB rule — Local, Enclosing, Global, Built-in) is crucial when writing correct code.', 25),
    ('Object-Oriented Programming', 'OOP in Python is built around four core concepts: encapsulation, inheritance, polymorphism, and abstraction.\n\nA class is a blueprint. An object is an instance of that class.\n\n    class Course:\n        def __init__(self, title, instructor):\n            self.title = title\n            self.instructor = instructor\n\n        def __str__(self):\n            return f"{self.title} by {self.instructor}"\n\nDjango heavily uses OOP — every model, view, and form is a class. Understanding inheritance, __init__, and method overriding is essential.', 30),
    ('Working with Files and Modules', 'Python makes file I/O straightforward with the built-in open() function and context managers.\n\n    with open("data.txt", "r") as f:\n        content = f.read()\n\nThe `with` statement ensures the file is closed properly, even if errors occur.\n\nModules let you organize code into reusable files. Packages are directories containing multiple modules. The Python Package Index (PyPI) hosts hundreds of thousands of third-party packages you can install with pip.', 20),
]
for i, (title, content, duration) in enumerate(lessons_c1, 1):
    Lesson.objects.create(course=c1, title=title, content=content, order=i, duration_minutes=duration)

# Course 2: Django REST Framework
c2 = Course.objects.create(
    title='Django & REST API Masterclass',
    description='Build production-grade REST APIs with Django and Django REST Framework. Learn serializers, viewsets, authentication, permissions, and deployment.',
    instructor=instructor1,
    level='intermediate',
    category='Django',
    thumbnail_emoji='🎯',
    accent_color='#ff6b4a',
)

lessons_c2 = [
    ('Django Project Structure', 'A Django project is organized into a main project folder and one or more apps. The project holds configuration (settings, root URLs). Each app is a self-contained module for a specific feature.\n\nKey files:\n- manage.py — command-line utility\n- settings.py — project config\n- urls.py — URL routing\n- wsgi.py / asgi.py — deployment entry points\n\nEach app typically has: models.py, views.py, urls.py, admin.py, serializers.py (for DRF), and a migrations folder.', 20),
    ('Models and Migrations', 'Django\'s ORM lets you define your database schema using Python classes. Each model becomes a table.\n\n    class Course(models.Model):\n        title = models.CharField(max_length=200)\n        instructor = models.ForeignKey(User, on_delete=models.CASCADE)\n        created_at = models.DateTimeField(auto_now_add=True)\n\nRun `makemigrations` to generate a migration file, then `migrate` to apply it. Migrations are version control for your database schema.', 25),
    ('Serializers and ViewSets', 'Serializers convert Django model instances to JSON (and back). ViewSets bundle common CRUD operations into a single class.\n\n    class CourseSerializer(serializers.ModelSerializer):\n        class Meta:\n            model = Course\n            fields = "__all__"\n\n    class CourseViewSet(viewsets.ModelViewSet):\n        queryset = Course.objects.all()\n        serializer_class = CourseSerializer\n\nWith just this, you get list, create, retrieve, update, and delete endpoints for free.', 30),
    ('Authentication and Permissions', 'DRF supports multiple auth schemes: Session, Token, JWT. You configure them in settings and per-view.\n\nPermissions control access: IsAuthenticated, IsAdminUser, or custom classes that check roles.\n\n    class IsInstructor(permissions.BasePermission):\n        def has_permission(self, request, view):\n            return request.user.is_authenticated and request.user.role == "instructor"\n\nApply with `permission_classes = [IsInstructor]` on your view.', 25),
]
for i, (title, content, duration) in enumerate(lessons_c2, 1):
    Lesson.objects.create(course=c2, title=title, content=content, order=i, duration_minutes=duration)

# Course 3: Database Design
c3 = Course.objects.create(
    title='Database Design & SQL for Backend',
    description='Design normalized relational schemas and write efficient queries. Covers PostgreSQL, indexing, transactions, and common pitfalls.',
    instructor=instructor2,
    level='intermediate',
    category='Databases',
    thumbnail_emoji='🗄️',
    accent_color='#8b5cf6',
)

lessons_c3 = [
    ('Relational Database Fundamentals', 'A relational database stores data in tables (relations) connected by keys. Each row is a record, each column an attribute.\n\nCore concepts:\n- Primary Key: uniquely identifies each row\n- Foreign Key: references another table\n- Constraints: rules (NOT NULL, UNIQUE, CHECK)\n\nPopular RDBMS: PostgreSQL, MySQL, SQLite. For production backends, PostgreSQL is usually the best choice.', 20),
    ('Normalization', 'Normalization removes redundancy and prevents anomalies. Most apps aim for 3rd Normal Form (3NF).\n\n1NF: Each cell has one atomic value\n2NF: No partial dependencies on a composite primary key\n3NF: No transitive dependencies — non-key columns depend only on the primary key\n\nDenormalization (intentionally breaking the rules) is sometimes used for read-heavy analytics workloads.', 25),
    ('SQL JOINs Explained', 'JOINs combine rows from multiple tables.\n\n- INNER JOIN: only matching rows from both tables\n- LEFT JOIN: all rows from left, matched rows from right (NULL if no match)\n- RIGHT JOIN: opposite of LEFT\n- FULL OUTER JOIN: all rows from both\n\n    SELECT c.title, u.username\n    FROM courses c\n    INNER JOIN users u ON c.instructor_id = u.id\n    WHERE c.is_published = TRUE;', 30),
    ('Indexes and Query Optimization', 'Indexes speed up reads but slow down writes. Create them on columns you filter or join on frequently.\n\nUse EXPLAIN to see how the database executes your query. Look for:\n- Sequential scans on large tables (bad)\n- Index scans (good)\n- High-cost sorts or nested loops\n\nAvoid SELECT * in production code — fetch only the columns you need.', 25),
]
for i, (title, content, duration) in enumerate(lessons_c3, 1):
    Lesson.objects.create(course=c3, title=title, content=content, order=i, duration_minutes=duration)

# Course 4: ML Intro
c4 = Course.objects.create(
    title='Machine Learning for Engineers',
    description='A practical intro to ML for software engineers. Understand the core algorithms, when to use them, and how to integrate ML models into backend systems.',
    instructor=instructor3,
    level='beginner',
    category='Machine Learning',
    thumbnail_emoji='🤖',
    accent_color='#14b8a6',
)

lessons_c4 = [
    ('What is Machine Learning?', 'ML is about building systems that learn patterns from data rather than being explicitly programmed. Three broad categories:\n\n1. Supervised learning: labeled data (classification, regression)\n2. Unsupervised learning: no labels (clustering, dimensionality reduction)\n3. Reinforcement learning: learning by trial and reward\n\nMost production ML at companies is supervised. Think fraud detection, recommendations, spam filters.', 20),
    ('The ML Workflow', 'Every ML project follows a similar loop:\n\n1. Define the problem\n2. Collect and clean data\n3. Split into train/validation/test sets\n4. Choose a model\n5. Train and evaluate\n6. Iterate\n7. Deploy to production\n\n80 percent of the work is usually data preparation. Models are the fun part, but garbage in = garbage out.', 25),
    ('Linear Regression Explained', 'Linear regression fits a line to your data to predict a continuous value.\n\nFormula: y = wx + b\n\nIt learns the weights w and bias b by minimizing the mean squared error between predictions and actual values. Despite its simplicity, it is used everywhere — house price prediction, sales forecasting, and more.', 25),
]
for i, (title, content, duration) in enumerate(lessons_c4, 1):
    Lesson.objects.create(course=c4, title=title, content=content, order=i, duration_minutes=duration)

# Course 5: Git & Collaboration
c5 = Course.objects.create(
    title='Git, GitHub & Team Workflows',
    description='Stop being scared of git. Learn branches, merges, rebasing, PRs, and how real teams collaborate on code.',
    instructor=instructor2,
    level='beginner',
    category='Tools',
    thumbnail_emoji='🌿',
    accent_color='#fbbf24',
)

lessons_c5 = [
    ('Git Basics', 'Git is a distributed version control system. Every developer has a full copy of the repo history.\n\nCore commands:\n- git init — start a new repo\n- git add — stage changes\n- git commit — save a snapshot\n- git push — send to remote\n- git pull — get latest from remote\n\nA commit is a snapshot of your entire project at a moment in time, identified by a unique SHA hash.', 20),
    ('Branching and Merging', 'Branches let multiple people work on different features without stepping on each other.\n\n    git checkout -b feature/login\n    # make changes, commit\n    git push origin feature/login\n\nWhen done, open a Pull Request. After review, merge it into main. Popular strategies: Gitflow, trunk-based development, GitHub flow.', 25),
    ('Handling Conflicts', 'Merge conflicts happen when two branches change the same lines. Git cannot decide — you have to.\n\nOpen the conflicted file. Find the markers:\n\n    <<<<<<< HEAD\n    your changes\n    =======\n    their changes\n    >>>>>>> branch\n\nEdit to the desired result, remove the markers, stage the file, and commit. Never panic — conflicts are normal.', 20),
]
for i, (title, content, duration) in enumerate(lessons_c5, 1):
    Lesson.objects.create(course=c5, title=title, content=content, order=i, duration_minutes=duration)

# Course 6: JavaScript basics
c6 = Course.objects.create(
    title='Modern JavaScript Essentials',
    description='Everything a backend dev needs to know about JavaScript to build full-stack apps without feeling lost on the frontend.',
    instructor=instructor2,
    level='beginner',
    category='JavaScript',
    thumbnail_emoji='⚡',
    accent_color='#ec4899',
)
lessons_c6 = [
    ('JavaScript Fundamentals', 'JavaScript runs in browsers and on servers (via Node.js). Variables use `let` and `const`. Functions can be regular or arrow functions.\n\n    const add = (a, b) => a + b;\n\nJS has dynamic typing, just like Python, but with different quirks. Master === vs ==, truthy/falsy values, and type coercion.', 20),
    ('Async and Promises', 'JavaScript is single-threaded but handles async with the event loop.\n\n    async function fetchData() {\n        const response = await fetch("/api/courses/");\n        return response.json();\n    }\n\nPromises are the foundation. async/await makes them readable. Understanding this is essential for any frontend-backend integration.', 25),
]
for i, (title, content, duration) in enumerate(lessons_c6, 1):
    Lesson.objects.create(course=c6, title=title, content=content, order=i, duration_minutes=duration)


# ============= VIDEO URLS (for YouTube embed demo per SRS §3.3) =============
# Real, free educational YouTube videos — using embed URLs so they play inline
video_urls = {
    c1: 'https://www.youtube.com/embed/rfscVS0vtbw',   # Python full course
    c2: 'https://www.youtube.com/embed/F5mRW0jo-U4',   # Django crash course
    c3: 'https://www.youtube.com/embed/HXV3zeQKqGY',   # SQL tutorial
    c4: 'https://www.youtube.com/embed/i_LwzRVP7bg',   # ML intro
    c5: 'https://www.youtube.com/embed/RGOj5yH7evk',   # Git tutorial
    c6: 'https://www.youtube.com/embed/hdI2bqOjy3c',   # JS crash course
}
for course, url in video_urls.items():
    # Add video URL to the first lesson of each course
    first_lesson = course.lessons.order_by('order').first()
    if first_lesson:
        first_lesson.video_url = url
        first_lesson.save()


# ============= QUIZZES =============
print("  Creating quizzes...")

quiz1 = Quiz.objects.create(
    course=c1,
    title='Python Fundamentals Check',
    description='Test your understanding of Python basics',
    pass_score=60,
)
Question.objects.create(quiz=quiz1, text='Which of the following is a mutable data type in Python?', choice_a='tuple', choice_b='str', choice_c='list', choice_d='int', correct_answer='C', order=1)
Question.objects.create(quiz=quiz1, text='What does the `with` statement do when working with files?', choice_a='Opens a file', choice_b='Automatically closes the file after use', choice_c='Deletes the file', choice_d='Copies the file', correct_answer='B', order=2)
Question.objects.create(quiz=quiz1, text='Which keyword is used to define a function in Python?', choice_a='function', choice_b='def', choice_c='fun', choice_d='define', correct_answer='B', order=3)
Question.objects.create(quiz=quiz1, text='What is the output of `type([])`?', choice_a="<class 'list'>", choice_b="<class 'tuple'>", choice_c="<class 'dict'>", choice_d="<class 'set'>", correct_answer='A', order=4)
Question.objects.create(quiz=quiz1, text='Which of the following is NOT a principle of OOP?', choice_a='Encapsulation', choice_b='Inheritance', choice_c='Polymorphism', choice_d='Compilation', correct_answer='D', order=5)

quiz2 = Quiz.objects.create(
    course=c2,
    title='Django REST Framework Quiz',
    description='How well do you know DRF?',
    pass_score=70,
)
Question.objects.create(quiz=quiz2, text='What does a Serializer do in DRF?', choice_a='Handles URL routing', choice_b='Converts model instances to JSON and validates input', choice_c='Manages database migrations', choice_d='Runs the server', correct_answer='B', order=1)
Question.objects.create(quiz=quiz2, text='Which class provides all CRUD operations in one?', choice_a='APIView', choice_b='ViewSet', choice_c='ModelViewSet', choice_d='GenericView', correct_answer='C', order=2)
Question.objects.create(quiz=quiz2, text='What is the purpose of `makemigrations`?', choice_a='Apply changes to the database', choice_b='Generate migration files from model changes', choice_c='Delete the database', choice_d='Run tests', correct_answer='B', order=3)

# ============= ENROLLMENTS =============
print("  Creating enrollments with progress...")

# Student 1 enrolled in c1 with 60% progress
e1 = Enrollment.objects.create(student=student1, course=c1)
for lesson in c1.lessons.all()[:3]:  # complete first 3 of 5
    LessonProgress.objects.create(enrollment=e1, lesson=lesson, is_completed=True)

# Student 1 also enrolled in c2
e2 = Enrollment.objects.create(student=student1, course=c2)
for lesson in c2.lessons.all()[:1]:  # complete 1 of 4
    LessonProgress.objects.create(enrollment=e2, lesson=lesson, is_completed=True)

# Student 1 enrolled in c5 and completed fully
e3 = Enrollment.objects.create(student=student1, course=c5)
for lesson in c5.lessons.all():
    LessonProgress.objects.create(enrollment=e3, lesson=lesson, is_completed=True)
e3.check_completion()

# Student 2 enrolled in several
Enrollment.objects.create(student=student2, course=c1)
Enrollment.objects.create(student=student2, course=c3)
e_s2_c4 = Enrollment.objects.create(student=student2, course=c4)
for lesson in c4.lessons.all()[:2]:
    LessonProgress.objects.create(enrollment=e_s2_c4, lesson=lesson, is_completed=True)

# Student 3
Enrollment.objects.create(student=student3, course=c2)
Enrollment.objects.create(student=student3, course=c6)

print("✓ Seeding complete!")
print()
print("=" * 60)
print("DEMO ACCOUNTS (password for all: demo1234)")
print("=" * 60)
print("Students:    student_demo / sara_mehta / vikram_singh")
print("Instructors: priya_sharma / rahul_verma / anita_iyer")
print("Admin:       admin (password: admin)")
print("=" * 60)
