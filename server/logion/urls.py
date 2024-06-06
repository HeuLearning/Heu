from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'authors', views.AuthorViewSet,basename="authors")

urlpatterns = [
    path('text/<int:pk>/<int:offset>', views.TextDetailView.as_view()),
    path('all_texts/<int:author_pk>', views.TextsByAuthorView.as_view()),
    path('comments/<int:suggestion_pk>', views.SuggestionCommentsView.as_view()),
    path('suggestions_get', views.GetSuggestionView.as_view()),
    path('suggestions_save', views.SaveSuggestionView.as_view()),
    path('comment_save', views.SaveCommentView.as_view()),
    path('comment_delete', views.DeleteComentView.as_view()),
    path('check_user', views.LoginUserView.as_view()),
    path('search', views.SearchTextView.as_view()),
    path("", views.index, name="index"),
    path('', include(router.urls)),
]