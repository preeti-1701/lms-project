from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lsm", "0003_course_description"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="image_url",
            field=models.URLField(blank=True, default=""),
        ),
    ]
