"""Signals: ensure superusers always get the admin role."""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User


@receiver(post_save, sender=User)
def promote_superuser(sender, instance, created, **kwargs):
    if instance.is_superuser and instance.role != User.ROLE_ADMIN:
        User.objects.filter(pk=instance.pk).update(role=User.ROLE_ADMIN)
