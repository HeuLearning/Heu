from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
# router.register(r'authors', views.AuthorViewSet,basename="authors")

urlpatterns = [
    path('get-assessment-question', views.GetQuestion.as_view()),
    path('start-assessment', views.StartAssessment.as_view()),
    path('get-user-role', views.GetUserRole.as_view()),
    path('user', views.UserCRUD.as_view()),
    path('sessions', views.SessionsView.as_view()),
    path('user-sessions', views.UserSessionsView.as_view()),
    path('user-session-detail/<int:session_pk>', views.UserSessionDetailView.as_view()),
    path('admin-sessions/', views.AdminSessionsView.as_view()),
    path('admin-sessions-location/<int:loc_id>', views.AdminSessionsByLocationView.as_view()),
    path('admin-sessions-location', views.AdminSessionsByLocationView.as_view()),
    path('admin-session-detail/<int:session_pk>', views.AdminSessionDetailView.as_view()),
    path('instructor-application-template', views.InstructorApplicationTemplateView.as_view()),
    path('instructor-applications-admin/<int:template_id>', views.InstructorApplicationInstanceAdminView.as_view()),
    path('instructor-applications-admin', views.InstructorApplicationInstanceAdminView.as_view()),
    path('session-requirements/<int:location_id>', views.SessionRequirementsView.as_view()),
    path('instructor-application-instance/<int:template_id>', views.InstructorApplicationInstanceDetailView.as_view(), name='instructor-application-instance-detail'),
    path('instructor-application-instance/put/<int:instance_id>', views.InstructorApplicationInstanceDetailView.as_view(), name='instructor-application-instance-delete'),
    path('instructor-application-instance/delete', views.InstructorApplicationInstanceDetailView.as_view(), name='instructor-application-instance-delete'),
    # path('instructor-applications-instructor/<int:template_id>', views.InstructorApplicationInstanceView.as_view()),
    path('instructor-applications-instructor', views.InstructorApplicationInstanceView.as_view()),
    path('email', views.EmailView.as_view()),
    path('locations', views.LocationsView.as_view()),
    path('check_user', views.LoginUserView.as_view()), # this path is for auth0
    path("", views.index, name="index"),
    path('', include(router.urls)),
]