# Generated by Django 4.2.4 on 2024-08-09 15:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('heu', '0002_session_canceled_instructors_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='session',
            name='instructors',
        ),
    ]