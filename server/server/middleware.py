from django.utils.cache import add_never_cache_headers


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

# # # import sys
# # # from typing import Callable
# # # from django.http import HttpRequest, HttpResponse
# # # from django.utils.deprecation import MiddlewareMixin

# # # class Auth0Middleware(MiddlewareMixin):
# # #     def __call__(self, request: HttpRequest) -> HttpResponse:
# # #         print(f"Auth0Middleware processing request: {request.method} {request.path}", file=sys.stderr)
# # #         if request.path.startswith('/api/'):
# # #             auth_header = request.META.get('HTTP_AUTHORIZATION', '')
# # #             print(f"Authorization header: {auth_header[:20]}...", file=sys.stderr)
            
# # #             # Log the full token for debugging (remove in production)
# # #             print(f"Full token: {auth_header}", file=sys.stderr)
            
# # #             # Attempt to verify the token here
# # #             try:
# # #                 token = auth_header.split(' ')[1]
# # #                 payload = self.verify_token(token)  # Implement this method
# # #                 if payload:
# # #                     print(f"Token verified successfully: {payload}", file=sys.stderr)
# # #                     request.user = payload  # Attach the payload to the request
# # #                 else:
# # #                     print("Token verification failed", file=sys.stderr)
# # #             except Exception as e:
# # #                 print(f"Error verifying token: {str(e)}", file=sys.stderr)
        
# # #         response = self.get_response(request)
# # #         print(f"Auth0Middleware processing response: {response.status_code}", file=sys.stderr)
# # #         return response

# # #     def verify_token(self, token):
# # #         # Implement token verification logic here
# # #         # This should be similar to the verify_token method in LoginUserView
# # #         pass
# # from django.http import HttpRequest, HttpResponse
# # from django.utils.deprecation import MiddlewareMixin
# # from typing import Callable, Optional
# # import sys

# # # Define a type alias for the get_response callable
# # GetResponseCallable = Callable[[HttpRequest], HttpResponse]

# # class Auth0Middleware(MiddlewareMixin):
# #     get_response: GetResponseCallable

# #     def __init__(self, get_response: GetResponseCallable):
# #         super().__init__(get_response)
# #         self.get_response = get_response
# #         print("Auth0Middleware initialized", file=sys.stderr)

# #     def __call__(self, request: HttpRequest) -> HttpResponse:
# #         print(f"Auth0Middleware processing request: {request.method} {request.path}", file=sys.stderr)
# #         if request.path.startswith('/api/'):
# #             auth_header = request.META.get('HTTP_AUTHORIZATION', '')
# #             print(f"Authorization header: {auth_header[:20]}...", file=sys.stderr)
            
# #             # Log the full token for debugging (remove in production)
# #             print(f"Full token: {auth_header}", file=sys.stderr)
            
# #             # Attempt to verify the token here
# #             try:
# #                 token = auth_header.split(' ')[1]
# #                 payload = self.verify_token(token)
# #                 if payload:
# #                     print(f"Token verified successfully: {payload}", file=sys.stderr)
# #                     request.user = payload  # Attach the payload to the request
# #                 else:
# #                     print("Token verification failed", file=sys.stderr)
# #             except Exception as e:
# #                 print(f"Error verifying token: {str(e)}", file=sys.stderr)
        
# #         response = self.get_response(request)
# #         print(f"Auth0Middleware processing response: {response.status_code}", file=sys.stderr)
# #         return response

# #     def verify_token(self, token: str) -> Optional[dict]:
# #         # Implement token verification logic here
# #         # This should be similar to the verify_token method in LoginUserView
# #         # Return None if verification fails, otherwise return the payload
# #         pass

# from django.http import HttpRequest, HttpResponse
# from django.utils.deprecation import MiddlewareMixin
# from django.contrib.auth import get_user_model
# from django.contrib.auth.models import AnonymousUser
# from django.utils.cache import add_never_cache_headers
# from typing import Callable, Optional, Dict, Any
# import jwt
# import requests
# import os
# import sys

# User = get_user_model()
# GetResponseCallable = Callable[[HttpRequest], HttpResponse]

# class Auth0Middleware(MiddlewareMixin):
#     get_response: GetResponseCallable

#     def __init__(self, get_response: GetResponseCallable):
#         self.get_response = get_response
#         print("Auth0Middleware initialized", file=sys.stderr)

#     def __call__(self, request: HttpRequest) -> HttpResponse:
#         print(f"Auth0Middleware processing request: {request.method} {request.path}", file=sys.stderr)
        
#         if request.path.startswith('/api/'):
#             auth_header = request.META.get('HTTP_AUTHORIZATION', '')
#             if auth_header.startswith('Bearer '):
#                 token = auth_header.split(' ')[1]
#                 user = self.get_user_from_token(token)
#                 if user:
#                     request.user = user
#                     print(f"User authenticated: {user.username}", file=sys.stderr)
#                 else:
#                     request.user = AnonymousUser()
#                     print("Token verification failed", file=sys.stderr)
#             else:
#                 request.user = AnonymousUser()
#                 print("No Bearer token found", file=sys.stderr)
        
#         response = self.get_response(request)
        
#         # Add security headers
#         response['Expires'] = '0'
#         add_never_cache_headers(response)
#         response['X-XSS-Protection'] = '0'
#         response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
#         print(f"Auth0Middleware processing response: {response.status_code}", file=sys.stderr)
#         return response

#     def get_user_from_token(self, token: str) -> Optional[User]:
#         try:
#             payload = self.verify_token(token)
#             if payload:
#                 user_id = payload.get('sub')
#                 user, _ = User.objects.get_or_create(username=user_id)
#                 return user
#         except Exception as e:
#             print(f"Error verifying token: {str(e)}", file=sys.stderr)
#         return None

#     def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
#         try:
#             domain = os.environ.get('AUTH0_DOMAIN')
#             audience = os.environ.get('AUTH0_AUDIENCE')
#             if not domain or not audience:
#                 raise ValueError("AUTH0_DOMAIN or AUTH0_AUDIENCE not configured")
            
#             jwks_url = f'https://{domain}/.well-known/jwks.json'
#             jwks = requests.get(jwks_url).json()
#             unverified_header = jwt.get_unverified_header(token)
#             rsa_key = {}
#             for key in jwks['keys']:
#                 if key['kid'] == unverified_header['kid']:
#                     rsa_key = {
#                         'kty': key['kty'],
#                         'kid': key['kid'],
#                         'use': key['use'],
#                         'n': key['n'],
#                         'e': key['e']
#                     }
#             if rsa_key:
#                 payload = jwt.decode(
#                     token,
#                     rsa_key,
#                     algorithms=['RS256'],
#                     audience=audience,
#                     issuer=f'https://{domain}/'
#                 )
#                 return payload
#             raise jwt.InvalidTokenError("Unable to find appropriate key")
#         except jwt.PyJWTError as e:
#             print(f"Token verification failed: {str(e)}", file=sys.stderr)
#             return None

    # def __call__(self, request):
    #     print(f"Auth0Middleware processing request: {request.method} {request.path}", file=sys.stderr)
    #     response = self.get_response(request)
    #     print("Auth0Middleware processing response", file=sys.stderr)
    #     response['Expires'] = 0
    #     add_never_cache_headers(response)
    #     response['X-XSS-Protection'] = '0'
    #     response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    #     return response
    
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
# #         return AnonymousUser()
# class Auth0TokenMiddleware(BaseMiddleware):
#     async def __call__(self, scope, receive, send):
#         # Parse the query string
#         query_string = scope['query_string'].decode()
#         query_params = parse_qs(query_string)
        
#         # Extract the token from the query parameters
#         token = query_params.get('token', [None])[0]
#         # print(token)
#         if token:
#             try:
#                 # Verify and decode the token
#                 user = await self.get_user_info(token)
#                 scope['user'] = user
#                 print(f"Authenticated user: {user}")
#             except Exception as e:
#                 print(f"Authentication error: {str(e)}")
#                 scope['user'] = AnonymousUser()
#         else:
#             print("Token not found in query string")
#             scope['user'] = AnonymousUser()

#         return await super().__call__(scope, receive, send)

#     @database_sync_to_async
#     def get_user_info(self, bearer_token):
#         domain = settings.AUTH0_DOMAIN
#         headers = {"Authorization": f'Bearer {bearer_token}'}
#         response = requests.get(f'https://{domain}/userinfo', headers=headers)
#         print("response ", response.json())
#         return type('User', (), {'is_authenticated': True, 'id': response.json()['sub']})()

#         # response = requests.get(f'https://{domain}/userinfo', headers=headers)
#         # response.raise_for_status()  # Raises an HTTPError for bad responses
#         # return response.json()

#     @database_sync_to_async
#     def get_user_from_token(self, token):
#         print(token)
#         try:
#             payload = jwt.decode(token, settings.AUTH0_CLIENT_SECRET, algorithms=['HS256'], audience=settings.AUTH0_AUDIENCE)
#             # Here, implement logic to get or create a user based on the Auth0 user info
#             # For now, we'll just return a simple user object
#             return type('User', (), {'is_authenticated': True, 'id': payload['sub']})()
#         except jwt.PyJWTError:
#             return AnonymousUser()

