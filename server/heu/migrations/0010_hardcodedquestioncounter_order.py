# Generated by Django 4.2.4 on 2024-07-18 16:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('heu', '0009_hardcodedquestioncounter_delete_hardcodedquestion_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='hardcodedquestioncounter',
            name='order',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]