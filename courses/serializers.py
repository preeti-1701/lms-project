from os import link

from rest_framework import serializers
from .models import Course, Video


class VideoSerializer(serializers.ModelSerializer):
    embed_url = serializers.SerializerMethodField()
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ['id', 'title', 'youtube_link', 'embed_url' , 'completed']

    def get_embed_url(self, obj):
        link = obj.youtube_link

        # Case 1: normal YouTube link
        if "watch?v=" in link:
            video_id = link.split("watch?v=")[-1].split("&")[0]
            return f"https://www.youtube.com/embed/{video_id}"

    # Case 2: short youtu.be link
        elif "youtu.be/" in link:
            video_id = link.split("youtu.be/")[-1].split("?")[0]
            return f"https://www.youtube.com/embed/{video_id}"

        return link
    
    def get_completed(self, obj):
        # Check if the current user has a completed record for this video
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Import VideoProgress at the top of this file: from .models import Course, Video, VideoProgress
            from .models import VideoProgress 
            return VideoProgress.objects.filter(user=request.user, video=obj, is_completed=True).exists()
        return False


class CourseSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)
    assigned_students = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'videos' , 'assigned_students']