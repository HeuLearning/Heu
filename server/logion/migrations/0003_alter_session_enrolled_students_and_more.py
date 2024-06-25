from django.db import migrations, models
from django.contrib.postgres.fields import ArrayField

class Migration(migrations.Migration):

    dependencies = [
        ('logion', '0002_rename_learning_center_admindata_learning_organization'),
    ]

    operations = [
        # Remove existing fields
        migrations.RemoveField(
            model_name='session',
            name='enrolled_students',
        ),
        migrations.RemoveField(
            model_name='session',
            name='waitlist_students',
        ),
        
        # Add new fields as ArrayFields
        migrations.AddField(
            model_name='session',
            name='enrolled_students',
            field=ArrayField(models.CharField(max_length=255), blank=True, default=list),
        ),
        migrations.AddField(
            model_name='session',
            name='waitlist_students',
            field=ArrayField(models.CharField(max_length=255), blank=True, default=list),
        ),
    ]