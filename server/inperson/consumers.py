import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import redis
import os
from channels.db import database_sync_to_async
import requests
from urllib.parse import parse_qs

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
#                 self.instructor_group_name,
#                 self.channel_name
#             )

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message_type = data.get('type')
        
#         if message_type == 'question' and self.user_role == 'instructor':
#             question = data.get('question')
#             options = data.get('options')
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'broadcast_question',
#                     'question': question,
#                     'options': options
#                 }
#             )
#         elif message_type == 'answer' and self.user_role == 'student':
#             answer = data.get('answer')
#             await self.channel_layer.group_send(
#                 self.instructor_group_name,
#                 {
#                     'type': 'student_answer',
#                     'user_id': self.user_id,
#                     'answer': answer
#                 }
#             )

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

#     @sync_to_async
#     def get_user_info(self, bearer_token):
#         domain = os.environ.get('AUTH0_DOMAIN')
#         headers = {"Authorization": f'Bearer {bearer_token}'}
#         try:
#             response = requests.get(f'https://{domain}/userinfo', headers=headers)
#             response.raise_for_status()  # Raises an HTTPError for bad responses
#             return response.json()
#         except requests.exceptions.RequestException:
#             return None
        


class KahootLikeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("whats up")
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'kahoot_{self.room_name}'
        self.instructor_group_name = f'kahoot_instructors_{self.room_name}'
        
        # Extract token from query string
        query_string = parse_qs(self.scope['query_string'].decode())
        token = query_string.get('token', [None])[0]

        if not token:
            # Reject the connection if no token is provided
            await self.close()
            return

        # Authenticate user
        user_info = await self.get_user_info(token)
        if not user_info:
            # Reject the connection if authentication fails
            await self.close()
            return

        self.user_id = user_info.get('sub')
        self.user = await self.get_or_create_user(self.user_id)
        self.user_role = 'instructor' if await self.is_instructor(self.user) else 'student'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # If instructor, also join the instructor group
        if self.user_role == 'instructor':
            await self.channel_layer.group_add(
                self.instructor_group_name,
                self.channel_name
            )

        await self.accept()

        # Send role information to the client
        await self.send(text_data=json.dumps({
            'type': 'authentication_result',
            'role': self.user_role
        }))

        # If student, send initial question
        if self.user_role == 'student':
            initial_question = await self.get_next_question()
            if initial_question:
                await self.send(text_data=json.dumps({
                    'type': 'question',
                    'question': initial_question['question'],
                    'options': initial_question['options']
                }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        # If instructor, also leave the instructor group
        if self.user_role == 'instructor':
            await self.channel_layer.group_discard(
                self.instructor_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        print(message_type)
        
        # if message_type == 'question' and self.user_role == 'instructor':
        #     question = data.get('question')
        #     options = data.get('options')
        #     await self.channel_layer.group_send(
        #         self.room_group_name,
        #         {
        #             'type': 'broadcast_question',
        #             'question': question,
        #             'options': options
        #         }
        #     )
        # elif message_type == 'answer' and self.user_role == 'student':
        #     answer = data.get('answer')
        #     await self.channel_layer.group_send(
        #         self.instructor_group_name,
        #         {
        #             'type': 'student_answer',
        #             'user_id': self.user_id,
        #             'answer': answer
        #         }
        #     )
        #     # Get next question for the student
        #     next_question = await self.get_next_question(answer)
        #     if next_question:
        #         await self.send(text_data=json.dumps({
        #             'type': 'question',
        #             'question': next_question['question'],
        #             'options': next_question['options']
        #         }))

    async def broadcast_question(self, event):
        await self.send(text_data=json.dumps({
            'type': 'question',
            'question': event['question'],
            'options': event['options']
        }))

    async def student_answer(self, event):
        if self.user_role == 'instructor':
            await self.send(text_data=json.dumps({
                'type': 'student_answer',
                'user_id': event['user_id'],
                'answer': event['answer']
            }))

    @database_sync_to_async
    def get_user_info(self, bearer_token):
        domain = os.environ.get('AUTH0_DOMAIN')
        headers = {"Authorization": f'Bearer {bearer_token}'}
        try:
            response = requests.get(f'https://{domain}/userinfo', headers=headers)
            response.raise_for_status()  # Raises an HTTPError for bad responses
            return response.json()
        except requests.exceptions.RequestException:
            return None

    # @database_sync_to_async
    # def get_or_create_user(self, user_id):
    #     user, created = User.objects.get_or_create(username=user_id)
    #     return user

    # @database_sync_to_async
    # def is_instructor(self, user):
    #     # Implement your logic to determine if a user is an instructor
    #     return user.groups.filter(name='Instructor').exists() or user.is_staff

    # @database_sync_to_async
    # def get_next_question(self, previous_answer=None):
    #     user_progress, created = UserProgress.objects.get_or_create(user=self.user)
        
    #     if created or not user_progress.last_question:
    #         # Get the first question for the user
    #         question = Question.objects.order_by('difficulty').first()
    #     else:
    #         # Get the next question based on the previous answer
    #         prev_question = user_progress.last_question
    #         try:
    #             relationship = QuestionRelationship.objects.get(
    #                 previous_question=prev_question,
    #                 answer_condition=previous_answer
    #             )
    #             question = relationship.next_question
    #         except QuestionRelationship.DoesNotExist:
    #             # If no specific next question, get the next one by difficulty
    #             question = Question.objects.filter(
    #                 difficulty__gt=prev_question.difficulty
    #             ).order_by('difficulty').first()

    #     if question:
    #         user_progress.last_question = question
    #         user_progress.save()
    #         return {
    #             'question': question.question_text,
    #             'options': question.options  # Assuming this is a JSON field or similar
    #         }
    #     return None