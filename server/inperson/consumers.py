# # # # import json
# # # # from channels.generic.websocket import AsyncWebsocketConsumer

# # # # print("ChatConsumer module loaded")

# # # # class ChatConsumer(AsyncWebsocketConsumer):
# # # #     async def connect(self):
# # # #         print("wer're here")
# # # #         print("ChatConsumer connect method entered")
# # # #         print(self.scope['user'])
# # # #         print(f"User authentication status: {self.scope['user'].is_authenticated}")
# # # #         if self.scope["user"].is_authenticated:
# # # #             print("User is authenticated, accepting connection")
# # # #             await self.accept()
# # # #         else:
# # # #             print("User is not authenticated, closing connection")
# # # #             await self.accept()
# # # #             # await self.close()

# # # #     async def disconnect(self, close_code):
# # # #         print(f"WebSocket disconnected with code: {close_code}")

# # # #     async def receive(self, text_data):
# # # #         print(f"Received message: {text_data}")
# # # #         text_data_json = json.loads(text_data)
# # # #         message = text_data_json['message']

# # # #         await self.send(text_data=json.dumps({
# # # #             'message': f"Echo: {message}"
# # # #         }))

# # # from channels.generic.websocket import AsyncWebsocketConsumer
# # # import json

# # # class ChatConsumer(AsyncWebsocketConsumer):
# # #     async def connect(self):
# # #         await self.accept()

# # #     async def disconnect(self, close_code):
# # #         pass

# # #     async def receive(self, text_data):
# # #         text_data_json = json.loads(text_data)
# # #         message = text_data_json['message']

# # #         await self.send(text_data=json.dumps({
# # #             'message': message
# # #         }))


# # import json
# # from channels.generic.websocket import AsyncWebsocketConsumer
# # from channels.db import database_sync_to_async

# # class ChatConsumer(AsyncWebsocketConsumer):
# #     async def connect(self):
# #         self.room_name = "general"  # You can make this dynamic if you want multiple rooms
# #         self.room_group_name = f"chat_{self.room_name}"

# #         # Join room group
# #         await self.channel_layer.group_add(
# #             self.room_group_name,
# #             self.channel_name
# #         )

# #         await self.accept()

# #     async def disconnect(self, close_code):
# #         # Leave room group
# #         await self.channel_layer.group_discard(
# #             self.room_group_name,
# #             self.channel_name
# #         )

# #     async def receive(self, text_data):
# #         data = json.loads(text_data)
# #         message_type = data.get('type')
# #         username = data.get('username')
# #         message = data.get('message')

# #         if message_type == 'chat_message':
# #             # Send message to room group
# #             await self.channel_layer.group_send(
# #                 self.room_group_name,
# #                 {
# #                     'type': 'chat_message',
# #                     'message': message,
# #                     'username': username
# #                 }
# #             )

# #     async def chat_message(self, event):
# #         message = event['message']
# #         username = event['username']

# #         # Send message to WebSocket
# #         await self.send(text_data=json.dumps({
# #             'type': 'chat_message',
# #             'message': message,
# #             'username': username
# #         }))

# import json
# from channels.generic.websocket import AsyncWebsocketConsumer

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
#             'message': message,
#             'username': username
#         }))
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import redis
import os

# Create a Redis connection using the configuration from settings
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD', '')
redis_client = redis.Redis.from_url(f"rediss://:{REDIS_PASSWORD}@db-redis-nyc3-84439-do-user-17041273-0.a.db.ondigitalocean.com:25061")

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send previous messages
        messages = await self.get_messages()
        await self.send(text_data=json.dumps({
            'type': 'history',
            'messages': messages
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        username = data['username']

        # Save the message to Redis
        await self.save_message(username, message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': username
            }
        )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message,
            'username': username
        }))

    @sync_to_async
    def get_messages(self):
        # Get the last 50 messages from Redis
        messages = redis_client.lrange(f'chat_messages:{self.room_name}', -50, -1)
        return [json.loads(msg) for msg in messages]

    @sync_to_async
    def save_message(self, username, message):
        # Save message to Redis
        redis_client.rpush(f'chat_messages:{self.room_name}', json.dumps({
            'username': username,
            'message': message
        }))
        # Trim the list to keep only the last 100 messages
        redis_client.ltrim(f'chat_messages:{self.room_name}', -100, -1)