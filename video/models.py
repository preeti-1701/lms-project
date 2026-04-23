from django.db import models
from courses.models import Lesson


class Video(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='video')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    youtube_url = models.URLField()
    youtube_embed_url = models.CharField(max_length=300, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.youtube_url and 'watch?v=' in self.youtube_url:
            video_id = self.youtube_url.split('watch?v=')[-1].split('&')[0]
            self.youtube_embed_url = f'https://www.youtube.com/embed/{video_id}'
        elif self.youtube_url and 'youtu.be/' in self.youtube_url:
            video_id = self.youtube_url.split('youtu.be/')[-1].split('?')[0]
            self.youtube_embed_url = f'https://www.youtube.com/embed/{video_id}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Video: {self.lesson.title}"

    @property
    def duration_display(self):
        mins, secs = divmod(self.duration_seconds, 60)
        return f"{mins}m {secs}s"