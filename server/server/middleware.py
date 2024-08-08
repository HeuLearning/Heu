# # # # from django.utils.cache import add_never_cache_headers


# # # # class Auth0Middleware:
# # # #     def __init__(self, get_response):
# # # #         self.get_response = get_response

# # # #     def __call__(self, request):
# # # #         response = self.get_response(request)
# # # #         response['Expires'] = 0
# # # #         add_never_cache_headers(response)
# # # #         response['X-XSS-Protection'] = 0
# # # #         response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
# # # #         return response

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


from django.http import JsonResponse
from jose import jwt


AUTH0_DOMAIN = {YOUR_AUTH0_DOMAIN}
API_AUDIENCE = {YOUR_API_AUDIENCE}
ALGORITHMS = "RS256"

"""
Cache the key available at https://{AUTH0_DOMAIN}/.well-known/jwks.json as a python dict
"""
AUTH0_PUBLIC_KEY = {}


class Auth0Middleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        # GET TOKEN
        # auth = request.META.get('HTTP_AUTHORIZATION')

        # if not auth:
        #     return JsonResponse(data={"code": "authorization_header_missing",
        #                               "description":
        #                                   "Authorization header is expected"}, status=401)

        # parts = auth.split()

        # if parts[0].lower() != "bearer":
        #     return JsonResponse(data={"code": "invalid_header",
        #                               "description":
        #                                   "Authorization header must start with"
        #                                   "Bearer"}, status=401)
        # elif len(parts) == 1:
        #     return JsonResponse(data={"code": "invalid_header",
        #                               "description": "Token not found"}, status=401)
        # elif len(parts) > 2:
        #     return JsonResponse(data={"code": "invalid_header",
        #                               "description": "Authorization header must be"
        #                                              "Bearer token"}, status=401)

        # token = parts[1]

        # # VALIDATE TOKEN

        # jwks = AUTH0_PUBLIC_KEY
        # try:
        #     unverified_header = jwt.get_unverified_header(token)
        # except jwt.JWTError:

        #     return JsonResponse(data={"code": "invalid_header",
        #                               "description": "Invalid header. "
        #                                              "Use an RS256 signed JWT Access Token"}, status=401)

        # if unverified_header"alg"] == "HS256":
        #     return JsonResponse(data={"code": "invalid_header",
        #                               "description": "Invalid header. "
        #                                              "Use an RS256 signed JWT Access Token"}, status=401)

        # rsa_key = {}
        # for key in jwks"keys"]:
        #     if key"kid"] == unverified_header"kid"]:
        #         rsa_key = {
        #             "kty": key"kty"],
        #             "kid": key"kid"],
        #             "use": key"use"],
        #             "n": key"n"],
        #             "e": key"e"]
        #         }
        # if rsa_key:
        #     try:
        #         jwt.decode(
        #             token,
        #             rsa_key,
        #             algorithms=ALGORITHMS,
        #             audience=API_AUDIENCE,
        #             issuer="https://" + AUTH0_DOMAIN + "/"
        #         )

        #     except jwt.ExpiredSignatureError:
        #         return JsonResponse(data={"code": "token_expired",
        #                                   "description": "token is expired"}, status=401)
        #     except jwt.JWTClaimsError:
        #         return JsonResponse(data={"code": "invalid_claims",
        #                                   "description": "incorrect claims,"
        #                                                  " please check the audience and issuer"}, status=401)
        #     except Exception:
        #         return JsonResponse(data={"code": "invalid_header",
        #                                   "description": "Unable to parse authentication"
        #                                                  " token."}, status=400)
        # else:
        #     return JsonResponse(data={"code": "invalid_header",
        #                               "description": "Unable to find appropriate key"}, status=401)

        response = self.get_response(request)
        return response