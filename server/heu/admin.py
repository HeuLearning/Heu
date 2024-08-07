from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (CustomUser, LookupIndex, Question, Assessment, 
AdminData, InstructorData, StudentData, HeuStaffData, LearningOrganization, 
LearningOrganizationLocation, Room, Session, SessionPrerequisites, 
InstructorApplicationTemplate, InstructorApplicationInstance, 
SessionRequirements, SessionApprovalToken, Phase, Module, HardCodedQuestionCounter, PhaseCounter, ModuleCounter, LessonPlan)
from .forms import CustomUserCreationForm, CustomUserChangeForm


class CustomUserAdmin(UserAdmin):
    pass
    # [field.name for field in MyModel._meta.get_fields()]
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    fieldsets = (
      (None, {'fields': ('email', 'password', 'user_id', 'user_type')}),
      ('Personal info', {'fields': ('first_name', 'last_name')}),
      ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
      ('Important dates', {'fields': ('last_login', 'date_joined')}),)

    # add_fieldsets = (
    #     (None, {
    #         'classes': ('wide',),
    #         'fields': ('email', 'password1', 'password2'),}),)

    # list_display = ('email', 'first_name', 'last_name', 'is_staff')
    # search_fields = ('email', 'first_name', 'last_name')
    # ordering = ('email',)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Question)
admin.site.register(LookupIndex)
admin.site.register(Assessment)
admin.site.register(AdminData)
admin.site.register(InstructorData)
admin.site.register(StudentData)
admin.site.register(HeuStaffData)
admin.site.register(LearningOrganization)
admin.site.register(LearningOrganizationLocation)
admin.site.register(Room) 
admin.site.register(Session)
admin.site.register(SessionPrerequisites)
admin.site.register(InstructorApplicationTemplate)
admin.site.register(InstructorApplicationInstance)
admin.site.register(SessionRequirements)
admin.site.register(SessionApprovalToken)
admin.site.register(Phase)
admin.site.register(Module)
admin.site.register(HardCodedQuestionCounter)
admin.site.register(PhaseCounter)
admin.site.register(ModuleCounter)
admin.site.register(LessonPlan)
