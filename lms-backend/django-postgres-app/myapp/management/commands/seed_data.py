"""
Management command: python manage.py seed_data

Creates demo users, courses, and videos so you can log in immediately
after running migrations. Safe to run multiple times (uses get_or_create).
"""

from django.core.management.base import BaseCommand
from myapp.models import CustomUser, Course, Video


SEED_USERS = [
    {
        "email": "student@eduverse.com",
        "name": "Aarav Sharma",
        "mobile": "9876543210",
        "password": "Student@123",
        "role": "student",
        "interests": ["web", "ai"],
    },
    {
        "email": "trainer@eduverse.com",
        "name": "Priya Mehta",
        "mobile": "9123456780",
        "password": "Trainer@123",
        "role": "trainer",
        "subject": "Python & Data Science",
        "bio": "Experienced Python developer with 8+ years in data science.",
        "qualification": "M.Tech Computer Science",
        "experience": "8 years",
    },
    {
        "email": "admin@eduverse.com",
        "name": "System Admin",
        "mobile": "9000000001",
        "password": "Admin@123",
        "role": "admin",
        "is_staff": True,
        "is_superuser": True,
    },
]

SEED_COURSES = [
    {
        "title": "Python Fundamentals",
        "description": "Learn Python from scratch with hands-on projects.",
        "category": "Data Science",
        "icon": "🐍",
        "trainer_email": "trainer@eduverse.com",
        "videos": [
            {"title": "Introduction to Python",   "url": "https://www.youtube.com/watch?v=rfscVS0vtbw", "duration": "4:26:52", "order": 1},
            {"title": "Python Data Types",        "url": "https://www.youtube.com/watch?v=gfDE2a7MKjA", "duration": "15:42",   "order": 2},
            {"title": "Control Flow",             "url": "https://www.youtube.com/watch?v=NE97ylAnrz4", "duration": "22:10",   "order": 3},
        ],
    },
    {
        "title": "React JS Masterclass",
        "description": "Build modern web apps with React and hooks.",
        "category": "Web Development",
        "icon": "⚛️",
        "trainer_email": "trainer@eduverse.com",
        "videos": [
            {"title": "React Basics",    "url": "https://www.youtube.com/watch?v=Tn6-PIqc4UM", "duration": "1:07:35", "order": 1},
            {"title": "Hooks Deep Dive", "url": "https://www.youtube.com/watch?v=O6P86uwfdR0", "duration": "35:20",   "order": 2},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with demo LMS data (users, courses, videos)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding users…"))
        user_map = {}
        for ud in SEED_USERS:
            extra = {k: v for k, v in ud.items() if k not in ("email", "password", "role")}
            user, created = CustomUser.objects.get_or_create(
                email=ud["email"],
                defaults={"role": ud["role"], **extra},
            )
            if created:
                user.set_password(ud["password"])
                user.save()
                self.stdout.write(f"  ✓ Created {user.role}: {user.email}")
            else:
                self.stdout.write(f"  — Already exists: {user.email}")
            user_map[ud["email"]] = user

        self.stdout.write(self.style.MIGRATE_HEADING("Seeding courses & videos…"))
        for cd in SEED_COURSES:
            trainer = user_map.get(cd["trainer_email"])
            course, created = Course.objects.get_or_create(
                title=cd["title"],
                defaults={
                    "description": cd["description"],
                    "category": cd["category"],
                    "icon": cd["icon"],
                    "trainer": trainer,
                },
            )
            if created:
                self.stdout.write(f"  ✓ Created course: {course.title}")
                for vd in cd["videos"]:
                    Video.objects.create(course=course, **vd)
                    self.stdout.write(f"      + Video: {vd['title']}")
            else:
                self.stdout.write(f"  — Already exists: {course.title}")

        self.stdout.write(self.style.SUCCESS("\n✅ Seeding complete!\n"))
        self.stdout.write("  Login credentials:")
        self.stdout.write("  Student  → student@eduverse.com  / Student@123")
        self.stdout.write("  Trainer  → trainer@eduverse.com  / Trainer@123")
        self.stdout.write("  Admin    → admin@eduverse.com    / Admin@123")
