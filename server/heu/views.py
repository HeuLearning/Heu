from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from django.http import Http404
from django.views.generic.detail import DetailView
from .serializers import (AssessmentSerializer, QuestionSerializer, UserSerializer, AdminDataSerializer, InstructorDataSerializer, StudentDataSerializer, HeuStaffDataSerializer, LearningOrganizationSerializer, LearningOrganizationLocationSerializer, RoomSerializer, SessionSerializer, SessionPrerequisitesSerializer)
from .models import CustomUser, Question, Assessment, LookupIndex, AdminData, InstructorData, StudentData, HeuStaffData, LearningOrganization, LearningOrganizationLocation, Room, Session, SessionPrerequisites, InstructorApplicationTemplate, InstructorApplicationInstance, SessionRequirements
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
                        "viewed": session.viewed
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

            # Check session lengths
            for session in proposed_sessions:
                start_time = datetime.fromisoformat(session['start_time'])
                end_time = datetime.fromisoformat(session['end_time'])
                session_length = (end_time - start_time).total_seconds() / 3600
                if session_length < session_requirements.minimum_session_hours:
                    return Response({
                        "error": f"Session starting at {start_time} is shorter than the minimum required length of {session_requirements.minimum_session_hours} hours"
                    }, status=400)

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
            non_exempt_weeks = sorted_weeks[len(sorted_weeks) - session_requirements.num_exempt_weeks:] # maybe wrong
            
            if len(non_exempt_weeks) == 0:
                return Response({"error": "Not enough weeks with sessions after exemptions"}, status=400)

            avg_days_per_week = sum(len(days) for _, days in non_exempt_weeks) / len(non_exempt_weeks)

            if avg_days_per_week < session_requirements.minimum_avg_days_per_week:
                return Response({
                    "error": f"Average of {avg_days_per_week:.2f} days per week is less than the required {session_requirements.minimum_avg_days_per_week} days"
                }, status=400)

            # If all checks pass, create the sessions
            created_sessions = []
            for session_data in proposed_sessions:
                session = Session.objects.create(
                    admin_creator=admin_data,
                    learning_organization_location=session_requirements.learning_organization_location,
                    start_time=session_data['start_time'],
                    end_time=session_data['end_time']
                )
                created_sessions.append(session)

            return Response({
                "message": f"Successfully created {len(created_sessions)} sessions",
                "session_ids": [session.id for session in created_sessions]
            }, status=201)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=403)
        except Exception as e:
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

    def get_user_info(self, bearer_token):
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        response = requests.get(f'https://{domain}/userinfo', headers=headers)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        return response.json()

    def get(self, request, format=None):
        try:
            bearer_token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
            user_info = self.get_user_info(bearer_token)

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
                return Response({"message": "User created", "user_id": user.user_id}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "User updated", "user_id": user.user_id}, status=status.HTTP_200_OK)

        except requests.RequestException as e:
            return Response({"error": "Failed to retrieve user info from Auth0"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
                    "location": location.name,
                    "learning_organization": location.learning_organization.name,
                    "templates": []
                }

                for template in location.templates:
                    template_data = {
                        "id": template.id,
                        "google_form_link": template.google_form_link,
                        "active": template.active,
                        "admin_creator": template.admin_creator.user_id
                    }
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Check if the user has any associated InstructorData
        instructor_data = InstructorData.objects.filter(user_id=user.user_id).first()

        if not instructor_data:
            return Response({"error": "User is not an instructor"}, status=status.HTTP_403_FORBIDDEN)

        # Get all active InstructorApplicationTemplates
        active_templates = InstructorApplicationTemplate.objects.filter(active=True)

        # Prepare the response data
        template_data = []
        for template in active_templates:
            template_data.append({
                "learning_organization_location": template.learning_organization_location.name,
                "google_form_link": template.google_form_link,
                "id": template.id
            })

        return Response({
            "instructor_id": user.user_id,
            "active_templates": template_data
        }, status=status.HTTP_200_OK)

class InstructorApplicationInstanceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, template_id):
        user = request.user

        # Verify that the user has an associated InstructorData
        instructor_data = get_object_or_404(InstructorData, user_id=user.user_id)

        # Get the InstructorApplicationTemplate
        template = get_object_or_404(InstructorApplicationTemplate, id=template_id)

        # Check if an InstructorApplicationInstance already exists for this user and template
        instance, created = InstructorApplicationInstance.objects.get_or_create(
            template=template,
            instructor_id=instructor_data,
            defaults={'reviewed': False, 'accepted': False}
        )

        response_data = {
            'id': instance.id,
            'template_id': instance.template.id,
            'instructor_id': instance.instructor_id.user_id,
            'reviewed': instance.reviewed,
            'accepted': instance.accepted,
            'approver': instance.approver.user_id if instance.approver else None,
            'created': created
        }

        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user

        # Verify that the user has an associated InstructorData
        instructor_data = get_object_or_404(InstructorData, user_id=user.user_id)

        # Check if the request body contains 'delete' and an 'id'
        if request.data.get('action') == 'delete' and 'id' in request.data:
            instance_id = request.data['id']

            # Get the InstructorApplicationInstance
            instance = get_object_or_404(InstructorApplicationInstance, id=instance_id, instructor_id=instructor_data)

            # Delete the instance
            instance.delete()

            return Response({'message': 'InstructorApplicationInstance deleted successfully'}, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)


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
            ).prefetch_related('sessionrequirements_set')

            requirements_data = []

            for location in learning_org_locations:
                for requirement in location.sessionrequirements_set.all():
                    requirements_data.append({
                        "location_name": location.name,
                        "location_id": location.id,
                        "learning_organization_name": location.learning_organization.name,
                        "learning_organization_id": location.learning_organization.id,
                        "requirement_id": requirement.id,
                        "minimum_session_hours": requirement.minimum_session_hours,
                        "minmum_num_weeks_consecutive": requirement.minmum_num_weeks_consecutive,
                        "minimum_avg_days_per_week": requirement.minimum_avg_days_per_week,
                        "num_exempt_weeks": requirement.num_exempt_weeks
                    })

            # Sort the requirements_data by location name
            requirements_data.sort(key=lambda x: x['location_name'])

            return Response(requirements_data)

        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except Exception as e:
            logger.error(f"Unexpected error in SessionRequirementsView GET: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=500)