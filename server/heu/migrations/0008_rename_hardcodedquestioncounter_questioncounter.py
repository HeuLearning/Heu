# Generated by Django 4.2.4 on 2024-08-07 19:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('heu', '0007_module_suggested_duration'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='HardCodedQuestionCounter',
            new_name='QuestionCounter',
        ),
    ]