# Generated by Django 4.2.4 on 2024-07-30 18:29

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('heu', '0004_alter_session_instructors'),
    ]

    operations = [
        migrations.AlterField(
            model_name='session',
            name='instructors',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=255), blank=True, default=list, null=True, size=None),
        ),
    ]
