# from django.urls import re_path
# from . import consumers

# print("Inperson routing module loaded")

# # websocket_urlpatterns = [
# #     re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
# # ]

# websocket_urlpatterns = [
#     re_path(r'^inperson/ws/chat/$', consumers.ChatConsumer.as_asgi()),
# ]


from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/kahoot/(?P<room_name>\w+)/$', consumers.KahootLikeConsumer.as_asgi()),
]