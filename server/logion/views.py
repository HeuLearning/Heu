from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from django.http import Http404
from django.views.generic.detail import DetailView
from .serializers import (AssessmentSerializer, QuestionSerializer)
from .models import CustomUser, Question, Assessment, LookupIndex
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

class DemoView(APIView):
    def get(self, request):
        return Response("Whats up?")

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


    
class LoginUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        bearer_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        result = requests.get(url=f'https://{domain}/userinfo', headers=headers).json()
        print(result)
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

