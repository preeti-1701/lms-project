from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_course_trainer'),
    ]

    operations = [
        migrations.CreateModel(
            name='SecurityNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('screenshot', 'Screenshot Attempt'), ('screen_record', 'Screen Recording Attempt'), ('print', 'Print Attempt'), ('watermark', 'Watermark Detection'), ('right_click', 'Right Click Attempt'), ('download', 'Download Attempt')], max_length=20)),
                ('description', models.TextField()),
                ('user_agent', models.CharField(blank=True, max_length=500, null=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_read', models.BooleanField(default=False)),
                ('course', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='security_notifications', to='core.course')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='security_notifications', to='core.user')),
                ('video', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='security_notifications', to='core.video')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
