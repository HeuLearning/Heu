from django.utils.cache import add_never_cache_headers
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.core.cache import cache
import requests
from django.conf import settings
import jwt
from urllib.parse import parse_qs

print("Auth0TokenMiddleware module loaded")  # Add this line


class Auth0Middleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['Expires'] = 0
        add_never_cache_headers(response)
        response['X-XSS-Protection'] = 0
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response
    
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
import jwt
from django.conf import settings
import logging
import os

logger = logging.getLogger(__name__)

print("Auth0TokenMiddleware module loaded")

# class Auth0TokenMiddleware(BaseMiddleware):
#     def __init__(self, inner):
#         super().__init__(inner)
#         print("Auth0TokenMiddleware initialized")

#     async def __call__(self, scope, receive, send):
#         print("Auth0TokenMiddleware __call__ method entered")
#         token = self.get_token_from_scope(scope)

#         if token:
#             print(f"Token found: {token[:10]}...")
#             user = await self.get_user_from_token(token)
#             if user.is_authenticated:
#                 print("User authenticated successfully")
#             else:
#                 print("User authentication failed")
#             scope['user'] = user
#         else:
#             print("No token found in request")
#             scope['user'] = AnonymousUser()

#         return await super().__call__(scope, receive, send)

#     def get_token_from_scope(self, scope):
#         headers = dict(scope['headers'])
#         auth_header = headers.get(b'authorization', b'').decode()
#         if auth_header.startswith('Bearer '):
#             return auth_header.split(' ')[1]
        
#         query_string = scope['query_string'].decode()
#         query_params = dict(qp.split('=') for qp in query_string.split('&') if '=' in qp)
#         return query_params.get('token')

#     @database_sync_to_async
#     def get_user_from_token(self, token):
#         try:
#             print(f"Attempting to decode token with audience: {settings.AUTH0_AUDIENCE}")
#             payload = jwt.decode(
#                 token, 
#                 settings.AUTH0_AUDIENCE,
#                 algorithms=['RS256'],
#                 audience=settings.AUTH0_AUDIENCE,
#                 issuer=f'https://{settings.AUTH0_DOMAIN}/'
#             )
#             print("Token decoded successfully")
#             return type('User', (), {'id': payload['sub'], 'is_authenticated': True})()
#         except jwt.ExpiredSignatureError:
#             print("Token has expired")
#         except jwt.InvalidAudienceError:
#             print(f"Invalid audience. Expected {settings.AUTH0_AUDIENCE}")
#         except jwt.InvalidIssuerError:
#             print(f"Invalid issuer. Expected https://{settings.AUTH0_DOMAIN}/")
#         except jwt.PyJWTError as e:
#             print(f"JWT validation error: {str(e)}")
#         return AnonymousUser()
class Auth0TokenMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Parse the query string
        query_string = scope['query_string'].decode()
        query_params = parse_qs(query_string)
        
        # Extract the token from the query parameters
        token = query_params.get('token', [None])[0]
        print(token)
        if token:
            try:
                # Verify and decode the token
                user = await self.get_user_info(token)
                scope['user'] = user
                print(f"Authenticated user: {user}")
            except Exception as e:
                print(f"Authentication error: {str(e)}")
                scope['user'] = AnonymousUser()
        else:
            print("Token not found in query string")
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_info(self, bearer_token):
        domain = settings.AUTH0_DOMAIN
        headers = {"Authorization": f'Bearer {bearer_token}'}
        response = requests.get(f'https://{domain}/userinfo', headers=headers)
        print("response ", response.json())
        return type('User', (), {'is_authenticated': True, 'id': response.json()['sub']})()

        # response = requests.get(f'https://{domain}/userinfo', headers=headers)
        # response.raise_for_status()  # Raises an HTTPError for bad responses
        # return response.json()

    @database_sync_to_async
    def get_user_from_token(self, token):
        print(token)
        try:
            payload = jwt.decode(token, settings.AUTH0_CLIENT_SECRET, algorithms=['HS256'], audience=settings.AUTH0_AUDIENCE)
            # Here, implement logic to get or create a user based on the Auth0 user info
            # For now, we'll just return a simple user object
            return type('User', (), {'is_authenticated': True, 'id': payload['sub']})()
        except jwt.PyJWTError:
            return AnonymousUser()