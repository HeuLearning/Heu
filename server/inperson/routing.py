from django.urls import re_path
from . import consumers

print("Inperson routing module loaded")

# websocket_urlpatterns = [
#     re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
# ]

websocket_urlpatterns = [
    re_path(r'^inperson/ws/chat/$', consumers.ChatConsumer.as_asgi()),
]