# Generated by Django 4.2.4 on 2024-08-07 19:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('heu', '0008_rename_hardcodedquestioncounter_questioncounter'),
    ]

    operations = [
        migrations.CreateModel(
            name='HardCodedQuestionCounter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField()),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='heu.question')),
            ],
        ),
        migrations.DeleteModel(
            name='QuestionCounter',
        ),
        migrations.AlterField(
            model_name='module',
            name='questions',
            field=models.ManyToManyField(related_name='question_counter', to='heu.hardcodedquestioncounter'),
        ),
    ]
