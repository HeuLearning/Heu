import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import redis
import os
from channels.db import database_sync_to_async
import requests
from urllib.parse import parse_qs
from heu.models import CustomUser, HardCodedModule, Question, HardCodedQuestionCounter
from django.forms.models import model_to_dict

# Create a Redis connection using the configuration from settings
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD', '')
redis_client = redis.Redis.from_url(f"rediss://:{REDIS_PASSWORD}@db-redis-nyc3-84439-do-user-17041273-0.a.db.ondigitalocean.com:25061")

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name = f'chat_{self.room_name}'

#         # Join room group
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )

#         await self.accept()

#         # Send previous messages
#         messages = await self.get_messages()
#         await self.send(text_data=json.dumps({
#             'type': 'history',
#             'messages': messages
#         }))

#     async def disconnect(self, close_code):
#         # Leave room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message = data['message']
#         username = data['username']

#         # Save the message to Redis
#         await self.save_message(username, message)

#         # Send message to room group
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'chat_message',
#                 'message': message,
#                 'username': username
#             }
#         )

#     async def chat_message(self, event):
#         message = event['message']
#         username = event['username']

#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'type': 'chat',
#             'message': message,
#             'username': username
#         }))

#     @sync_to_async
#     def get_messages(self):
#         # Get the last 50 messages from Redis
#         messages = redis_client.lrange(f'chat_messages:{self.room_name}', -50, -1)
#         return [json.loads(msg) for msg in messages]

#     @sync_to_async
#     def save_message(self, username, message):
#         # Save message to Redis
#         redis_client.rpush(f'chat_messages:{self.room_name}', json.dumps({
#             'username': username,
#             'message': message
#         }))
#         # Trim the list to keep only the last 100 messages
#         redis_client.ltrim(f'chat_messages:{self.room_name}', -100, -1)


# class KahootLikeConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name = f'kahoot_{self.room_name}'
#         self.instructor_group_name = f'kahoot_instructors_{self.room_name}'
        
#         # Extract token from query string
#         query_string = parse_qs(self.scope['query_string'].decode())
#         token = query_string.get('token', [None])[0]

#         if not token:
#             # Reject the connection if no token is provided
#             await self.close()
#             return

#         # Authenticate user
#         user_info = await self.get_user_info(token)
#         if not user_info:
#             # Reject the connection if authentication fails
#             await self.close()
#             return

#         self.user_id = user_info.get('sub')
#         self.user_role = 'instructor' if user_info.get('Instructor_Data') or user_info.get('Admin_Data') else 'student'

#         # Join room group
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )

#         # If instructor, also join the instructor group
#         if self.user_role == 'instructor':
#             await self.channel_layer.group_add(
#                 self.instructor_group_name,
#                 self.channel_name
#             )

#         await self.accept()

#         # Send role information to the client
#         await self.send(text_data=json.dumps({
#             'type': 'authentication_result',
#             'role': self.user_role
#         }))

#     async def disconnect(self, close_code):
#         # Leave room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )
#         # If instructor, also leave the instructor group
#         if self.user_role == 'instructor':
#             await self.channel_layer.group_discard(
# #                 self.instructor_group_name,
# #                 self.channel_name
# #             )

# #     async def receive(self, text_data):
# #         data = json.loads(text_data)
# #         message_type = data.get('type')
        
# #         if message_type == 'question' and self.user_role == 'instructor':
# #             question = data.get('question')
# #             options = data.get('options')
# #             await self.channel_layer.group_send(
# #                 self.room_group_name,
# #                 {
# #                     'type': 'broadcast_question',
# #                     'question': question,
# #                     'options': options
# #                 }
# #             )
# #         elif message_type == 'answer' and self.user_role == 'student':
# #             answer = data.get('answer')
# #             await self.channel_layer.group_send(
# #                 self.instructor_group_name,
# #                 {
# #                     'type': 'student_answer',
# #                     'user_id': self.user_id,
# #                     'answer': answer
# #                 }
# #             )

# #     async def broadcast_question(self, event):
# #         await self.send(text_data=json.dumps({
# #             'type': 'question',
# #             'question': event['question'],
# #             'options': event['options']
# #         }))

# #     async def student_answer(self, event):
# #         if self.user_role == 'instructor':
# #             await self.send(text_data=json.dumps({
# #                 'type': 'student_answer',
# #                 'user_id': event['user_id'],
# #                 'answer': event['answer']
# #             }))

# #     @sync_to_async
# #     def get_user_info(self, bearer_token):
# #         domain = os.environ.get('AUTH0_DOMAIN')
# #         headers = {"Authorization": f'Bearer {bearer_token}'}
# #         try:
# #             response = requests.get(f'https://{domain}/userinfo', headers=headers)
# #             response.raise_for_status()  # Raises an HTTPError for bad responses
# #             return response.json()
# #         except requests.exceptions.RequestException:
# #             return None
        


# # class KahootLikeConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.token = self.scope['url_route']['kwargs']['token']
#         self.user = self.scope.get('user', "asdf")
        
#         print(f"Connecting: Room: {self.room_name}, User: {self.user}")
        
#         # Your existing connection logic here
        
#         await self.accept()
#         # print("whats up consumer!")
#         # self.room_name = self.scope['url_route']['kwargs']['room_name']
#         # self.room_group_name = f'kahoot_{self.room_name}'
#         # self.instructor_group_name = f'kahoot_instructors_{self.room_name}'
#         # await self.accept()
#         # # Extract token from query string
#         # # query_string = parse_qs(self.scope['query_string'].decode())
#         # # token = query_string.get('token', [None])[0]

#         # # if not token:
#         # #     # Reject the connection if no token is provided
#         # #     await self.close()
#         # #     return
#         # print(" USER!!!!!!! ", self.scope['user'])
#         # Authenticate user
#         # user_info = await self.get_user_info(token)
#         # if not user_info:
#         #     # Reject the connection if authentication fails
#         #     await self.close()
#         #     return
#         # print("we got here")
#         # self.user_id = user_info.get('sub')
#         # self.user = await self.get_user(self.user_id)
#         # if not self.user:
#         #     await self.close()
#         #     return
        
#         # user_role = 'instructor' if await self.is_instructor(self.user) else 'student'
#         # print("user role: ", user_role)
#         # # Join room group
#         # await self.channel_layer.group_add(
#         #     self.room_group_name,
#         #     self.channel_name
#         # )

#         # # If instructor, also join the instructor group
#         # if user_role == 'instructor':
#         #     await self.channel_layer.group_add(
#         #         self.instructor_group_name,
#         #         self.channel_name
#         #     )

#         await self.accept()

#         # Send role information to the client
#         # await self.send(text_data=json.dumps({
#         #     'type': 'authentication_result',
#         #     'role': user_role
#         # }))

#         # If student, send initial question
#         # if self.user_role == 'student':
#         #     initial_question = await self.get_next_question()
#         #     if initial_question:
#         #         await self.send(text_data=json.dumps({
#         #             'type': 'question',
#         #             'question': initial_question['question'],
#         #             'options': initial_question['options']
#         #         }))

#     async def disconnect(self, close_code):
#         # Leave room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )
#         # If instructor, also leave the instructor group
#         # if user_role == 'instructor':
#         #     await self.channel_layer.group_discard(
#         #         self.instructor_group_name,
#         #         self.channel_name
#         #     )

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message_type = data.get('type')

#         print(message_type)
        
#         # if message_type == 'question' and self.user_role == 'instructor':
#         #     question = data.get('question')
#         #     options = data.get('options')
#         #     await self.channel_layer.group_send(
#         #         self.room_group_name,
#         #         {
#         #             'type': 'broadcast_question',
#         #             'question': question,
#         #             'options': options
#         #         }
#         #     )
#         # elif message_type == 'answer' and self.user_role == 'student':
#         #     answer = data.get('answer')
#         #     await self.channel_layer.group_send(
#         #         self.instructor_group_name,
#         #         {
#         #             'type': 'student_answer',
#         #             'user_id': self.user_id,
#         #             'answer': answer
#         #         }
#         #     )
#         #     # Get next question for the student
#         #     next_question = await self.get_next_question(answer)
#         #     if next_question:
#         #         await self.send(text_data=json.dumps({
#         #             'type': 'question',
#         #             'question': next_question['question'],
#         #             'options': next_question['options']
#         #         }))

#     async def broadcast_question(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'question',
#             'question': event['question'],
#             'options': event['options']
#         }))

#     async def student_answer(self, event):
#         if self.user_role == 'instructor':
#             await self.send(text_data=json.dumps({
#                 'type': 'student_answer',
#                 'user_id': event['user_id'],
#                 'answer': event['answer']
#             }))

#     @database_sync_to_async
#     def get_user_info(self, bearer_token):
#         domain = os.environ.get('AUTH0_DOMAIN')
#         headers = {"Authorization": f'Bearer {bearer_token}'}
#         try:
#             response = requests.get(f'https://{domain}/userinfo', headers=headers)
#             response.raise_for_status()  # Raises an HTTPError for bad responses
#             return response.json()
#         except requests.exceptions.RequestException:
#             return None

#     @database_sync_to_async
#     def get_user(self, user_id):
#         try:
#             user = CustomUser.objects.get(username=user_id)
#             return user
#         except:
#             return None
       

#     @database_sync_to_async
#     def is_instructor(self, user):
#         # Implement your logic to determine if a user is an instructor
#         return user.groups.filter(name='Instructor').exists() # will need to change this to be for this specific location

#     @database_sync_to_async
#     def get_next_question(self, previous_answer=None):
#         return "as;ldkfj"
#         # user_progress, created = UserProgress.objects.get_or_create(user=self.user)
        
#         # if created or not user_progress.last_question:
#         #     # Get the first question for the user
#         #     question = Question.objects.order_by('difficulty').first()
#         # else:
#         #     # Get the next question based on the previous answer
#         #     prev_question = user_progress.last_question
#         #     try:
#         #         relationship = QuestionRelationship.objects.get(
#         #             previous_question=prev_question,
#         #             answer_condition=previous_answer
#         #         )
#         #         question = relationship.next_question
#         #     except QuestionRelationship.DoesNotExist:
#         #         # If no specific next question, get the next one by difficulty
#         #         question = Question.objects.filter(
#         #             difficulty__gt=prev_question.difficulty
#         #         ).order_by('difficulty').first()

#         # if question:
#         #     user_progress.last_question = question
#         #     user_progress.save()
#         #     return {
#         #         'question': question.question_text,
#         #         'options': question.options  # Assuming this is a JSON field or similar
#         #     }
#         # return None

# import logging
# logger = logging.getLogger(__name__)

# class KahootLikeConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         try:
#             self.room_name = self.scope['url_route']['kwargs']['room_name']
#             self.token = self.scope['url_route']['kwargs']['token']
#             self.user = self.scope.get('user', 'AnonymousUser()')
            
#             logger.info(f"Connecting: Room: {self.room_name}, User: {self.user}")
            
#             await self.channel_layer.group_add(
#                 self.room_name,
#                 self.channel_name
#             )
            
#             await self.accept()
#             logger.info("WebSocket connection accepted")
#         except Exception as e:
#             print(e)

#     async def disconnect(self, close_code):
#         logger.info(f"WebSocket disconnected with code: {close_code}")
#         await self.channel_layer.group_discard(
#             self.room_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         logger.info(f"Received message: {text_data}")
#         # Your message handling logic here



# class KahootLikeConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name = f'kahoot_{self.room_name}'
#         self.instructor_room_group_name = f'kahoot_instructor{self.room_name}'
#         print(self.scope['user'].id)
#         token = self.scope['user'].id
#         user_info = await self.get_user_info(token)

#         await self.accept()


#     async def disconnect(self, close_code):
#         # Leave room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message = data['message']
#         username = data['username']

#         # Save the message to Redis
#         await self.save_message(username, message)

#         # Send message to room group
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'chat_message',
#                 'message': message,
#                 'username': username
#             }
#         )

#     async def chat_message(self, event):
#         message = event['message']
#         username = event['username']

#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'type': 'chat',
#             'message': message,
#             'username': username
#         }))

#     @sync_to_async
#     def get_messages(self):
#         # Get the last 50 messages from Redis
#         messages = redis_client.lrange(f'chat_messages:{self.room_name}', -50, -1)
#         return [json.loads(msg) for msg in messages]

#     @sync_to_async
#     def save_message(self, username, message):
#         # Save message to Redis
#         redis_client.rpush(f'chat_messages:{self.room_name}', json.dumps({
#             'username': username,
#             'message': message
#         }))
#         # Trim the list to keep only the last 100 messages
#         redis_client.ltrim(f'chat_messages:{self.room_name}', -100, -1)

#     @database_sync_to_async
#     def get_user_info(self, bearer_token):
#         domain = os.environ.get('AUTH0_DOMAIN')
#         headers = {"Authorization": f'Bearer {bearer_token}'}
#         try:
#             response = requests.get(f'https://{domain}/userinfo', headers=headers)
#             response.raise_for_status()  # Raises an HTTPError for bad responses
#             return response.json()
#         except requests.exceptions.RequestException:
#             return None

#     @database_sync_to_async
#     def get_user(self, user_id):
#         try:
#             user = CustomUser.objects.get(username=user_id)
#             return user
#         except:
#             return None
       

#     @database_sync_to_async
#     def is_instructor(self, user):
#         # Implement your logic to determine if a user is an instructor
#         return user.groups.filter(name='Instructor').exists() # will need to change this to be for this specific location
class KahootLikeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'kahoot_{self.room_name}'
        self.instructor_room_group_name = f'kahoot_instructor_{self.room_name}'
        
        self.user = self.scope['user']
        self.is_instructor = await self.get_is_instructor(self.user)

        await self.accept()

        if self.is_instructor:
            print("instructor")
            await self.channel_layer.group_add(
                self.instructor_room_group_name,
                self.channel_name
            )
        else:
            print("student")
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            # Initialize or get the student's progress
            # self.progress = await self.get_or_create_progress()
            # Send the current question to the student
            # print("starting module")
            # await self.start_module()
            # await self.send_current_question()

    async def disconnect(self, close_code):
        if self.is_instructor:
            await self.channel_layer.group_discard(
                self.instructor_room_group_name,
                self.channel_name
            )
        else:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        # print(data)
        if message_type == 'start_module':
            print("starting module")
            await self.start_module()
            await self.update_instructor(1)
        elif message_type == 'next_question':
            print(data)
            await self.advance_question(data.get('number'))
            await self.update_instructor(data.get('number') + 1)
        elif message_type == "student_progress":
            print("student progress update")
            # print(data)
            # if not self.is_instructor:
                # await self.get_next_question()
            # else:
                # print("instructor")
             
    async def start_module(self):
        question = await self.get_next_question(1, 1)
        await self.send(
            text_data=json.dumps({
                "type": "question",
                "question": question,
            })
        )

    async def advance_question(self, prev_question_number):
        # save the question, presumably
        prev_question_number += 1
        question = await self.get_next_question(1, prev_question_number)
        await self.send(
            text_data=json.dumps({
                "type": "question",
                "question": question,
            })
        )


    async def send_current_question(self):
        # print("current question")
        # question = await self.get_question(self.progress.current_question_id)
        # question = {"text": "asdf", "options": "asd;lfjas;dlfjasdf"}

        question = await self.get_question(0)
        if question:
            await self.send(text_data=json.dumps({
                'type': 'question',
                'question': question['text'],
                'options': question['options']
            }))
        else:
            await self.send(text_data=json.dumps({
                'type': 'quiz_completed'
            }))
            
    @database_sync_to_async
    def get_next_question(self, module_number=0, question_number=0):
        module = HardCodedModule.objects.all().first() # as it stands, this module number is also, conviently, the id, this will need to change
        question_counter = module.questions.get(order=question_number)
        question = question_counter.question

        # Convert the Question object to a dictionary
        question_dict = model_to_dict(question)

        # You can add or remove fields as needed
        serialized_question = {
            # 'id': question.id,
            'number': question_number,
            'text': question.text,  
            'json': question.json# Assuming your Question model has a 'text' field
            # Add any other fields you need
        }

        print(f"Serialized question: {json.dumps(serialized_question)}")
        return serialized_question

    async def update_instructor(self, question_number):
        await self.channel_layer.group_send(
            self.instructor_room_group_name,
            {
                'type': 'student_progress',
                'student_id': self.user.id,
                'question_number': question_number
                # 'question_id': self.progress.current_question_id,
                # 'question_number': self.progress.question_number
            }
        )

    async def student_progress(self, event):
        await self.send(text_data=json.dumps({
            'type': 'student_progress',
            'student_id': event['student_id'],
            'question_number': event['question_number']
        }))
    # async def student_progress(self, event):
    #     await self.send(text_data=json.dumps({
    #         'type': 'student_progress',
    #         'student_id': event['student_id'],
    #         'question_id': event['question_id'],
    #         'question_number': event['question_number']
    #     }))

    @database_sync_to_async
    def get_is_instructor(self, user):
        cu = CustomUser.objects.get(user_id=self.scope['user'].id)
        if cu.user_type == "in":
            return True
        return False

    # @database_sync_to_async
    # def get_or_create_progress(self):
    #     progress, created = StudentProgress.objects.get_or_create(
    #         student=self.user,
    #         room_name=self.room_name
    #     )
    #     if created:
    #         # Assign a QuestionSet to the student if it's their first time
    #         question_set = QuestionSet.objects.filter(room_name=self.room_name).order_by('?').first()
    #         progress.question_set = question_set
    #         progress.save()
    #     return progress

    # @database_sync_to_async
    # def save_progress(self):
    #     self.progress.question_number = F('question_number') + 1
    #     self.progress.save()

    @database_sync_to_async
    def get_question(self, question_id):
        return {"asdf"}
        # return Question.objects.filter(id=question_id, question_set=self.progress.question_set).first()

    @database_sync_to_async
    def get_next_question_from_db(self):
        return "question"
        # return Question.objects.filter(
        #     question_set=self.progress.question_set,
        #     id__gt=self.progress.current_question_id
        # ).order_by('id').first()
