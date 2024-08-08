from pytz import utc
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from django.http import Http404
from django.views.generic.detail import DetailView
from .serializers import (AssessmentSerializer, QuestionSerializer, UserSerializer, AdminDataSerializer, InstructorDataSerializer, StudentDataSerializer, HeuStaffDataSerializer, LearningOrganizationSerializer, LearningOrganizationLocationSerializer, RoomSerializer, SessionSerializer, SessionPrerequisitesSerializer)
from .models import CustomUser, Question, Assessment, LookupIndex, AdminData, InstructorData, StudentData, HeuStaffData, LearningOrganization, LearningOrganizationLocation, Room, Session, SessionPrerequisites, InstructorApplicationTemplate, InstructorApplicationInstance, SessionRequirements, SessionApprovalToken, Phase, Module, PhaseCounter
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
from collections import defaultdict
from django.shortcuts import get_object_or_404
from datetime import timedelta, datetime
from django.core.mail import send_mail
import html
from django.utils.html import strip_tags
from django.core.mail import EmailMultiAlternatives
from django.urls import reverse
from django.conf import settings
import uuid
from django.utils import timezone
# from .bert import all_possibilities, remove_diacritics, get_results, get_desi_result, get_results_2
# from .getcontext import get_context
import os
import requests
import json
import re
import random
import logging
import jwt
from rest_framework.permissions import AllowAny

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
    # permission_classes = [AllowAny]
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


    def dispatch(self, request, *args, **kwargs):
        print("GetUserRole dispatch method called")
        return super().dispatch(request, *args, **kwargs)
    

    def get_or_create_user(self, user_info):
        user_id = user_info['sub']
        email = user_info.get('email', '')
        nickname = user_info.get('nickname', '')
        
        if not email:
            raise ValidationError("Email is required for user creation")

        try:
            # Try to get the user by user_id first
            user = CustomUser.objects.get(user_id=user_id)
            # Update user information if it has changed
            user.email = email
            user.username = nickname or email  # Use nickname if available, otherwise use email
            user.save()
            return user, False  # User found and updated
        except CustomUser.DoesNotExist:
            pass

        # If user doesn't exist, try to create one
        try:
            user = CustomUser.objects.create(
                user_id=user_id,
                email=email,
                username=nickname or email,  # Use nickname if available, otherwise use email
            )
            return user, True  # New user created
        except:
            # logger.error(f"IntegrityError while creating user: {str(e)}")
            # If creation fails due to integrity error, try to fetch by email
            try:
                user = CustomUser.objects.get(email=email)
                # Update user_id if it's not set
                if not user.user_id:
                    user.user_id = user_id
                    user.save()
                return user, False  # Existing user found by email
            except CustomUser.DoesNotExist:
                logger.error(f"Failed to create or retrieve user for {email}")
                raise ValidationError("Unable to create or retrieve user")

    # Usage in your view
    def get(self, request):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            
            user, created = self.get_or_create_user(user_info)
            
            # Simplified role data retrieval (unchanged)
            role_data = {'verified': False}
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
        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in GetUserRole: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        
    # def get(self, request):
    #     print("GetUserRole.get method called")
    #     print(f"Request META: {request.META}")
    #     print(f"Request headers: {request.headers}")
        
    #     try:
    #         auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    #         print(f"Authorization header: {auth_header[:20]}...")

    #         if not auth_header.startswith('Bearer '):
    #             print("ERROR: Invalid authorization header")
    #             raise AuthenticationFailed("Invalid authorization header")

    #         token = auth_header.split(' ')[1]
    #         user_info = self.get_user_info(token)

    #         print(user_info['sub'])
    #         # Assuming CustomUser has these fields
    #         user, created = CustomUser.objects.get_or_create(
    #             user_id=user_info['sub'],
    #             # defaults={
    #             #     'email': user_info.get('email', ''),
    #             #     # 'user_type': user_info.get('user_type', '')  # Make sure Auth0 provides this
    #             # }
    #         )

    #         # Update user's ID if it's not set
    #         if not user.user_id:
    #             user.user_id = user_info['sub']
    #             user.save()

    #         # Simplified role data retrieval
    #         role_data = {
    #             'verified': False  # Default value
    #         }

    #         if user.user_type in ['in', 'ad', 'hs', 'st']:
    #             role_model = {
    #                 'in': InstructorData,
    #                 'ad': AdminData,
    #                 'hs': HeuStaffData,
    #                 'st': StudentData
    #             }[user.user_type]
                
    #             role_instance = role_model.objects.filter(user_id=user.user_id).first()
    #             if role_instance:
    #                 role_data['verified'] = getattr(role_instance, 'verified', False)

    #         return Response({
    #             "role": user.user_type,
    #             "verified": role_data['verified']
    #         })

    #     except AuthenticationFailed as e:
    #         return Response({"error": str(e)}, status=401)
    #     except Exception as e:
    #         logger.error(f"Unexpected error in GetUserRole: {str(e)}")
    #         return Response({"error": "An unexpected error occurred"}, status=500)
        
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

            # Get all AdminData objects for this user
            admin_data = AdminData.objects.filter(user_id=user_id)
            
            if not admin_data.exists():
                return Response({"error": "User does not have admin permissions"}, status=403)

            # Get all learning organization locations where the user is an admin
            learning_org_locations = LearningOrganizationLocation.objects.filter(
                learning_organization__in=admin_data.values('learning_organization')
            )

            # Get all sessions for these locations
            sessions = Session.objects.filter(
                learning_organization__in=learning_org_locations.values('learning_organization')
            )

            # Serialize the sessions
            sessions_serialized = SessionSerializer(sessions, many=True)

            return Response(sessions_serialized.data)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except Exception as e:
            logger.error(f"Unexpected error in SessionsView GET: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        
    def post(self, request):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            location_id = request.data.get('location_id')
            sessions_data = request.data.get('sessions', [])

            if not location_id or not sessions_data:
                return Response({"error": "Missing required fields"}, status=400)

            # Verify admin status
            admin_data = AdminData.objects.filter(user_id=user_id, learning_organization_location_id=location_id).first()
            if not admin_data:
                return Response({"error": "You don't have admin permissions for this location"}, status=403)

            # Get SessionRequirements for this location
            try:
                session_requirements = SessionRequirements.objects.get(learning_organization_location_id=location_id)
            except SessionRequirements.DoesNotExist:
                return Response({"error": "Session requirements not found for this location"}, status=400)

            # Prepare sessions for validation
            sessions = []
            for session_data in sessions_data:
                start_time = datetime.fromisoformat(session_data['start_time'])
                end_time = datetime.fromisoformat(session_data['end_time'])
                
                # Check session length
                session_length = (end_time - start_time).total_seconds() / 3600  # Convert to hours
                if session_length < session_requirements.session_length_hours:
                    return Response({
                        "error": f"Session length must be at least {session_requirements.session_length_hours} hours. "
                                 f"Session starting at {start_time} is only {session_length:.2f} hours long."
                    }, status=400)
                
                sessions.append({
                    'start_time': start_time,
                    'end_time': end_time
                })
            # Sort sessions by start time
            sessions.sort(key=lambda x: x['start_time'])

            # Validate density and total sessions requirements for each session
            density_window = timedelta(weeks=session_requirements.num_weeks_for_density_sliding_window)
            total_window = timedelta(weeks=session_requirements.num_weeks_for_total_sessions_sliding_window)
            required_sessions_in_density_window = session_requirements.num_weeks_for_density_sliding_window * session_requirements.average_sessions_per_week_in_density_window
            required_weeks_with_session = session_requirements.num_of_weeks_with_at_least_one_session_in_total_window

            for i, current_session in enumerate(sessions):
                # Check density requirement
                density_window_start = current_session['start_time'] - density_window / 2
                density_window_end = current_session['start_time'] + density_window / 2
                sessions_in_density_window = [s for s in sessions if density_window_start <= s['start_time'] < density_window_end]
                
                if len(sessions_in_density_window) < required_sessions_in_density_window:
                    return Response({
                        "error": f"Density requirement not met for session starting at {current_session['start_time']}. "
                                f"Found {len(sessions_in_density_window)} sessions in the window, "
                                f"but {required_sessions_in_density_window} are required."
                    }, status=400)

                # Check total sessions requirement
                total_window_start = current_session['start_time'] - total_window / 2
                total_window_end = current_session['start_time'] + total_window / 2
                sessions_in_total_window = [s for s in sessions if total_window_start <= s['start_time'] < total_window_end]
                
                weeks_with_session = set()
                for s in sessions_in_total_window:
                    weeks_with_session.add(s['start_time'].isocalendar()[1])  # Get week number
                
                if len(weeks_with_session) < required_weeks_with_session:
                    return Response({
                        "error": f"Total sessions requirement not met for session starting at {current_session['start_time']}. "
                                f"Found sessions in {len(weeks_with_session)} weeks, "
                                f"but sessions in {required_weeks_with_session} weeks are required."
                    }, status=400)

                        
            # If all validations pass, create the sessions
            created_sessions = []
            for session_data in sessions_data:
                session = Session.objects.create(
                    admin_creator=admin_data,
                    learning_organization_location_id=location_id,
                    start_time=session_data['start_time'],
                    end_time=session_data['end_time']
                )
                created_sessions.append(session)

            serializer = SessionSerializer(created_sessions, many=True)
            return Response(serializer.data, status=201)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except Exception as e:
            logger.error(f"Unexpected error in SessionsView POST: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
    
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

            # Corrected query
            sessions = Session.objects.filter(approved=True).select_related(
                'learning_organization_location__learning_organization'
            ).prefetch_related(
                'learning_organization_location__learning_organization__room_set'
            ).annotate(
                max_capacity=Sum('learning_organization_location__learning_organization__room__max_capacity'),
            )

            return_ls = []
            for session in sessions:
                enrolled = session.enrolled_students or []
                waitlisted = session.waitlist_students or []
                instructor_ids = session.instructors or []
                instructors = CustomUser.objects.filter(user_id__in=instructor_ids).values('first_name', 'last_name')
                return_ls.append({
                    "start_time": session.start_time,
                    "end_time": session.end_time,
                    "max_capacity": session.max_capacity or 0,
                    "num_enrolled": len(enrolled),
                    "num_waitlist": len(waitlisted),
                    "learning_organization": session.learning_organization_location.learning_organization.name,
                    "location": session.learning_organization_location.name,
                    "isEnrolled": user_id in enrolled,
                    "isWaitlisted": user_id in waitlisted,
                    "instructors": list(instructors),
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
            session = Session.objects.select_related('learning_organization_location__learning_organization').get(id=session_pk)
            max_cap = Room.objects.filter(
                learning_organization=session.learning_organization_location.learning_organization,
                learning_organization_location=session.learning_organization_location
            ).aggregate(Sum('max_capacity'))['max_capacity__sum'] or 0
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

        except (AuthenticationFailed, NotFound, ValidationError, PermissionDenied) as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in UserSessionDetailView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        
    def enroll_user(self, session, u_id, max_cap):
        enrolled = session.enrolled_students or []
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

            # Get all locations for this learning organization
            locations = LearningOrganizationLocation.objects.filter(learning_organization=learning_organization)

            all_sessions_data = []

            for location in locations:
                # Get associated sessions for this location
                sessions = Session.objects.filter(learning_organization_location=location).select_related(
                    'learning_organization_location__learning_organization'
                )

                # Calculate max capacity for this location
                max_capacity = Room.objects.filter(
                    learning_organization=learning_organization,
                    learning_organization_location=location
                ).aggregate(total_capacity=Sum('max_capacity'))['total_capacity'] or 0

                # Prepare sessions data for this location
                sessions_data = []
                for session in sessions:
                    enrolled = session.enrolled_students or []
                    waitlisted = session.waitlist_students or []
                    instructor_ids = session.instructors or []
                    instructors = CustomUser.objects.filter(user_id__in=instructor_ids).values('first_name', 'last_name', 'user_id')
                    
                    sessions_data.append({
                        "id": session.id,
                        "start_time": session.start_time,
                        "end_time": session.end_time,
                        "max_capacity": max_capacity,
                        "num_enrolled": len(enrolled),
                        "num_waitlist": len(waitlisted),
                        "learning_organization": learning_organization.name,
                        "location": location.name,
                        "approved": session.approved,
                        "viewed": session.viewed,
                        "instructors": list(instructors),
                    })

                all_sessions_data.append({
                    "location": {"name": location.name, "id": location.id},
                    "sessions": sessions_data
                })

            return Response({
                "learning_organization": learning_organization.name,
                "locations": all_sessions_data
            })

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except Exception as e:
            logger.error(f"Unexpected error in AdminSessionsView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

class AdminSessionsByLocationView(APIView):
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
    
    def create_sessions_and_approval_token(self, proposed_sessions, admin_data, session_requirements):
        # Create a unique token
        unique_token = uuid.uuid4()

        # Create an approval token
        approval_token = SessionApprovalToken.objects.create(
            token=unique_token,
            expires_at=timezone.now() + timedelta(days=7)  # Token expires in 7 days
        )

        # Create sessions and link them to the approval token
        created_sessions = []
        for session_data in proposed_sessions:
            session = Session.objects.create(
                admin_creator=admin_data,
                learning_organization_location=session_requirements.learning_organization_location,
                start_time=session_data['start_time'],
                end_time=session_data['end_time']
            )
            created_sessions.append(session)

        # Link the sessions to the approval token
        approval_token.sessions.set(created_sessions)

        return approval_token.token, created_sessions


    def generate_unique_token(self):
        return str(uuid.uuid4())

    def format_sessions_to_html(self, proposed_sessions, token):
        base_url = "localhost:8000"  # Make sure to set this in your Django settings
        accept_url = f"{base_url}{reverse('accept_sessions', args=[token])}"
        deny_url = f"{base_url}{reverse('deny_sessions', args=[token])}"

        html_content = f"""
        <html>
        <head>
            <style>
                table {{
                    border-collapse: collapse;
                    width: 100%;
                }}
                th, td {{
                    border: 1px solid black;
                    padding: 8px;
                    text-align: left;
                }}
                th {{
                    background-color: #f2f2f2;
                }}
                .button {{
                    display: inline-block;
                    padding: 10px 20px;
                    margin: 10px;
                    text-decoration: none;
                    color: white;
                    border-radius: 5px;
                }}
                .accept {{
                    background-color: #4CAF50;
                }}
                .deny {{
                    background-color: #f44336;
                }}
            </style>
        </head>
        <body>
            <h1>Proposed Sessions</h1>
            <table>
                <tr>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration (hours)</th>
                </tr>
        """

        for session in proposed_sessions:
            start_time = datetime.fromisoformat(session['start_time'])
            end_time = datetime.fromisoformat(session['end_time'])
            duration = (end_time - start_time).total_seconds() / 3600

            html_content += f"""
                <tr>
                    <td>{start_time}</td>
                    <td>{end_time}</td>
                    <td>{duration:.2f}</td>
                </tr>
            """

        html_content += f"""
            </table>
            <p>To approve or deny these sessions, please click one of the following links:</p>
            <p>{accept_url}</p>
            <p>
                <a href="{accept_url}" style="color: #4CAF50; font-weight: bold;">Accept All Sessions</a>
            </p>
            <p>{deny_url}</p>
            <p>
                <a href="{deny_url}" style="color: #f44336; font-weight: bold;">Deny All Sessions</a>
            </p>
        </body>
        </html>
        """

        return html_content
   
    def send(self, proposed_sessions, recipients, approval_token):
        # token = self.generate_unique_token()
        subject = 'Session Approval Request'
        html_content = self.format_sessions_to_html(proposed_sessions, str(approval_token))
        text_content = strip_tags(html_content)  # Create a plain-text version of the HTML

        email = EmailMultiAlternatives(
            subject,
            text_content,
            'desi.devaul@gmail.com',
            recipients
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)

        # return token  # Return the token so you can associate it with the sessions in your database

    def get(self, request, loc_id):
        try:
            # Authenticate user
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get learning_organization_location_id from query params
            location_id = loc_id
            # location_id = request.query_params.get('learning_organization_location_id')
            if not location_id:
                return Response({"error": "learning_organization_location_id is required"}, status=400)

            # Check if user has admin rights for this location
            try:
                admin_data = AdminData.objects.get(
                    user_id=user_id,
                    learning_organization__learningorganizationlocation__id=location_id
                )
            except AdminData.DoesNotExist:
                raise PermissionDenied("User is not an admin for this location")

            # Get the learning organization location
            location = LearningOrganizationLocation.objects.get(id=location_id)

            # Get associated sessions
            sessions = Session.objects.filter(learning_organization_location=location).select_related(
                'learning_organization_location__learning_organization'
            )

            # Calculate max capacity for the location
            max_capacity = Room.objects.filter(learning_organization_location=location).aggregate(
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
                    "learning_organization": session.learning_organization_location.learning_organization.name,
                    "location_name": session.learning_organization_location.name,
                    "approved": session.approved,
                    "viewed": session.viewed,
                })

            return Response({
                "learning_organization": location.learning_organization.name,
                "location_name": location.name,
                "sessions": sessions_data
            })

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except LearningOrganizationLocation.DoesNotExist:
            return Response({"error": "Invalid learning_organization_location_id"}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in AdminSessionsView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        
    def post(self, request):
        try:
            # Authenticate user
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']
            # Get session_requirement_id and proposed sessions from request data
            session_requirement_id = request.data.get('session_requirement_id')
            proposed_sessions = request.data.get('sessions', [])

            if not session_requirement_id or not proposed_sessions:
                return Response({"error": "Missing required fields"}, status=400)

            # Get the SessionRequirements object
            try:
                session_requirements = SessionRequirements.objects.get(id=session_requirement_id)
            except SessionRequirements.DoesNotExist:
                return Response({"error": "Invalid session requirement id"}, status=400)

            # Check if user has admin rights for this location
            admin_data = AdminData.objects.filter(
                user_id=user_id,
                learning_organization__learningorganizationlocation=session_requirements.learning_organization_location
            ).first()

            if not admin_data:
                raise PermissionDenied("User is not an admin for this location")

            # Check session lengths and store session times
            session_times = []
            for session in proposed_sessions:
                start_time = datetime.fromisoformat(session['start_time'])
                end_time = datetime.fromisoformat(session['end_time'])
                session_length = (end_time - start_time).total_seconds() / 3600
                if session_length < session_requirements.minimum_session_hours:
                    return Response({
                        "error": f"Session starting at {start_time} is shorter than the minimum required length of {session_requirements.minimum_session_hours} hours"
                    }, status=400)
                session_times.append((start_time, end_time))

            # Check for overlapping sessions
            # session_times.sort(key=lambda x: x[0])  # Sort by start time
            # for i in range(1, len(session_times)):
            #     if session_times[i][0] < session_times[i-1][1]:
            #         print("here2")
            #         return Response({
            #             "error": f"Sessions overlap: {session_times[i-1]} and {session_times[i]}"
            #         }, status=400)
            # Check if sessions cover the minimum number of consecutive weeks
            start_dates = [datetime.fromisoformat(session['start_time']).date() for session in proposed_sessions]
            end_dates = [datetime.fromisoformat(session['end_time']).date() for session in proposed_sessions]
            total_weeks = (max(end_dates) - min(start_dates)).days // 7 + 1
            if total_weeks < session_requirements.minmum_num_weeks_consecutive:
                return Response({
                    "error": f"Sessions do not cover the minimum of {session_requirements.minmum_num_weeks_consecutive} consecutive weeks"
                }, status=400)

            # Organize sessions into weeks and count distinct days
            weeks = defaultdict(set)
            for session in proposed_sessions:
                start_time = datetime.fromisoformat(session['start_time'])
                week_number = start_time.isocalendar()[1]
                weeks[week_number].add(start_time.date())

            # Calculate average days per week, excluding exempt weeks
            sorted_weeks = sorted(weeks.items(), key=lambda x: len(x[1]))
            print(sorted_weeks, session_requirements.num_exempt_weeks)
            non_exempt_weeks = sorted_weeks[:len(sorted_weeks) - session_requirements.num_exempt_weeks] # maybe wrong
            # print("here4")
            # print(non_exempt_weeks)
            if len(non_exempt_weeks) == 0:
                return Response({"error": "Not enough weeks with sessions after exemptions"}, status=400)

            avg_days_per_week = sum(len(days) for _, days in non_exempt_weeks) / len(non_exempt_weeks)

            if avg_days_per_week < session_requirements.minimum_avg_days_per_week:
                return Response({
                    "error": f"Average of {avg_days_per_week:.2f} days per week is less than the required {session_requirements.minimum_avg_days_per_week} days"
                }, status=400)

            # Create sessions and approval token
            approval_token, created_sessions = self.create_sessions_and_approval_token(
                proposed_sessions, admin_data, session_requirements
            )

            # Generate and send email
            # html_sessions = self.format_sessions_to_html(proposed_sessions, str(approval_token.token))
            self.send(proposed_sessions, ["ddevaul@princeton.edu", "francis@heulearning.org"], approval_token)

            print("here")

            # # If all checks pass, create the sessions
            # created_sessions = []
            # for session_data in proposed_sessions:
            #     session = Session.objects.create(
            #         admin_creator=admin_data,
            #         learning_organization_location=session_requirements.learning_organization_location,
            #         start_time=session_data['start_time'],
            #         end_time=session_data['end_time']
            #     )
            #     created_sessions.append(session)
            
            # html_sessions = self.format_sessions_to_html(proposed_sessions)
            # self.send(proposed_sessions, ["ddevaul@princeton.edu", "francis@heulearning.org"])

            print("sent")
            return Response({
                "message": f"Successfully created {len(created_sessions)} sessions",
                "session_ids": [session.id for session in created_sessions]
            }, status=201)

        except AuthenticationFailed as e:
            print(e)
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            print(e)
            return Response({"error": str(e)}, status=403)
        except Exception as e:
            print(e)
            logger.error(f"Unexpected error in AdminSessionsView POST: {str(e)}")
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
            return AdminData.objects.select_related('learning_organization').filter(user_id=user_id)
        except AdminData.DoesNotExist:
            raise PermissionDenied("User is not an admin")

    def get_session(self, session_pk):
        try:
            return Session.objects.select_related('learning_organization_location').get(id=session_pk)
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

    # def get_user_django_info(self, user_id):
    #     return get_object_or_404(CustomUser, user_id=user_id)

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
            admin_data_queryset = self.get_admin_data(user_id)
            print(admin_data_queryset)
            if not admin_data_queryset.exists():
                raise PermissionDenied("User is not an admin")

            # Get session
            session = self.get_session(session_pk)

            # Get the admin's name
            user_data = self.get_user_django_info(user_id=user_id)
            
            # Check if admin is associated with the session's learning organization
            session_learning_org = session.learning_organization_location.learning_organization
            if not admin_data_queryset.filter(learning_organization=session_learning_org).exists():
                raise PermissionDenied("Admin is not associated with this session's learning organization")
           
            # Delete the session
            session.delete()

            logger.info(f"Session '{session_pk}' deleted by admin {user_data.first_name} {user_data.last_name} ID: {user_id}")
            return Response({"message": f"Session '{session_pk}' successfully deleted"}, status=200)

        except (AuthenticationFailed, PermissionDenied, NotFound) as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in AdminSessionDetailView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        
class InstructorSessionsView(APIView):
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

            # Get InstructorData for the user
            try:
                instructor_data = InstructorData.objects.get(user_id=user_id)
                if not instructor_data.verified:
                    raise PermissionDenied("Instructor is not verified")
            except InstructorData.DoesNotExist:
                raise PermissionDenied("User is not an instructor")

            # Get all sessions for this instructor
            # sessions = Session.objects.filter(instructors__contains=[user_id]).select_related(
            #     'learning_organization_location__learning_organization'
            # )
            sessions = Session.objects.filter(instructors__contains=[user_id]).select_related(
                'learning_organization_location__learning_organization'
            )

            sessions_data = []
            for session in sessions:
                location = session.learning_organization_location
                learning_organization = location.learning_organization

                enrolled = session.enrolled_students or []
                waitlisted = session.waitlist_students or []

                # Calculate max capacity for this location
                max_capacity = Room.objects.filter(
                    learning_organization=learning_organization,
                    learning_organization_location=location
                ).aggregate(total_capacity=Sum('max_capacity'))['total_capacity'] or 0

                # Fetch other instructors for this session
                other_instructor_ids = [id for id in (session.instructors or []) if id != user_id]
                other_instructors = CustomUser.objects.filter(user_id__in=other_instructor_ids).values('first_name', 'last_name', 'user_id')

                sessions_data.append({
                    "id": session.id,
                    "start_time": session.start_time,
                    "end_time": session.end_time,
                    "max_capacity": max_capacity,
                    "num_enrolled": len(enrolled),
                    "num_waitlist": len(waitlisted),
                    "learning_organization_name": learning_organization.name,
                    "location_name": location.name,
                    "approved": session.approved,
                    "viewed": session.viewed,
                    "other_instructors": list(other_instructors)
                })

            return Response({
                "instructor_id": user_id,
                "sessions": sessions_data
            })

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except Exception as e:
            logger.error(f"Unexpected error in InstructorSessionsView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)


class InstructorSessionDetailView(APIView):
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

    def get_session(self, session_pk):
        try:
            return Session.objects.get(id=session_pk)
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

            # Verify that the user is an instructor
            try:
                instructor_data = InstructorData.objects.get(user_id=u_id)
                if not instructor_data.verified:
                    raise PermissionDenied("Instructor is not verified")
            except InstructorData.DoesNotExist:
                raise PermissionDenied("User is not an instructor")

            session = self.get_session(session_pk)
            if not session.approved:
                raise PermissionDenied("This session is not approved for instructor assignment.")
            
            body = json.loads(request.body)
            task = body.get("task")

            if task == "sign_up":
                return self.sign_up_instructor(session, u_id)
            elif task == "remove":
                return self.remove_instructor(session, u_id)
            else:
                raise ValidationError("Unknown task")

        except (AuthenticationFailed, NotFound, ValidationError, PermissionDenied) as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in InstructorSessionDetailView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        
    def sign_up_instructor(self, session, u_id):
        instructors = session.instructors or []
        if u_id in instructors:
            return Response({"message": "Already signed up to teach this session"})
        instructors.append(u_id)
        session.instructors = instructors
        session.save()
        return Response({"message": "Successfully signed up to teach"})

    def remove_instructor(self, session, u_id):
        instructors = session.instructors or []
        if u_id not in instructors:
            return Response({"message": "Not signed up to teach this session"})
        instructors.remove(u_id)
        session.instructors = instructors
        session.save()
        return Response({"message": "Successfully removed from teaching this session"})
    
class LoginUserView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def get_user_info(self, access_token):
        domain = os.environ.get('AUTH0_DOMAIN')
        if not domain:
            logger.error("AUTH0_DOMAIN not set in environment variables")
            raise ValueError("AUTH0_DOMAIN not configured")
        headers = {"Authorization": f'Bearer {access_token}'}
        response = requests.get(f'https://{domain}/userinfo', headers=headers)
        response.raise_for_status()
        return response.json()

    def verify_token(self, token):
        try:
            # This is a basic verification. For production, use a proper JWT library
            # and fetch the public key from Auth0
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        except jwt.DecodeError:
            return None

    def get(self, request):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                # Token is present, verify it
                token = auth_header.split(' ')[1]
                payload = self.verify_token(token)
                if not payload:
                    return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
                user_info = self.get_user_info(token)
            else:
                # No token, this is the initial login
                # The frontend should send the access_token in the request body or as a query parameter
                access_token = request.GET.get('access_token') or request.data.get('access_token')
                if not access_token:
                    return Response({"error": "No access token provided"}, status=status.HTTP_400_BAD_REQUEST)
                user_info = self.get_user_info(access_token)

            logger.info(f"Retrieved user info: {user_info}")

            with transaction.atomic():
                user, created = CustomUser.objects.update_or_create(
                    user_id=user_info["sub"],
                    defaults={
                        "username": user_info.get("nickname", ""),
                        "email": user_info.get("email", ""),
                        "first_name": user_info.get("given_name", ""),
                        "last_name": user_info.get("family_name", ""),
                    }
                )

                if created:
                    logger.info(f"Created new user: {user.user_id}")
                    return Response({"message": "User created", "user_id": user.user_id}, status=status.HTTP_201_CREATED)
                else:
                    logger.info(f"Updated existing user: {user.user_id}")
                    return Response({"message": "User updated", "user_id": user.user_id}, status=status.HTTP_200_OK)

        except requests.RequestException as e:
            logger.error(f"Failed to retrieve user info from Auth0: {str(e)}")
            return Response({"error": "Failed to retrieve user info from Auth0"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValidationError as e:
            logger.error(f"Validation error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("An unexpected error occurred")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SessionPhasesView(APIView):
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

    def get(self, request, session_pk):
        try:
            # Authenticate user
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get the session
            try:
                session = Session.objects.get(id=session_pk)
            except Session.DoesNotExist:
                return Response({"error": "Session not found"}, status=404)

            # Check if the user is an instructor for this session
            if user_id not in session.instructors:
                raise PermissionDenied("User is not an instructor for this session")

            # Get the lesson plan associated with the session
            lesson_plan = session.lesson_plan
            if not lesson_plan:
                return Response({"error": "No lesson plan associated with this session"}, status=404)

            # Get all phases for this lesson plan
            phase_counters = lesson_plan.phases.all().order_by('order')
            phases_data = []

            for phase_counter in phase_counters:
                phase = phase_counter.phase
                module_counters = phase.modules.all().order_by('order')
                modules_data = []
                phase_duration = 0
                for module_counter in module_counters:
                    module = module_counter.module
                    # question_counters = module.questions.all().order_by('order')
                    # questions_data = []

                    # for question_counter in question_counters:
                    #     question = question_counter.question
                    #     questions_data.append({
                    #         "id": question.custom_id,
                    #         "text": question.text,
                    #         "audio": question.audio,
                    #         "image": question.image,
                    #         "json": question.json
                    #     })

                    modules_data.append({
                        "id": module.id,
                        "name": module.name,
                        "suggested_duration_seconds": module.suggested_duration_seconds,
                        # "questions": questions_data
                    })
                    phase_duration += module.suggested_duration_seconds
                phases_data.append({
                    "id": phase.id,
                    "name": phase.name,
                    "modules": modules_data,
                    "phase_duration_seconds": phase_duration
                })

            return Response({
                "session_id": session_pk,
                "lesson_plan_id": lesson_plan.pk,
                "lesson_plan_name": lesson_plan.name,
                "phases": phases_data
            })

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except Exception as e:
            logger.error(f"Unexpected error in SessionPhasesView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

class PhaseModulesView(APIView):
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

    def get(self, request, phase_pk):
        try:
            # Authenticate user
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get the phase
            try:
                phase = Phase.objects.get(id=phase_pk)
            except Phase.DoesNotExist:
                return Response({"error": "Phase not found"}, status=404)

            # TODO: Add appropriate permission check here
            # For example, check if the user is an instructor for a session that includes this phase
            # This will depend on your specific authorization requirements

            # Get all modules for this phase
            module_counters = phase.modules.all().order_by('order')
            modules_data = []

            for module_counter in module_counters:
                module = module_counter.module
                # question_counters = module.questions.all().order_by('order')
                # questions_data = []

                # for question_counter in question_counters:
                #     question = question_counter.question
                #     questions_data.append({
                #         "id": question.custom_id,
                #         "text": question.text,
                #         "audio": question.audio,
                #         "image": question.image,
                #         "json": question.json
                #     })

                modules_data.append({
                    "id": module.id,
                    "name": module.name,
                    "suggested_duration_seconds": module.suggested_duration_seconds,
                    "description": module.description
                    # "questions": questions_data
                })

            return Response({
                "phase_id": phase_pk,
                "phase_name": phase.name,
                "type": phase.type,
                "description": phase.description,
                "modules": modules_data
            })

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except Exception as e:
            logger.error(f"Unexpected error in PhaseModulesView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

class InstructorApplicationTemplateView(APIView):
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

            # Get all AdminData objects for this user
            admin_data = AdminData.objects.filter(user_id=user_id)
            if not admin_data.exists():
                return Response({"error": "User does not have admin permissions"}, status=403)

            # Get the InstructorData for this user (if it exists)
            instructor_data = InstructorData.objects.filter(user_id=user_id).first()

            # Get all learning organization locations where the user is an admin
            learning_org_locations = LearningOrganizationLocation.objects.filter(
                learning_organization__in=admin_data.values('learning_organization')
            ).prefetch_related(
                Prefetch(
                    'instructorapplicationtemplate_set',
                    queryset=InstructorApplicationTemplate.objects.select_related('admin_creator'),
                    to_attr='templates'
                )
            )

            return_data = defaultdict(list)
            for location in learning_org_locations:
                location_data = {
                    "id": location.id,
                    "location_name": location.name,
                    "learning_organization_name": location.learning_organization.name,
                    "templates": []
                }

                for template in location.templates:
                    template_data = {
                        "id": template.id,
                        "google_form_link": template.google_form_link,
                        "active": template.active,
                        "admin_creator": template.admin_creator.user_id
                    }

                    # Get the InstructorApplicationInstance for this template and user (if it exists)
                    if instructor_data:
                        application_instance = InstructorApplicationInstance.objects.filter(
                            template=template,
                            instructor_id=instructor_data
                        ).first()

                        if application_instance:
                            template_data.update({
                                "application_instance_id": application_instance.id,
                                "completed": application_instance.completed,
                                "reviewed": application_instance.reviewed,
                                "accepted": application_instance.accepted,
                                "approver": application_instance.approver.user_id if application_instance.approver else None
                            })

                    location_data["templates"].append(template_data)

                return_data[location.learning_organization.name].append(location_data)

            # Convert defaultdict to regular dict for JSON serialization
            formatted_return_data = dict(return_data)
            return Response(formatted_return_data)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except Exception as e:
            logger.error(f"Unexpected error in InstructorApplicationTemplateView GET: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        
    def post(self, request):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            location_id = request.data.get('learning_organization_location')
            google_form_link = request.data.get('google_form_link')
            active = request.data.get('active', True)

            if not location_id or not google_form_link:
                return Response({"error": "Missing required fields"}, status=400)

            location = LearningOrganizationLocation.objects.get(id=location_id)
            
            admin_data = AdminData.objects.filter(
                user_id=user_id, 
                learning_organization=location.learning_organization
            ).first()

            if not admin_data:
                return Response({"error": "You don't have admin permissions for this learning organization"}, status=403)

            template = InstructorApplicationTemplate.objects.create(
                admin_creator=admin_data,
                learning_organization_location=location,
                google_form_link=google_form_link,
                active=active
            )

            return Response({
                "message": "Template created successfully",
                "id": template.id,
                "learning_organization_location": template.learning_organization_location.name,
                "google_form_link": template.google_form_link,
                "active": template.active
            }, status=201)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except LearningOrganizationLocation.DoesNotExist:
            return Response({"error": "Invalid learning organization location"}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in InstructorApplicationTemplateView POST: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

class InstructorApplicationInstanceAdminView(APIView):
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

    def get(self, request, template_id):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get the InstructorApplicationTemplate
            template = get_object_or_404(InstructorApplicationTemplate, id=template_id)

            # Check if the user has admin permissions for this template's learning organization location
            admin_data = AdminData.objects.filter(
                user_id=user_id,
                learning_organization=template.learning_organization_location.learning_organization
            ).first()

            if not admin_data:
                raise PermissionDenied("You don't have admin permissions for this learning organization")

            # Get all InstructorApplicationInstances for this template
            instances = InstructorApplicationInstance.objects.filter(template=template).select_related('instructor_id', 'approver')

            # Sort instances by acceptance status
            accepted_instances = []
            rejected_instances = []
            unreviewed_instances = []

            for instance in instances:
                instance_data = {
                    "id": instance.id,
                    "instructor_id": instance.instructor_id.user_id,
                    "reviewed": instance.reviewed,
                    "accepted": instance.accepted,
                    "approver": instance.approver.user_id if instance.approver else None
                }
                if not instance.reviewed:
                    unreviewed_instances.append(instance_data)
                elif instance.accepted:
                    accepted_instances.append(instance_data)
                else:
                    rejected_instances.append(instance_data)

            return_data = {
                "template_id": template.id,
                "google_form_link": template.google_form_link,
                "learning_organization_location": template.learning_organization_location.name,
                "learning_organization": template.learning_organization_location.learning_organization.name,
                "accepted_instances": accepted_instances,
                "rejected_instances": rejected_instances,
                "unreviewed_instances": unreviewed_instances
            }

            return Response(return_data)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except InstructorApplicationTemplate.DoesNotExist:
            return Response({"error": "Invalid instructor application template ID"}, status=404)
        except Exception as e:
            logger.error(f"Unexpected error in InstructorApplicationInstanceTemplateView GET: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

    def post(self, request):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get the instance id and new approval status from the request data
            instance_id = request.data.get('instance_id')
            approved = request.data.get('approved')

            if instance_id is None or approved is None:
                return Response({"error": "Missing instance_id or approved status"}, status=400)

            # Get the InstructorApplicationInstance
            instance = get_object_or_404(InstructorApplicationInstance, id=instance_id)

            # Get the associated LearningOrganizationLocation
            location = instance.template.learning_organization_location

            # Check if the user is an admin for this learning organization
            admin_data = AdminData.objects.filter(
                user_id=user_id,
                learning_organization=location.learning_organization
            ).first()

            if not admin_data:
                raise PermissionDenied("You don't have admin permissions for this learning organization")

            # Update the instance
            instance.reviewed = True
            instance.accepted = approved
            instance.approver = admin_data  # Set the approver to the admin who made the change
            instance.save()

            return Response({
                "message": "Application instance updated successfully",
                "id": instance.id,
                "instructor_id": instance.instructor_id.user_id,
                "template_id": instance.template.id,
                "reviewed": instance.reviewed,
                "accepted": instance.accepted,
                "approver": admin_data.user_id
            }, status=200)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except InstructorApplicationInstance.DoesNotExist:
            return Response({"error": "Invalid instructor application instance ID"}, status=404)
        except Exception as e:
            logger.error(f"Unexpected error in InstructorApplicationInstanceView POST: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

class InstructorApplicationInstanceView(APIView):
    # permission_classes = [IsAuthenticated]

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


            # Check if the user has any associated InstructorData
            instructor_data = InstructorData.objects.filter(user_id=user_id).first()

            if not instructor_data:
                return Response({"error": "User is not an instructor"}, status=status.HTTP_403_FORBIDDEN)

            # Get all active InstructorApplicationTemplates
            active_templates = InstructorApplicationTemplate.objects.filter(active=True)

            # Prepare the response data
            template_data = []
            for template in active_templates:
                # Get the associated InstructorApplicationInstance for this template and user
                instance = InstructorApplicationInstance.objects.filter(
                    template=template,
                    instructor_id=instructor_data
                ).first()

                instance_data = None
                if instance:
                    instance_data = {
                        "id": instance.id,
                        "completed": instance.completed,
                        "reviewed": instance.reviewed,
                        "accepted": instance.accepted,
                        "approver": instance.approver.user_id if instance.approver else None
                    }

                template_data.append({
                    "learning_organization_location_name": template.learning_organization_location.name,
                    "learning_organization_name": template.learning_organization_location.learning_organization.name,
                    "google_form_link": template.google_form_link,
                    "id": template.id,
                    "application_instance": instance_data
                })

            return Response({
                "instructor_id": user_id,
                "active_templates": template_data
            }, status=status.HTTP_200_OK)

        except AuthenticationFailed as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ObjectDoesNotExist as e:
            return Response({'error': f"Not found: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error in get method: {str(e)}")
            return Response({'error': "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InstructorApplicationInstanceDetailView(APIView):
    # permission_classes = [IsAuthenticated]
    def get_user_info(self, token):
        cache_key = f'user_info_{token[:10]}'
        cached_info = cache.get(cache_key)
        if cached_info:
            return cached_info
        
        domain = os.environ.get('AUTH0_DOMAIN')
        if not domain:
            logger.error("AUTH0_DOMAIN environment variable is not set")
            raise AuthenticationFailed("Authentication service misconfigured")

        headers = {"Authorization": f'Bearer {token}'}
        try:
            response = requests.get(f'https://{domain}/userinfo', headers=headers)
            response.raise_for_status()
        except requests.RequestException as e:
            logger.error(f"Error fetching user info from Auth0: {str(e)}")
            raise AuthenticationFailed("Failed to retrieve user info")

        user_info = response.json()
        cache.set(cache_key, user_info, 3600)  # Cache for 1 hour
        return user_info

    def get(self, request, template_id):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info.get('sub')
            if not user_id:
                raise AuthenticationFailed("User ID not found in token")

            instructor_data = get_object_or_404(InstructorData, user_id=user_id)
            template = get_object_or_404(InstructorApplicationTemplate, id=template_id)

            instance, created = InstructorApplicationInstance.objects.get_or_create(
                template=template,
                instructor_id=instructor_data,
                defaults={'reviewed': False, 'accepted': False, 'completed': False}
            )

            response_data = {
                'id': instance.id,
                'template_id': instance.template.id,
                'google_form_link': instance.template.google_form_link,
                'instructor_id': instance.instructor_id.user_id,
                'learning_organization_name': instance.template.learning_organization_location.learning_organization.name,
                'learning_organization_location_name': instance.template.learning_organization_location.name,
                'accepted': instance.accepted,
                'completed': instance.completed,
                'reviewed': instance.reviewed,
                'approver': instance.approver.user_id if instance.approver else None,
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except AuthenticationFailed as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ObjectDoesNotExist as e:
            return Response({'error': f"Not found: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error in get method: {str(e)}")
            return Response({'error': "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, instance_id):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info.get('sub')
            if not user_id:
                raise AuthenticationFailed("User ID not found in token")

            instructor_data = get_object_or_404(InstructorData, user_id=user_id)
            instance = get_object_or_404(
                InstructorApplicationInstance,
                id=instance_id,
                instructor_id=instructor_data
            )

            if request.data.get('completed') is True:
                instance.completed = True
                instance.save()
                return Response({
                    'message': 'Application marked as completed successfully',
                    'id': instance.id,
                    'completed': instance.completed,
                    'template_id': instance.template.id,
                    'instructor_id': instance.instructor_id.user_id
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid request. Only setting completed to True is allowed.'
                }, status=status.HTTP_400_BAD_REQUEST)

        except AuthenticationFailed as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ObjectDoesNotExist as e:
            return Response({'error': f"Not found: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error in put method: {str(e)}")
            return Response({'error': "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, instance_id):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info.get('sub')
            if not user_id:
                raise AuthenticationFailed("User ID not found in token")

            instructor_data = get_object_or_404(InstructorData, user_id=user_id)
            instance = get_object_or_404(
                InstructorApplicationInstance,
                id=instance_id,
                instructor_id=instructor_data
            )

            # Check if the instance has already been reviewed
            if instance.reviewed:
                return Response({
                    'error': 'Cannot delete an application that has already been reviewed.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Perform the deletion
            instance.delete()

            return Response({
                'message': 'Application instance deleted successfully',
                'id': instance_id
            }, status=status.HTTP_200_OK)

        except AuthenticationFailed as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ObjectDoesNotExist as e:
            return Response({'error': f"Not found: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error in delete method: {str(e)}")
            return Response({'error': "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # def post(self, request):
    #     user = request.user

    #     # Verify that the user has an associated InstructorData
    #     instructor_data = get_object_or_404(InstructorData, user_id=user.user_id)

    #     # Check if the request body contains 'delete' and an 'id'
    #     if request.data.get('action') == 'delete' and 'id' in request.data:
    #         instance_id = request.data['id']

    #         # Get the InstructorApplicationInstance
    #         instance = get_object_or_404(InstructorApplicationInstance, id=instance_id, instructor_id=instructor_data)

    #         # Delete the instance
    #         instance.delete()

    #         return Response({'message': 'InstructorApplicationInstance deleted successfully'}, status=status.HTTP_200_OK)
        
    #     return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

class LocationsView(APIView):
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

            # Check if the user exists
            try:
                user = CustomUser.objects.get(user_id=user_id)
            except CustomUser.DoesNotExist:
                raise PermissionDenied("User does not exist")

            # Get all locations
            locations = LearningOrganizationLocation.objects.select_related('learning_organization').all()
            
            locations_data = []
            for location in locations:
                # Calculate max capacity for this location
                max_capacity = Room.objects.filter(
                    learning_organization=location.learning_organization,
                    learning_organization_location=location
                ).aggregate(total_capacity=Sum('max_capacity'))['total_capacity'] or 0

                locations_data.append({
                    "id": location.id,
                    "name": location.name,
                    "learning_organization": {
                        "id": location.learning_organization.id,
                        "name": location.learning_organization.name
                    },
                    "max_capacity": max_capacity
                })

            return Response({
                "locations": locations_data
            })

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except Exception as e:
            logger.error(f"Unexpected error in LocationsView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)

# class SessionRequirementsView(APIView):
    # def get_user_info(self, token):
    #     cache_key = f'user_info_{token[:10]}'
    #     cached_info = cache.get(cache_key)
    #     if cached_info:
    #         return cached_info
        
    #     domain = os.environ.get('AUTH0_DOMAIN')
    #     headers = {"Authorization": f'Bearer {token}'}
    #     response = requests.get(f'https://{domain}/userinfo', headers=headers)
        
    #     if response.status_code != 200:
    #         logger.error(f"Auth0 returned status code {response.status_code}")
    #         raise AuthenticationFailed("Failed to retrieve user info")
        
    #     user_info = response.json()
    #     cache.set(cache_key, user_info, 3600)  # Cache for 1 hour
    #     return user_info

    # def get(self, request):
    #     try:
    #         auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    #         if not auth_header.startswith('Bearer '):
    #             raise AuthenticationFailed("Invalid authorization header")
            
    #         token = auth_header.split(' ')[1]
    #         user_info = self.get_user_info(token)
    #         user_id = user_info['sub']

    #         # Get all AdminData objects for this user
    #         admin_data = AdminData.objects.filter(user_id=user_id)
    #         if not admin_data.exists():
    #             return Response({"error": "User does not have admin permissions"}, status=403)

    #         # Get all learning organization locations where the user is an admin
    #         learning_org_locations = LearningOrganizationLocation.objects.filter(
    #             learning_organization__in=admin_data.values('learning_organization')
    #         ).prefetch_related('sessionrequirements_set')

    #         requirements_data = []
    #         for location in learning_org_locations:
    #             for requirement in location.sessionrequirements_set.all():
    #                 requirements_data.append({
    #                     "location_name": location.name,
    #                     "location_id": location.id,
    #                     "learning_organization_name": location.learning_organization.name,
    #                     "learning_organization_id": location.learning_organization.id,
    #                     "requirement_id": requirement.id,
    #                     "minimum_session_hours": requirement.minimum_session_hours,
    #                     "minmum_num_weeks_consecutive": requirement.minmum_num_weeks_consecutive,
    #                     "minimum_avg_days_per_week": requirement.minimum_avg_days_per_week,
    #                     "num_exempt_weeks": requirement.num_exempt_weeks
    #                 })

    #         # Sort the requirements_data by location name
    #         requirements_data.sort(key=lambda x: x['location_name'])

    #         # Debug logging
    #         logger.debug(f"User ID: {user_id}")
    #         logger.debug(f"Admin Data Count: {admin_data.count()}")
    #         logger.debug(f"Learning Org Locations Count: {learning_org_locations.count()}")
    #         logger.debug(f"Requirements Data Count: {len(requirements_data)}")

    #         return Response(requirements_data)

    #     except AuthenticationFailed as e:
    #         return Response({"error": str(e)}, status=401)
    #     except Exception as e:
    #         logger.error(f"Unexpected error in SessionRequirementsView GET: {str(e)}")
    #         return Response({"error": "An unexpected error occurred"}, status=500)

class SessionRequirementsView(APIView):
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

    def get(self, request, location_id):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get the location
            location = get_object_or_404(LearningOrganizationLocation, id=location_id)

            # Check if the admin is associated with the location's learning organization
            # admin_data = AdminData.objects.filter(
            #     user_id=user_id,
            #     learning_organization=location.learning_organization
            # )
            # if not admin_data.exists():
            #     raise PermissionDenied("User does not have admin permissions for this location")
            #             # Get the session requirements for the location
            session_requirements = get_object_or_404(SessionRequirements, learning_organization_location=location)

            requirements_data = {
                "location_name": location.name,
                "location_id": location.id,
                "learning_organization_name": location.learning_organization.name,
                "learning_organization_id": location.learning_organization.id,
                "requirement_id": session_requirements.id,
                "minimum_session_hours": session_requirements.minimum_session_hours,
                "minimum_num_weeks_consecutive": session_requirements.minmum_num_weeks_consecutive,
                "minimum_avg_days_per_week": session_requirements.minimum_avg_days_per_week,
                "num_exempt_weeks": session_requirements.num_exempt_weeks
            }

            # Debug logging
            logger.debug(f"User ID: {user_id}")
            logger.debug(f"Location ID: {location_id}")
            logger.debug(f"Session Requirements ID: {session_requirements.id}")

            return Response(requirements_data)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except NotFound as e:
            return Response({"error": str(e)}, status=404)
        except Exception as e:
            logger.error(f"Unexpected error in SessionRequirementsView GET: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
        
class EmailView(APIView):
    def send(self):
        send_mail('Subject here', 'Here is the message.', 'desi.devaul@gmail.com', ['ddevaul@princeton.edu', 'francis@heulearning.org'], fail_silently=False)

    def get(self, request):
        self.send()
        return Response("sent an email we hope")
    
class SessionApprovalView(APIView):
    def get(self, request, token, action):
        try:
            approval_token = SessionApprovalToken.objects.get(token=token)
            
            if not approval_token.is_valid():
                return HttpResponse("This approval link has expired or already been used.")
            
            sessions = approval_token.sessions.all()
            
            if action == 'accept':
                sessions.update(approved=True)
                message = "All sessions have been accepted."
            elif action == 'deny':
                sessions.update(approved=False)  # or sessions.delete() if you prefer
                message = "All sessions have been denied."
            else:
                return HttpResponse("Invalid action.")
            
            approval_token.used = True
            approval_token.save()
            
            return HttpResponse(message)
        
        except SessionApprovalToken.DoesNotExist:
            return HttpResponse("Invalid approval token.")
        

class AdminApproveAdminView(APIView):
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

    def post(self, request):
        try:
            # Authenticate user
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed("Invalid authorization header")
            
            token = auth_header.split(' ')[1]
            user_info = self.get_user_info(token)
            user_id = user_info['sub']

            # Get request data
            learning_organization_id = request.data.get('learning_organization_id')
            admin_data_id = request.data.get('admin_data_id')

            if not learning_organization_id or not admin_data_id:
                return Response({"error": "Missing required parameters"}, status=400)

            # Get the learning organization
            learning_organization = get_object_or_404(LearningOrganization, id=learning_organization_id)

            # Check if the requesting user is an admin for this organization
            try:
                requesting_admin = AdminData.objects.get(user_id=user_id, learning_organization=learning_organization, verified=True)
            except AdminData.DoesNotExist:
                raise PermissionDenied("You are not an admin for this organization")

            # Get the AdminData object to be updated
            admin_to_update = get_object_or_404(AdminData, id=admin_data_id, learning_organization=learning_organization)

            # Update the verified flag
            admin_to_update.verified = True
            admin_to_update.save()

            return Response({
                "message": "Admin approval successful",
                "admin_data": {
                    "id": admin_to_update.id,
                    "user_id": admin_to_update.user_id,
                    "verified": admin_to_update.verified,
                    "learning_organization": learning_organization.name
                }
            })

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except Exception as e:
            logger.error(f"Unexpected error in AdminApproveAdminView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)
