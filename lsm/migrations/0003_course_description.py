from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lsm", "0002_course_video_delete_testmodel"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="description",
            field=models.TextField(blank=True, default=""),
        ),
    ]
