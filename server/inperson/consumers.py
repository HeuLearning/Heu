# import json
# from channels.generic.websocket import AsyncWebsocketConsumer

# print("ChatConsumer module loaded")

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         print("wer're here")
#         print("ChatConsumer connect method entered")
#         print(self.scope['user'])
#         print(f"User authentication status: {self.scope['user'].is_authenticated}")
#         if self.scope["user"].is_authenticated:
#             print("User is authenticated, accepting connection")
#             await self.accept()
#         else:
#             print("User is not authenticated, closing connection")
#             await self.accept()
#             # await self.close()

#     async def disconnect(self, close_code):
#         print(f"WebSocket disconnected with code: {close_code}")

#     async def receive(self, text_data):
#         print(f"Received message: {text_data}")
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']

#         await self.send(text_data=json.dumps({
#             'message': f"Echo: {message}"
#         }))

from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))