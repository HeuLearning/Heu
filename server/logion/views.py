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
from rest_framework.exceptions import AuthenticationFailed, NotFound, ValidationError, PermissionDenied
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.throttling import UserRateThrottle
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import login
from django.db.models import Sum, Count, Q, Prefetch, F
from django.db import transaction
from django.utils.dateparse import parse_datetime


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
            sessions = Session.objects.filter(approved=True).select_related('learning_organization').prefetch_related(
                'learning_organization__room_set'
            ).annotate(
                max_capacity=Sum('learning_organization__room__max_capacity'),
            )

            return_ls = []
            for session in sessions:
                enrolled = session.enrolled_students or []
                waitlisted = session.waitlist_students or []

                # is_enrolled = user_id in session.enrolled_students.get('enrolled_students', [])
                # is_waitlisted = user_id in session.waitlist_students.get('waitlist_students', [])
                
                return_ls.append({
                    "start_time": session.start_time,
                    "end_time": session.end_time,
                    "max_capacity": session.max_capacity or 0,
                    "num_enrolled": len(enrolled),
                    "num_waitlist": len(waitlisted),
                    "learning_organization": session.learning_organization.name,
                    "location": "New York City",  # Consider making this dynamic if needed
                    "isEnrolled": user_id in enrolled,
                    "isWaitlisted": user_id in waitlisted,
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

    @transaction.atomic
    def post(self, request, session_pk, format=None):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")

            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            u_id = user_info['sub']

            session, max_cap = self.get_session_and_capacity(session_pk)
            if not session.approved:
                raise PermissionDenied("This session is not approved for enrollment or waitlisting.")
            
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
        enrolled = session.enrolled or []
        if u_id in enrolled:
            return Response({"message": "Already enrolled"})
        if len(enrolled) >= max_cap:
            return Response({"message": "Class filled up"})
        enrolled.append(u_id)
        session.enrolled_students = enrolled
        session.save()
        return Response({"message": "Successfully enrolled"})

    def waitlist_user(self, session, u_id):
        waitlist = session.waitlist_students or []
        if u_id in waitlist:
            return Response({"message": "Already on the waitlist"})
        waitlist.append(u_id)
        session.waitlist_students = waitlist
        session.save()
        return Response({"message": "Successfully joined waitlist"})

    def drop_waitlist_user(self, session, u_id):
        waitlist = session.waitlist_students or []
        if u_id not in waitlist:
            return Response({"message": "Not on the waitlist"})
        waitlist.remove(u_id)
        session.waitlist_students = waitlist
        session.save()
        return Response({"message": "Successfully dropped waitlist"})

    def unenroll_user(self, session, u_id):
        enrolled = session.enrolled_students or []
        if u_id not in enrolled:
            return Response({"message": "Not enrolled"})
        enrolled.remove(u_id)
        waitlist = session.waitlist_students or []
        if waitlist:
            temp = waitlist.pop(0)
            enrolled.append(temp)
        session.waitlist_students = waitlist
        session.enrolled_students = enrolled
        session.save()
        return Response({"message": "Successfully unenrolled"})
# this route actually needs to include the id of the location or of the organization
    
class AdminSessionsView(APIView):
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
            # Authenticate user
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")

            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get AdminData for the user
            try:
                admin_data = AdminData.objects.select_related('learning_organization').get(user_id=user_id)
            except AdminData.DoesNotExist:
                raise PermissionDenied("User is not an admin")

            # Get the learning organization
            learning_organization = admin_data.learning_organization

            # Get associated sessions
            sessions = Session.objects.filter(learning_organization=learning_organization).select_related(
                'learning_organization'
            )

            # Calculate max capacity for the learning organization
            max_capacity = Room.objects.filter(learning_organization=learning_organization).aggregate(
                total_capacity=Sum('max_capacity')
            )['total_capacity'] or 0

            # Prepare response data
            sessions_data = []
            for session in sessions:
                enrolled = session.enrolled_students or []
                waitlisted = session.waitlist_students or []

                sessions_data.append({
                    "id": session.id,
                    "start_time": session.start_time,
                    "end_time": session.end_time,
                    "max_capacity": max_capacity,
                    "num_enrolled": len(enrolled),
                    "num_waitlist": len(waitlisted),
                    "learning_organization": learning_organization.name,
                    "approved": session.approved,
                    "location": "New York City",  # You might want to make this dynamic
                })

            return Response({
                # "admin_name": admin_data.name,  # Assuming AdminData has a name field
                "learning_organization": learning_organization.name,
                "sessions": sessions_data
            })

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except Exception as e:
            logger.error(f"Unexpected error in AdminSessionsView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        


class AdminSessionDetailView(APIView):
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
    
    def get_user_django_info(self, user_id):
        try:
            return CustomUser.objects.get(user_id=user_id)
        except CustomUser.DoesNotExist:
            raise PermissionDenied("User does not exist")

    def get_admin_data(self, user_id):
        try:
            return AdminData.objects.select_related('learning_organization').get(user_id=user_id)
        except AdminData.DoesNotExist:
            raise PermissionDenied("User is not an admin")

    def get_session(self, session_pk):
        try:
            return Session.objects.select_related('learning_organization').get(id=session_pk)
        except Session.DoesNotExist:
            raise NotFound("Session not found")

    def check_admin_authorization(self, admin_data, session):
        if admin_data.learning_organization != session.learning_organization:
            raise PermissionDenied("Admin is not associated with this session's learning organization")

    @transaction.atomic
    def put(self, request, session_pk, format=None):
        try:
            # Authenticate user
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")

            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get admin data
            admin_data = self.get_admin_data(user_id)

            # Get session
            session = self.get_session(session_pk)

            # Check if admin is authorized
            self.check_admin_authorization(admin_data, session)

            # Parse request data
            data = json.loads(request.body)
            task = data.get('task')

            if task == 'update_start_time':
                self.update_start_time(session, data)
            elif task == 'update_end_time':
                self.update_end_time(session, data)
            elif task == 'update_enrolled':
                self.update_enrolled_students(session, data)
            elif task == 'update_waitlist':
                self.update_waitlist_students(session, data)
            elif task == 'enroll_student':
                self.enroll_student(session, data)
            elif task == 'unenroll_student':
                self.unenroll_student(session, data)
            elif task == 'add_to_waitlist':
                self.add_to_waitlist(session, data)
            elif task == 'remove_from_waitlist':
                self.remove_from_waitlist(session, data)
            else:
                raise ValidationError("Invalid task specified")

            session.save()
            return Response({"message": f"Session successfully updated"}, status=200)

        except (AuthenticationFailed, PermissionDenied, NotFound, ValidationError) as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in AdminSessionDetailView PUT: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

        
    def enroll_student(self, session, data):
        student_id = data.get('student_id')
        if not student_id:
            raise ValidationError("student_id is required")

        enrolled = session.enrolled_students or []
        waitlist = session.waitlist_students or []

        if student_id in enrolled:
            raise ValidationError("Student is already enrolled")

        enrolled.append(student_id)
        session.enrolled_students = enrolled

        # Remove from waitlist if present
        if student_id in waitlist:
            waitlist.remove(student_id)
            session.waitlist_students = waitlist

    def unenroll_student(self, session, data):
        student_id = data.get('student_id')
        if not student_id:
            raise ValidationError("student_id is required")

        enrolled = session.enrolled_students or []

        if student_id not in enrolled:
            raise ValidationError("Student is not enrolled")

        enrolled.remove(student_id)
        session.enrolled_students = enrolled

    def add_to_waitlist(self, session, data):
        student_id = data.get('student_id')
        if not student_id:
            raise ValidationError("student_id is required")

        waitlist = session.waitlist_students or []
        enrolled = session.enrolled_students or []

        if student_id in waitlist:
            raise ValidationError("Student is already on the waitlist")

        if student_id in enrolled:
            raise ValidationError("Student is already enrolled")

        waitlist.append(student_id)
        session.waitlist_students = waitlist

    def remove_from_waitlist(self, session, data):
        student_id = data.get('student_id')
        if not student_id:
            raise ValidationError("student_id is required")

        waitlist = session.waitlist_students or []

        if student_id not in waitlist:
            raise ValidationError("Student is not on the waitlist")

        waitlist.remove(student_id)
        session.waitlist_students = waitlist

    def update_start_time(self, session, data):
        start_time = data.get('start_time')
        if not start_time:
            raise ValidationError("start_time is required")

        parsed_start_time = parse_datetime(start_time)
        if not parsed_start_time:
            raise ValidationError("Invalid start_time format")

        if session.end_time and parsed_start_time >= session.end_time:
            raise ValidationError("Start time must be before end time")

        session.start_time = parsed_start_time

    def update_end_time(self, session, data):
        end_time = data.get('end_time')
        if not end_time:
            raise ValidationError("end_time is required")

        parsed_end_time = parse_datetime(end_time)
        if not parsed_end_time:
            raise ValidationError("Invalid end_time format")

        if session.start_time and parsed_end_time <= session.start_time:
            raise ValidationError("End time must be after start time")

        session.end_time = parsed_end_time


    def update_enrolled_students(self, session, data):
        enrolled_students = data.get('enrolled_students')
        if enrolled_students is None:
            raise ValidationError("enrolled_students field is required")
        if not isinstance(enrolled_students, list):
            raise ValidationError("enrolled_students must be a list")
        session.enrolled_students = enrolled_students

    def update_waitlist_students(self, session, data):
        waitlist_students = data.get('waitlist_students')
        if waitlist_students is None:
            raise ValidationError("waitlist_students field is required")
        if not isinstance(waitlist_students, list):
            raise ValidationError("waitlist_students must be a list")
        session.waitlist_students = waitlist_students


    @transaction.atomic
    def delete(self, request, session_pk, format=None):
        try:
            # Authenticate user
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")

            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get admin data
            admin_data = self.get_admin_data(user_id)

            # Get session
            session = self.get_session(session_pk)

            # get the admin's name
            user_data = self.get_user_django_info(user_id=user_id)

            # Check if admin is associated with the session's learning organization
            if admin_data.learning_organization != session.learning_organization:
                raise PermissionDenied("Admin is not associated with this session's learning organization")

            # Delete the session
            session.delete()

            logger.info(f"Session '{session.id}' deleted by admin {user_data.first_name} {user_data.last_name} ID: {user_id}")
            return Response({"message": f"Session '{session.id}' successfully deleted"}, status=200)

        except (AuthenticationFailed, PermissionDenied, NotFound) as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in AdminSessionDetailView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

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
        

