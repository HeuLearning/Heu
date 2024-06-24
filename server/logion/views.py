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
# from .bert import all_possibilities, remove_diacritics, get_results, get_desi_result, get_results_2
# from .getcontext import get_context
import os
import requests
import json
import re
import random

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
    def get(self, request):
        bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
        try:
            u = CustomUser.objects.get(user_id=result["sub"])
        except: 
            return Response("no type")
        u = UserSerializer(u)
        role = u.data["user_type"]
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
        elif role == "st": 
            st_data = StudentData.objects.get(user_id=result["sub"])
            st_data = StudentDataSerializer(st_data)
            role_data = st_data
        else: 
            return Response("no type")
            
        return Response({"role": role, "verified": role_data.data["verified"]})


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
    def get(self, request):
        bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
        u = CustomUser.objects.get(user_id=result["sub"])
        u_id = result["sub"]
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
    
class UserSessionDetailView(APIView):
    def post(self, request, session_pk, format=None):
        bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
        u_id = result["sub"]
        # u = CustomUser.objects.get(user_id=u_id)
        session = Session.objects.get(id=session_pk)
        body = json.loads(request.body)
        task = body["task"]
        rooms = Room.objects.all().filter(learning_organization=session.learning_organization)
        max_cap = 0
        for r in rooms:
            max_cap += r.max_capacity
        if task == "enroll":
            enrolled = session.enrolled_students["enrolled_students"]
            if u_id in enrolled:
                return Response("already enrolled")
            if len(enrolled) >= max_cap:
                return Response("class filled up")
            enrolled.append(u_id)
            session.enrolled_students["enrolled_students"] = enrolled
            session.save()
            return Response("successfully enrolled")
        elif task == "waitlist":
            waitlist = session.waitlist_students["waitlist_students"]
            if u_id in waitlist:
                return Response("already on the waitlist")
            waitlist.append(u_id)
            session.waitlist_students["waitlist_students"] = waitlist
            session.save()
            return Response("successfully joined waitlist")
        elif task == "drop_waitlist":
            waitlist = session.waitlist_students["waitlist_students"]
            if u_id not in waitlist:
                return Response("not on the waitlist")
            waitlist.remove(u_id)
            session.waitlist_students["waitlist_students"] = waitlist
            session.save()
            return Response("successfully dropped waitlist")
        elif task == "unenroll":
            enrolled = session.enrolled_students["enrolled_students"]
            if u_id not in enrolled:
                return Response("not enrolled")
            enrolled.remove(u_id)
            waitlist = session.waitlist_students["waitlist_students"]
            if len(waitlist) > 0:
                temp = waitlist.pop(0)
                enrolled.push(temp)
                session.waitlist_students["waitlist_students"] = waitlist
            session.enrolled_students["enrolled_students"] = enrolled
            session.save()
            return Response("successfully unenrolled")
        else:
            return Response("unknown task")

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

