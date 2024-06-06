from rest_framework import serializers
from .models import Author, Text, Suggestion, Comment, Response, Rating, CustomUser
from .admin import CustomUserAdmin



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name')

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUserAdmin
        fields = ('username')

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ('first_name', 'last_name', 'birth_year', 'death_year', 'genre', 'id')


class TextSerializer(serializers.ModelSerializer):
    # author = serializers.PrimaryKeyRelatedField(read_only=True)
    # author = AuthorSerializer()
    class Meta:
        model = Text
        fields = ('id', 'body', 'title')


class TextTitleSerializer(serializers.ModelSerializer):
    author = AuthorSerializer()
    class Meta:
        model = Text
        fields = ('id', 'title', 'author', 'publish_date')


class SuggestionSerializer(serializers.ModelSerializer):
    # uncommenting the below will mean the entire text gets transmitted with the suggestion
    # text = TextSerializer()
    # submitter = serializers.Foreign(read_only=True)
    submitter = UserSerializer()

    class Meta:
        model = Suggestion
        fields = ('id', 'submitter', 'probability', 'text', 'number_good', 'number_ok', 'number_bad', 'suggested_text', 'original_text', 'start_index', 'end_index')
        # depth=2

class CommentSerializer(serializers.ModelSerializer):
    commenter = UserSerializer()
    class Meta:
        model = Comment
        fields = ('id', 'body', 'number_good', 'commenter')
