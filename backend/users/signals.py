from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Profile, UserSession


User = get_user_model()


@receiver(post_save, sender=User)
def ensure_profile_and_session(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
        UserSession.objects.get_or_create(user=instance)
