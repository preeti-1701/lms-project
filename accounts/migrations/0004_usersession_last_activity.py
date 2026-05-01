from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_rename_login_time_usersession_created_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='usersession',
            name='last_activity',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]