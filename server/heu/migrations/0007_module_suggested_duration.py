# Generated by Django 4.2.4 on 2024-08-07 19:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('heu', '0006_hardcodedquestioncounter_module_modulecounter_phase_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='module',
            name='suggested_duration',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
