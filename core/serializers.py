from rest_framework import serializers
from .models import User, Course, Lesson, Enrollment, LessonProgress, Quiz, Question, QuizAttempt


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'bio']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'course', 'title', 'content', 'video_url', 'order', 'duration_minutes']


class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    lesson_count = serializers.IntegerField(read_only=True)
    enrollment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'instructor',
            'level', 'category', 'thumbnail_emoji', 'accent_color',
            'is_published', 'lesson_count', 'enrollment_count', 'created_at'
        ]


class CourseDetailSerializer(CourseSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quizzes = serializers.SerializerMethodField()

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['lessons', 'quizzes']

    def get_quizzes(self, obj):
        return [
            {'id': q.id, 'title': q.title, 'pass_score': q.pass_score, 'question_count': q.question_count}
            for q in obj.quizzes.all()
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    progress_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'enrolled_at', 'completed', 'progress_percent']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'choice_a', 'choice_b', 'choice_c', 'choice_d', 'order']
        # correct_answer is intentionally excluded from students


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'course', 'title', 'description', 'pass_score', 'question_count', 'questions']


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'student', 'quiz', 'score', 'passed', 'attempted_at']
        read_only_fields = ['student', 'score', 'passed', 'attempted_at']
