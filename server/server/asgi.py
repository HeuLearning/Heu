# # # """
# # # ASGI config for server project.

# # # It exposes the ASGI callable as a module-level variable named ``application``.

# # # For more information on this file, see
# # # https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
# # # """

# # # import os

# # # from django.core.asgi import get_asgi_application
# # # from channels.routing import ProtocolTypeRouter, URLRouter
# # # from channels.security.websocket import AllowedHostsOriginValidator
# # # from channels.auth import AuthMiddlewareStack
# # # import os
# # # from django.core.asgi import get_asgi_application
# # # from channels.routing import ProtocolTypeRouter, URLRouter
# # # from channels.security.websocket import AllowedHostsOriginValidator
# # # from django.urls import path, re_path

# # # # Import your WebSocket consumer and custom middleware
# # # from inperson.consumers import ChatConsumer  # Adjust this import to match your project structure
# # # from server.middleware import Auth0TokenMiddleware  # Import your custom middleware



# # # os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# # # from inperson.routing import websocket_urlpatterns
# # # # from class.routing import websocket_urlpatterns
# # # # application = get_asgi_application()
# # # django_asgi_app = get_asgi_application()


# # # # Define WebSocket URL patterns
# # # websocket_urlpatterns = [
# # #     re_path(r'^inperson/ws/chat/$', ChatConsumer.as_asgi()),
# # #     # Add more WebSocket paths here as needed
# # # ]

# # # application = ProtocolTypeRouter({
# # #     "http": django_asgi_app,
# # #     "websocket": AllowedHostsOriginValidator(
# # #         Auth0TokenMiddleware(
# # #             URLRouter(websocket_urlpatterns)
# # #         )
# # #     ),
# # # })


# # # # application = ProtocolTypeRouter({
# # # #     "http": django_asgi_app,
# # # #     "websocket": AllowedHostsOriginValidator(
# # # #             AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
# # # #       ),
# # # #     # Just HTTP for now. (We can add other protocols later.)
# # # # })


# # # # import os
# # # # from django.core.asgi import get_asgi_application
# # # # from channels.routing import ProtocolTypeRouter, URLRouter
# # # # from channels.security.websocket import AllowedHostsOriginValidator
# # # # from django.urls import path

# # # # # Import your WebSocket consumer and custom middleware
# # # # from inperson.consumers import ChatConsumer  # Adjust this import to match your project structure
# # # # from server.middleware import Auth0TokenMiddleware  # Import your custom middleware

# # # # os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')  # Replace with your project's name

# # # # # Initialize Django ASGI application early to ensure the AppRegistry
# # # # # is populated before importing code that may import ORM models.
# # # # django_asgi_app = get_asgi_application()
# # # # # Define WebSocket URL patterns
# # # # websocket_urlpatterns = [
# # # #     path('ws/chat/', ChatConsumer.as_asgi()),
# # # #     # Add more WebSocket paths here as needed
# # # # # ]

# # # # application = ProtocolTypeRouter({
# # # #     "http": django_asgi_app,
# # # #     "websocket": AllowedHostsOriginValidator(
# # # #         Auth0TokenMiddleware(
# # # #             URLRouter(websocket_urlpatterns)
# # # #         )
# # # #     ),
# # # # })


# # import os
# # from django.core.asgi import get_asgi_application
# # from channels.routing import ProtocolTypeRouter, URLRouter
# # from channels.auth import AuthMiddlewareStack
# # from django.urls import path
# # from channels.security.websocket import AllowedHostsOriginValidator
# # from server.middleware import Auth0TokenMiddleware  # Import your custom middleware


# # os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# # django_asgi_app = get_asgi_application()

# # from inperson.routing import websocket_urlpatterns

# # application = ProtocolTypeRouter({
# #     "http": django_asgi_app,
# #     "websocket": AllowedHostsOriginValidator(
# #         Auth0TokenMiddleware(
# #             URLRouter(websocket_urlpatterns)
# #         )
# #     ),
# # })


# import os
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.security.websocket import AllowedHostsOriginValidator
# from django.urls import path

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# django_asgi_app = get_asgi_application()

# from inperson.routing import websocket_urlpatterns
# from server.middleware import Auth0TokenMiddleware  # Import your custom middleware

# django_asgi_app = get_asgi_application()

# application = ProtocolTypeRouter({
#     "http": django_asgi_app,
#     "websocket": Auth0TokenMiddleware(
#         AuthMiddlewareStack(
#             URLRouter(websocket_urlpatterns)
#         )
#     ),
# })


import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

from inperson.routing import websocket_urlpatterns
from server.middleware import Auth0TokenMiddleware  # Make sure this import is correct

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": Auth0TokenMiddleware(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})