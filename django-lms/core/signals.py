from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Profile, Role


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def ensure_profile_and_role(sender, instance, created, **kwargs):
    if not created:
        return
    Profile.objects.get_or_create(user=instance, defaults={"full_name": instance.get_full_name() or ""})
    # Superusers (e.g. createsuperuser) become admin; everyone else defaults to student.
    role = Role.ADMIN if instance.is_superuser else Role.STUDENT
    Role.objects.get_or_create(user=instance, role=role)
