from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator 
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField

# Create your models here.
class CustomUser(AbstractUser):
    user_id = models.CharField(null=False, max_length=255)
    first_name = models.CharField(null=False, max_length=255)
    last_name = models.CharField(null=False, max_length=255)
    TYPE_CHOICES = [
        ("ad",'admin'),
       ( "in", 'instructor'),
        ("st", 'student'),
        ("hs", 'heu-staff')
    ]
    user_type = models.CharField(null=False, max_length=255, choices=TYPE_CHOICES)
    def __str__(self):
        return f'{self.username}, {self.user_type}'

class InstructorData(models.Model):
    user_id = models.CharField(null=False, max_length=255)
    verified = models.BooleanField(null=False, default=False)
    def __str__(self):
        return f'{self.user_id}, {self.verified}'

class StudentData(models.Model):
    user_id = models.CharField(null=False, max_length=255)
    verified = models.BooleanField(null=False, default=False)
    def __str__(self):
        return f'{self.user_id}, {self.verified}'
    
class HeuStaffData(models.Model):
    user_id = models.CharField(null=False, max_length=255)
    verified = models.BooleanField(null=False, default=False)
    def __str__(self):
        return f'{self.user_id}, {self.verified}'
    
# using the lookup index will be iff question number is variable
class LookupIndex(models.Model):
    custom_id = models.IntegerField(null=False)
    format = models.CharField(max_length=2, null=False)
    def __str__(self):
        return f'{self.pk} {self.custom_id} {self.format}'

class Question(models.Model):
    custom_id = models.IntegerField(primary_key=True)
    text = models.TextField(blank=True)
    audio = models.TextField(blank=True)
    image = models.TextField(blank=True)
    json = models.JSONField(null=False)

class LearningOrganization(models.Model):
    name = models.CharField(blank=False, max_length=255)

class LearningOrganizationLocation(models.Model):
    name = models.CharField(blank=False, max_length=255)
    learning_organization = models.ForeignKey(LearningOrganization, on_delete=models.RESTRICT)

class Room(models.Model):
    name = models.CharField(blank = False, max_length=255)
    max_capacity = models.IntegerField(null=False)
    learning_organization = models.ForeignKey(LearningOrganization, on_delete=models.RESTRICT)
    location = models.ForeignKey(LearningOrganizationLocation, on_delete=models.RESTRICT)

class AdminData(models.Model):
    user_id = models.CharField(null=False, max_length=255)
    verified = models.BooleanField(null=False, default=False)
    learning_organization = models.ForeignKey(LearningOrganization, default=1, on_delete=models.RESTRICT)
    def __str__(self):
        return f'{self.user_id}, {self.verified} {self.learning_organization.name}'
    
class Assessment(models.Model):
    user_id = models.CharField(null=False, max_length=255)
    num_attempts = models.PositiveIntegerField(null=False, validators=[MinValueValidator(1)])
    questions = models.JSONField(default=dict)
    def __str__(self):
        return f'{self.user_id} {self.num_attempts}'

class SessionPrerequisites(models.Model):
    num_meetings_per_week = models.IntegerField(default=5)
    learning_organization = models.ForeignKey(LearningOrganization, on_delete=models.CASCADE)
    def __str__(self):
        return f'{self.num_meetings_per_week}'
    
class Session(models.Model):
    admin_creator = models.ForeignKey(AdminData, null=True, on_delete=models.SET_NULL)
    viewed = models.BooleanField(default=False)
    approved = models.BooleanField(default=False)
    learning_organization = models.ForeignKey(LearningOrganization, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    enrolled_students = ArrayField(
        models.CharField(max_length=255),  # This will store CustomUser IDs
        blank=True,
        default=list
    )
    waitlist_students = ArrayField(
        models.CharField(max_length=255),  # This will store CustomUser IDs
        blank=True,
        default=list
    )
    def __str__(self):
        return f'{self.admin_creator} {self.learning_organization.name} {self.viewed} {self.approved}'

class InstructorApplicationTemplate(models.Model):
    admin_creator = models.ForeignKey(AdminData, null=True,on_delete=models.SET_NULL)
    learning_organization_location = models.ForeignKey(LearningOrganizationLocation, on_delete=models.CASCADE) 
    google_form_link = models.URLField(blank=False, null=False)
    active = models.BooleanField(default=True)
    def __str__(self):
        return f'{self.id} {self.google_form_link}'

class InstructorApplicationInstance(models.Model):
    template = models.ForeignKey(InstructorApplicationTemplate, on_delete=models.CASCADE)
    instructor_id = models.ForeignKey(InstructorData, on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    def __str__(self):
        return f'{self.id} {self.instructor_id} {self.accepted}'


# class MCText(models.Model):
#     text = models.TextField(null=False)
#     blank_index = models.IntegerField(null=False)
#     replacements = models.JSONField(null=False)
#     question_id = models.OneToOneField(
#         Question,
#         on_delete=models.CASCADE,
#         primary_key=True,
#     )
#     def __str__(self):
#         return f'{self.text}, remove: {self.text.split()[self.blank_index]}: alternatives:{self.replacements}'

# class Author(models.Model):
#     first_name = models.CharField(null=True, blank=True, max_length=200)
#     last_name = models.CharField(null=False, max_length=200)
#     birth_year = models.IntegerField(null=True, blank=True,)
#     death_year = models.IntegerField(null=True, blank=True)
#     genre = models.CharField(null=True, blank=True, max_length=200)

#     def __str__(self):
#         return f'{self.last_name}, {self.first_name}. from {self.birth_year} to {self.death_year}. genre: {self.genre}'

# class Text(models.Model):
#     title = models.TextField(null=False)
#     body = models.TextField(null=False)
#     author = models.ForeignKey(Author, on_delete=models.CASCADE)
#     publish_date = models.DateField(null=True, blank=True)

#     def __str__(self):
#         return f'{self.title} {self.pk} by {self.author.first_name} {self.author.last_name}. body: {self.body[0:20]}'

# class Suggestion(models.Model):
#     text = models.ForeignKey(Text, on_delete=models.CASCADE)
#     number_good = models.IntegerField(default=0)
#     number_ok = models.IntegerField(default=0)
#     number_bad = models.IntegerField(default=0)
#     suggested_text = models.TextField(null=False)
#     probability = models.FloatField(null=False)
#     start_index = models.IntegerField(null=False)
#     end_index = models.IntegerField(null=False)
#     chunk = models.IntegerField(null = False)
#     original_text = models.TextField(null=False)
#     submitter = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

#     def __str__(self):
#         return f'{self.text.title} suggestion: {self.suggested_text}'

# class Comment(models.Model):
#     suggestion = models.ForeignKey(Suggestion, on_delete=models.CASCADE)
#     body = models.TextField(null=False)
#     number_good = models.IntegerField(default=0)
#     number_ok = models.IntegerField(default=0)
#     number_bad = models.IntegerField(default=0)
#     commenter = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

#     def __str__(self):
#         return f're: {self.suggestion.suggested_text}. {self.body}'

# class Response(models.Model):
#     comment = models.ForeignKey(Comment, on_delete=models.DO_NOTHING)
#     body = models.TextField(null=False)
#     number_good = models.IntegerField(default=0)
#     number_ok = models.IntegerField(default=0)
#     number_bad = models.IntegerField(default=0)
#     commenter = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

#     def __str__(self):
#         return f're: {self.comment.body}. {self.body}'
    
# class Rating(models.Model):
#     RATING_CHOICES = [
#         ('G', 'GOOD'),
#         ('O', 'OK'),
#         ('B', 'BAD')
#     ]
#     rating = models.CharField(max_length=20, choices=RATING_CHOICES)

# class Sentence(models.Model):
#     text = models.TextField(null=False)

# class QuestionFormat(models.Model):
#     FORMATS = [
#         'Fill In The Blank',
#         'Multiple Choice'
#     ]
#     form = models.CharField(max_length=20, choices=FORMATS)

# class Module(models.Model):
#     # pass