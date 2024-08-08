from io import open_code
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator 
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
import uuid

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
        return f'{self.user_id} {self.verified}'

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
    def __str__(self):
        return f'{self.id} {self.name}'

class LearningOrganizationLocation(models.Model):
    name = models.CharField(blank=False, max_length=255)
    learning_organization = models.ForeignKey(LearningOrganization, on_delete=models.RESTRICT)
    def __str__(self):
        return f'{self.id} {self.name} {self.learning_organization.name}' 
    
class Room(models.Model):
    name = models.CharField(blank = False, max_length=255)
    max_capacity = models.IntegerField(null=False)
    learning_organization = models.ForeignKey(LearningOrganization, on_delete=models.RESTRICT)
    learning_organization_location = models.ForeignKey(LearningOrganizationLocation, on_delete=models.RESTRICT)

class AdminData(models.Model):
    user_id = models.CharField(null=False, max_length=255)
    verified = models.BooleanField(null=False, default=False)
    learning_organization = models.ForeignKey(LearningOrganization, on_delete=models.RESTRICT)
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
    completed = models.BooleanField(default=False)
    reviewed = models.BooleanField(default=False)
    accepted = models.BooleanField(default=False)
    approver = models.ForeignKey(AdminData, null=True, blank=True, on_delete=models.SET_NULL)
    def __str__(self):
        return f'{self.id} {self.instructor_id} {self.accepted}'
    
class HardCodedQuestionCounter(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order = models.IntegerField()

class Module(models.Model):
    name = models.CharField(default="Nickname for Module")
    questions = models.ManyToManyField(HardCodedQuestionCounter, related_name="question_counter")
    suggested_duration_seconds = models.IntegerField()
    description = models.TextField(default="Default Module")
    def __str__(self):
        return f'{self.id} {self.name} {self.description}'

class ModuleCounter(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    order = models.IntegerField()

class Phase(models.Model):
    name = models.CharField(default="Nickname for Phase")
    type = models.CharField(default="Learning Phase")
    description = models.TextField(default="Default Learning Phase")
    modules =  models.ManyToManyField(ModuleCounter, related_name="module_counter")
    def __str__(self):
        return f'{self.id} {self.name} {self.type} {self.description}'
    
class PhaseCounter(models.Model):
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE)
    order = models.IntegerField()

class LessonPlan(models.Model):
    name = models.CharField(default="Nickname for Lesson Plan")
    phases =  models.ManyToManyField(PhaseCounter, related_name="phase_counter")
    description = models.TextField(default="Default Lesson Plan")
    def __str__(self):
        return f'{self.id} {self.name} {self.description}'

class SessionRequirements(models.Model):
    learning_organization_location = models.ForeignKey(LearningOrganizationLocation, on_delete=models.CASCADE)
    minimum_session_hours = models.IntegerField(default=1)
    minmum_num_weeks_consecutive = models.IntegerField(default=8)
    minimum_avg_days_per_week = models.IntegerField(default=2)
    num_exempt_weeks = models.IntegerField(default=2)
    def __str__(self):
        return f'{self.id} {self.minimum_session_hours} {self.minmum_num_weeks_consecutive} {self.minimum_avg_days_per_week} {self.num_exempt_weeks}'

class Session(models.Model):
    admin_creator = models.ForeignKey(AdminData, null=True, on_delete=models.SET_NULL)
    viewed = models.BooleanField(default=False)
    approved = models.BooleanField(default=False)
    learning_organization_location = models.ForeignKey(LearningOrganizationLocation, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    lesson_plan = models.ForeignKey(LessonPlan, on_delete=models.SET_NULL, null=True, blank=True)
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
    instructors = ArrayField(
        models.CharField(max_length=255),
        null=True,
        blank=True,
        default=list
    )

    def __str__(self):
        return f'{self.admin_creator} {self.learning_organization_location.learning_organization.name} @ {self.learning_organization_location.name} {self.viewed} {self.approved}'
    
class SessionApprovalToken(models.Model):
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    sessions = models.ManyToManyField(Session, related_name='approval_tokens')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.token}, {self.used}, {self.expires_at}'

    def is_valid(self):
        return not self.used and self.expires_at > timezone.now()
    
class HardCodedQuestionCounter(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order = models.IntegerField()


class HardCodedModule(models.Model):
    questions = models.ManyToManyField(HardCodedQuestionCounter, related_name="question_counter")


class HardCodedStudentProgress(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.TextField(blank=True, null=True) # maybe shouldn't be null or blank
    intermediate_answers = ArrayField(models.TextField(), blank=True, null=True, default=list)
    intermediate_timing = ArrayField(models.IntegerField(), blank=True, null=True, default=list)
    isRight = models.BooleanField(blank=False, default=False)
    secondsToAnswer = models.IntegerField(blank=False)
