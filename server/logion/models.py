from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    user_id = models.CharField(null=False, max_length=255)
    first_name = models.CharField(null=False, max_length=255)
    last_name = models.CharField(null=False, max_length=255)

    def __str__(self):
        return self.username

class Author(models.Model):
    first_name = models.CharField(null=True, blank=True, max_length=200)
    last_name = models.CharField(null=False, max_length=200)
    birth_year = models.IntegerField(null=True, blank=True,)
    death_year = models.IntegerField(null=True, blank=True)
    genre = models.CharField(null=True, blank=True, max_length=200)

    def __str__(self):
        return f'{self.last_name}, {self.first_name}. from {self.birth_year} to {self.death_year}. genre: {self.genre}'

class Text(models.Model):
    title = models.TextField(null=False)
    body = models.TextField(null=False)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    publish_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'{self.title} {self.pk} by {self.author.first_name} {self.author.last_name}. body: {self.body[0:20]}'

class Suggestion(models.Model):
    text = models.ForeignKey(Text, on_delete=models.CASCADE)
    number_good = models.IntegerField(default=0)
    number_ok = models.IntegerField(default=0)
    number_bad = models.IntegerField(default=0)
    suggested_text = models.TextField(null=False)
    probability = models.FloatField(null=False)
    start_index = models.IntegerField(null=False)
    end_index = models.IntegerField(null=False)
    chunk = models.IntegerField(null = False)
    original_text = models.TextField(null=False)
    submitter = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f'{self.text.title} suggestion: {self.suggested_text}'

class Comment(models.Model):
    suggestion = models.ForeignKey(Suggestion, on_delete=models.CASCADE)
    body = models.TextField(null=False)
    number_good = models.IntegerField(default=0)
    number_ok = models.IntegerField(default=0)
    number_bad = models.IntegerField(default=0)
    commenter = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f're: {self.suggestion.suggested_text}. {self.body}'

class Response(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.DO_NOTHING)
    body = models.TextField(null=False)
    number_good = models.IntegerField(default=0)
    number_ok = models.IntegerField(default=0)
    number_bad = models.IntegerField(default=0)
    commenter = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f're: {self.comment.body}. {self.body}'
    
class Rating(models.Model):
    RATING_CHOICES = [
        ('G', 'GOOD'),
        ('O', 'OK'),
        ('B', 'BAD')
    ]
    rating = models.CharField(max_length=20, choices=RATING_CHOICES)
