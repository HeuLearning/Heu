from rest_framework import serializers
from .models import CustomUser, Question, Assessment, AdminData, InstructorData, StudentData, HeuStaffData, LearningOrganization, LearningOrganizationLocation, Room, Session, SessionPrerequisites
from .admin import CustomUserAdmin



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'user_type')

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUserAdmin
        fields = ('username')

class AdminDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminData
        fields = ('user_id', 'verified', 'learning_center')

class InstructorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorData
        fields = ('user_id', 'verified')

class StudentDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentData
        fields = ('user_id', 'verified')

class HeuStaffDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeuStaffData
        fields = ('user_id', 'verified')

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('text', 'audio', 'image', 'json')

        

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ['id', 'num_attempts', 'questions']


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['name',]

class LearningOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningOrganization
        fields = ['name',]

class LearningOrganizationLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningOrganizationLocation
        fields = ['name',]

class SessionPrerequisitesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionPrerequisites
        fields = ['num_meetings_per_week', 'learning_organization']

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['admin_creator', 'learning_organization', 'start_time', 'end_time', 'enrolled_students', 'waitlist_students']


# class AuthorSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Author
#         fields = ('first_name', 'last_name', 'birth_year', 'death_year', 'genre', 'id')


# class TextSerializer(serializers.ModelSerializer):
#     # author = serializers.PrimaryKeyRelatedField(read_only=True)
#     # author = AuthorSerializer()
#     class Meta:
#         model = Text
#         fields = ('id', 'body', 'title')


# class TextTitleSerializer(serializers.ModelSerializer):
#     author = AuthorSerializer()
#     class Meta:
#         model = Text
#         fields = ('id', 'title', 'author', 'publish_date')


# class SuggestionSerializer(serializers.ModelSerializer):
#     # uncommenting the below will mean the entire text gets transmitted with the suggestion
#     # text = TextSerializer()
#     # submitter = serializers.Foreign(read_only=True)
#     submitter = UserSerializer()

#     class Meta:
#         model = Suggestion
#         fields = ('id', 'submitter', 'probability', 'text', 'number_good', 'number_ok', 'number_bad', 'suggested_text', 'original_text', 'start_index', 'end_index')
#         # depth=2

# class CommentSerializer(serializers.ModelSerializer):
#     commenter = UserSerializer()
#     class Meta:
#         model = Comment
#         fields = ('id', 'body', 'number_good', 'commenter')
