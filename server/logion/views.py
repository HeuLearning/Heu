from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from django.http import Http404
from django.views.generic.detail import DetailView
from .serializers import (AssessmentSerializer, QuestionSerializer, UserSerializer, AdminDataSerializer, InstructorDataSerializer, StudentDataSerializer, HeuStaffDataSerializer, LearningOrganizationSerializer, LearningOrganizationLocationSerializer, RoomSerializer, SessionSerializer, SessionPrerequisitesSerializer)
from .models import CustomUser, Question, Assessment, LookupIndex, AdminData, InstructorData, StudentData, HeuStaffData, LearningOrganization, LearningOrganizationLocation, Room, Session, SessionPrerequisites
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import exception_handler
from rest_framework.exceptions import AuthenticationFailed, NotFound, ValidationError
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.throttling import UserRateThrottle
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import login
from django.db.models import Sum, Count, Q


# from .bert import all_possibilities, remove_diacritics, get_results, get_desi_result, get_results_2
# from .getcontext import get_context
import os
import requests
import json
import re
import random
import logging

logger = logging.getLogger(__name__)

from authz.permissions import HasAdminPermission

def index(request):
    return HttpResponse('Hello, world')

class UserCRUD(APIView):
    def post(self, request):
        bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
        u = CustomUser.objects.get(user_id=result["sub"])
        u_s = UserSerializer(u)
        role = u_s.data['user_type']
        body = json.loads(request.body)
        if body["purpose"] == "change role":
            u.user_type = body["role"]
            # should maybe add code that deletes the old associations in the other tables
            if body["role"] == "ad":
                ad = AdminData(user_id=result["sub"], verified=False)
                ad.save()
            elif body["role"] == "in":
                it = InstructorData(user_id=result["sub"], verified=False)
                it.save()
            elif body["role"] == "st":
                sd = StudentData(user_id=result["sub"], verified=False)
                sd.save()
            print("did this happen at least")
            u.save()
        print("what")
        return Response("working on this, please be patient")
        role_data = None
        if role == "in":
            inst_data = InstructorData.objects.get(user_id=result["sub"]) 
            inst_data = InstructorDataSerializer(inst_data)
            role_data = inst_data
        elif role == "ad":
            admin_data = AdminData.objects.get(user_id=result["sub"])
            admin_data = AdminDataSerializer(admin_data)
            role_data = admin_data
        elif role == "hs":
            hs_data = HeuStaffData.objects.get(user_id=result["sub"])
            hs_data = HeuStaffDataSerializer(hs_data)
            role_data = hs_data
        else: 
            st_data = StudentData.objects.get(user_id=result["sub"])
            st_data = StudentDataSerializer(st_data)
            role_data = st_data
        
        return Response(role_data.data)

class GetUserRole(APIView):
    def get_user_info(self, token):
        # Check cache first
        cache_key = f'user_info_{token[:10]}'  # Use part of the token as cache key
        cached_info = cache.get(cache_key)
        if cached_info:
            return cached_info

        # If not in cache, fetch from Auth0
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {token}'}
        response = requests.get(f'https://{domain}/userinfo', headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Auth0 returned status code {response.status_code}")
            raise AuthenticationFailed("Failed to retrieve user info")
        
        user_info = response.json()
        
        # Cache the user info
        cache.set(cache_key, user_info, 3600)  # Cache for 1 hour
        
        return user_info

    def get(self, request):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")

            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)

            # Assuming CustomUser has these fields
            user, created = CustomUser.objects.get_or_create(
                user_id=user_info['sub'],
                defaults={
                    'email': user_info.get('email', ''),
                    'user_type': user_info.get('user_type', '')  # Make sure Auth0 provides this
                }
            )

            # Simplified role data retrieval
            role_data = {
                'verified': False  # Default value
            }

            if user.user_type in ['in', 'ad', 'hs', 'st']:
                role_model = {
                    'in': InstructorData,
                    'ad': AdminData,
                    'hs': HeuStaffData,
                    'st': StudentData
                }[user.user_type]
                
                role_instance = role_model.objects.filter(user_id=user.user_id).first()
                if role_instance:
                    role_data['verified'] = getattr(role_instance, 'verified', False)

            return Response({
                "role": user.user_type,
                "verified": role_data['verified']
            })

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except Exception as e:
            logger.error(f"Unexpected error in GetUserRole: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        
# check if the user has done this before
class StartAssessment(APIView):
    # permission_classes = [IsAuthenticated]
    def getObject(self, uid):
        try:
            all = Assessment.objects.get(user_id=uid)
            return all
        except:
            return None

    def get(self, request):
        bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
        u = CustomUser.objects.get(user_id=result["sub"])
        h = self.getObject(u.user_id)
        print("asdf")
        # note for future that one might retake this assessment
        if h is None:
            h = Assessment()
            h.user_id = u.user_id
            h.num_attempts = 0
            qs = { "questions": [], "scores": [] }
            h.questions = qs
            h.save()
            # return Response({'num_attempts': 0})
        else:
            h.num_attempts += 1
            h.save()
        h = AssessmentSerializer(h)
        print(h)
        return Response(h.data)

class GetQuestion(APIView):
    # permission_classes = [IsAuthenticated]

    def get_lookup(self, id):
        try:
            return LookupIndex.objects.get(id=id)
        except:
            raise Http404
    
    def get_question(self, id):
        try:
            return Question.objects.get(custom_id=id)
        except:
            raise Http404
        
    def get_assessment(self, id):
        try:
            return Assessment.objects.get(pk=id)
        except:
            raise Http404
    

    # def get(self, request):
    #     # save the previous question's answer

    #     # this is the the machine learning would happen
    #     #######################################
    #     questions = LookupIndex.objects.all()
    #     q_ls = list(questions)
    #     random_q_pk = random.choice(q_ls).pk
    #     q_id = random_q_pk
    #     #######################################
    #     lookup_index = self.get_lookup(q_id)
    #     question = self.get_question(lookup_index.custom_id)
    #     question = QuestionSerializer(question)
    #     return Response({'question': question.data, 'format': lookup_index.format})
    

    def post(self, request):
        # save the previous question's answer
        print('as;dlfkjas;dlfkjas;dlkfj')
        body = json.loads(request.body)
        assessment = self.get_assessment(body['assessmentHistory']['id'])
        qs = assessment.questions
        if body['assessmentQuestion']:
            if body['answer'] == 'correct':
                qs['scores'].append(1)
            else:
                qs['scores'].append(0)
        assessment.save()
        if len(qs['questions']) >= 2:
            print("youre doneeeeeeee")
            return Response({"question": {"text": None, "audio": None, "image": None, "json": None}, "format": None, "done": True})
        # this is the the machine learning would happen
        #######################################
        prev_question_ids = qs['questions']
        questions = LookupIndex.objects.all()
        q_ls = list(questions)
        random_q = random.choice(q_ls)
        while random_q.custom_id in prev_question_ids:
            random_q = random.choice(q_ls)
        q_id = random_q.pk
        #######################################
        qs['questions'].append(q_id)
        assessment.questions = qs
        assessment.save()
        lookup_index = self.get_lookup(q_id)
        question = self.get_question(lookup_index.custom_id)
        question = QuestionSerializer(question)
        return Response({'question': question.data, 'format': lookup_index.format, "done": False})


class Assesment(APIView):
    def get(self, request):
        # should check whether the user has taken this assessment before. 
        return Response("Has the user taken this assessment before?")
    
    def post(self, request):
        # *ML* and return question
        pass

class SessionsView(APIView):

    def get(self, request):
        bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
        u = CustomUser.objects.get(user_id=result["sub"])
        admindata = AdminData.objects.get(user_id=result["sub"])
        lc_id = admindata.learning_center
        sessions = Session.objects.all().filter(learning_organization=lc_id)
        sessions_s = SessionSerializer(sessions, many=True)
        return Response(sessions_s.data)

class UserSessionsView(APIView):
    def get_user_info(self, token):
        cache_key = f'user_info_{token[:10]}'
        cached_info = cache.get(cache_key)
        if cached_info:
            return cached_info

        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {token}'}
        response = requests.get(f'https://{domain}/userinfo', headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Auth0 returned status code {response.status_code}")
            raise AuthenticationFailed("Failed to retrieve user info")
        
        user_info = response.json()
        cache.set(cache_key, user_info, 3600)  # Cache for 1 hour
        return user_info

    def get(self, request):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")

            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Fetch all sessions with related data in a single query
            sessions = Session.objects.select_related('learning_organization').prefetch_related(
                'learning_organization__room_set'
            ).annotate(
                max_capacity=Sum('learning_organization__room__max_capacity'),
                num_enrolled=Count('enrolled_students__enrolled_students'),
                num_waitlist=Count('waitlist_students__waitlist_students')
            )

            return_ls = []
            for session in sessions:
                is_enrolled = user_id in session.enrolled_students.get('enrolled_students', [])
                is_waitlisted = user_id in session.waitlist_students.get('waitlist_students', [])
                
                return_ls.append({
                    "start_time": session.start_time,
                    "end_time": session.end_time,
                    "max_capacity": session.max_capacity or 0,
                    "num_enrolled": session.num_enrolled,
                    "num_waitlist": session.num_waitlist,
                    "organization": session.learning_organization.name,
                    "location": "New York City",  # Consider making this dynamic if needed
                    "isEnrolled": is_enrolled,
                    "isWaitlisted": is_waitlisted,
                    "id": session.id
                })

            return Response(return_ls)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except Exception as e:
            logger.error(f"Unexpected error in UserSessionsView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

class UserSessionDetailView(APIView):
    def get_user_info(self, token):
        cache_key = f'user_info_{token[:10]}'
        cached_info = cache.get(cache_key)
        if cached_info:
            return cached_info

        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {token}'}
        response = requests.get(f'https://{domain}/userinfo', headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Auth0 returned status code {response.status_code}")
            raise AuthenticationFailed("Failed to retrieve user info")
        
        user_info = response.json()
        cache.set(cache_key, user_info, 3600)  # Cache for 1 hour
        return user_info

    def get_session_and_capacity(self, session_pk):
        try:
            session = Session.objects.select_related('learning_organization').get(id=session_pk)
            max_cap = Room.objects.filter(learning_organization=session.learning_organization).aggregate(Sum('max_capacity'))['max_capacity__sum'] or 0
            return session, max_cap
        except Session.DoesNotExist:
            raise NotFound("Session not found")

    # @transaction.atomic
    def post(self, request, session_pk, format=None):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")

            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            u_id = user_info['sub']

            session, max_cap = self.get_session_and_capacity(session_pk)

            body = json.loads(request.body)
            task = body.get("task")

            if task == "enroll":
                return self.enroll_user(session, u_id, max_cap)
            elif task == "waitlist":
                return self.waitlist_user(session, u_id)
            elif task == "drop_waitlist":
                return self.drop_waitlist_user(session, u_id)
            elif task == "unenroll":
                return self.unenroll_user(session, u_id)
            else:
                raise ValidationError("Unknown task")

        except (AuthenticationFailed, NotFound, ValidationError) as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in UserSessionDetailView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

    def enroll_user(self, session, u_id, max_cap):
        enrolled = session.enrolled_students.get("enrolled_students", [])
        if u_id in enrolled:
            return Response({"message": "Already enrolled"})
        if len(enrolled) >= max_cap:
            return Response({"message": "Class filled up"})
        enrolled.append(u_id)
        session.enrolled_students["enrolled_students"] = enrolled
        session.save()
        return Response({"message": "Successfully enrolled"})

    def waitlist_user(self, session, u_id):
        waitlist = session.waitlist_students.get("waitlist_students", [])
        if u_id in waitlist:
            return Response({"message": "Already on the waitlist"})
        waitlist.append(u_id)
        session.waitlist_students["waitlist_students"] = waitlist
        session.save()
        return Response({"message": "Successfully joined waitlist"})

    def drop_waitlist_user(self, session, u_id):
        waitlist = session.waitlist_students.get("waitlist_students", [])
        if u_id not in waitlist:
            return Response({"message": "Not on the waitlist"})
        waitlist.remove(u_id)
        session.waitlist_students["waitlist_students"] = waitlist
        session.save()
        return Response({"message": "Successfully dropped waitlist"})

    def unenroll_user(self, session, u_id):
        enrolled = session.enrolled_students.get("enrolled_students", [])
        if u_id not in enrolled:
            return Response({"message": "Not enrolled"})
        enrolled.remove(u_id)
        waitlist = session.waitlist_students.get("waitlist_students", [])
        if waitlist:
            temp = waitlist.pop(0)
            enrolled.append(temp)
        session.waitlist_students["waitlist_students"] = waitlist
        session.enrolled_students["enrolled_students"] = enrolled
        session.save()
        return Response({"message": "Successfully unenrolled"})
# this route actually needs to include the id of the location or of the organization
class AdminSessionsView(APIView):
    
    def get_admin_data(u_id):
        pass
    # try:
    #     ad = AdminData.objects.get(user_id=u_id)
    #     return ad
    # except AdminData.DoesNotExist:
    #     # User is not an admin
    #     raise PermissionDenied("You do not have admin permissions.")



    def post(self, request):
        bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
        u = CustomUser.objects.get(user_id=result["sub"])
        u_id = result["sub"]
        # check if the user is an administrator
        ad = AdminData.objects.filter(user_id=u_id)
        # if 
        sessions = Session.objects.all()
        sessions_s = SessionSerializer(sessions, many=True)
        return_ls = []
        for s in sessions:
            rooms = Room.objects.all().filter(learning_organization=s.learning_organization)
            max_cap = 0
            for r in rooms:
                max_cap += r.max_capacity
            enrolled = s.enrolled_students["enrolled_students"]
            is_enrolled = False
            if u_id in enrolled:
                is_enrolled = True
            waitlist = s.waitlist_students["waitlist_students"]
            is_waitlisted = False
            if u_id in waitlist:
                is_waitlisted = True

            return_ls.append({ "start_time": s.start_time, "end_time": s.end_time, "max_capacity": max_cap, "num_enrolled": len(enrolled), "num_waitlist": len(waitlist), "organization": s.learning_organization.name, "location": "New York City", "isEnrolled": is_enrolled, "isWaitlisted": is_waitlisted, "id": s.id })
        return Response(return_ls)


class LoginUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
        try:
            u = CustomUser.objects.get(user_id=result["sub"])
            u.save()
        except CustomUser.DoesNotExist:
            u = CustomUser.objects.filter(email=result["email"]).first()
            if u is None:
                u = CustomUser()
                u.username=result["nickname"]
                u.email = result["email"]
            u.user_id = result["sub"]
            u.save()
            return HttpResponse('User Created')
        return HttpResponse('Existing User')
        



# class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Author.objects.all()
#     serializer_class = AuthorSerializer
#     permission_classes = [HasAdminPermission]


# class TextsByAuthorView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, author_pk):
#         try:
#             return Text.objects.filter(author=author_pk)
#         except Text.DoesNotExist:
#             raise Http404
             

#     def get(self, request, author_pk, format=None):
#         texts = self.get_object(author_pk)
#         texts = TextTitleSerializer(texts, many=True)
#         return Response(texts.data)
    

# class TextDetailView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get_object(self, pk, offset):
#         try:
#             text_detail = Text.objects.get(pk=pk)
#             suggestions_detials = Suggestion.objects.filter(text=pk).filter(chunk=offset)
#             return [text_detail, suggestions_detials]
#         except Text.DoesNotExist or Suggestion.DoesNotExist:
#             raise Http404
             

#     def get(self, request, pk, offset, format=None):
#         text, suggestions = self.get_object(pk, offset)
#         text_serializer = TextSerializer(text)
#         suggestions_serializer = SuggestionSerializer(suggestions, many=True)
#         chunks = text_serializer.data['body'].split("***")
#         updated_body = chunks[offset]
#         dummy = { 'id' : text_serializer.data['id'], 'body': updated_body, 'chunks': len(chunks), 'title': text_serializer.data['title'] }
#         return Response([dummy, suggestions_serializer.data])
    

# class SuggestionCommentsView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get_object(self, suggestion_pk):
#         try:
#             return Comment.objects.filter(suggestion=suggestion_pk)
#         except Comment.DoesNotExist:
#             raise Http404

#     def get(self, request, suggestion_pk, format=None):
#         comments = self.get_object(suggestion_pk)
#         serializer = CommentSerializer(comments, many=True)
#         return Response(serializer.data)
    


# class SaveSuggestionView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, format=None):
#         print(request.data['words'])
#         words = request.data['words']
#         words_string = ''
#         for word in words:
#             words_string += f'{word} '
#         s = Suggestion()
#         s.text = Text.objects.get(id = request.data['text_id'])
#         s.chunk = request.data['chunk']
#         s.suggested_text = request.data['suggestion']['word']
#         s.probability = request.data['suggestion']['probability']
#         s.start_index = request.data['start_index']
#         s.end_index = request.data['end_index']
#         s.original_text = words_string
#         bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
#         domain = os.environ.get('AUTH0_DOMAIN')
#         headers = {"Authorization": f'Bearer {bearer_token}'}
#         result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
#         u = CustomUser.objects.get(user_id=result["sub"])
#         s.submitter = u
#         s.save()
#         return HttpResponse("Suggestion Saved")


# class SaveCommentView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, format=None):
#         c = Comment()
#         c.suggestion = Suggestion.objects.get(id = request.data['suggestion_id'])
#         c.body = request.data['comment']
#         bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
#         domain = os.environ.get('AUTH0_DOMAIN')
#         headers = {"Authorization": f'Bearer {bearer_token}'}
#         result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
#         u = CustomUser.objects.get(user_id=result["sub"])
#         c.commenter = u
#         c.save()
#         return HttpResponse("Suggestion Saved")
    

# class DeleteComentView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, format=None):
#         print(request.data)
#         try:
#             c = Comment.objects.get(id = request.data['comment']['id'])
#             c.delete()
#         except Comment.DoesNotExist:
#             print("whoops")
#             return HttpResponse("No Such Comment Exists")
#         return HttpResponse("Comment Deleted")

