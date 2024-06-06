from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Author, Text, Suggestion, Comment, Response, Rating, CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm


class CustomUserAdmin(UserAdmin):
    pass
    # [field.name for field in MyModel._meta.get_fields()]
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    fieldsets = (
      (None, {'fields': ('email', 'password', 'user_id')}),
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
admin.site.register(Author)
admin.site.register(Text)
admin.site.register(Suggestion)
admin.site.register(Comment)
admin.site.register(Response)
admin.site.register(Rating)
