# from django.utils.cache import add_never_cache_headers


# class Auth0Middleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         response = self.get_response(request)
#         response['Expires'] = 0
#         add_never_cache_headers(response)
#         response['X-XSS-Protection'] = 0
#         response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
#         return response

import sys
from typing import Callable
from django.http import HttpRequest, HttpResponse
from django.utils.deprecation import MiddlewareMixin

class Auth0Middleware(MiddlewareMixin):
    get_response: Callable[[HttpRequest], HttpResponse]

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response
        print("Auth0Middleware initialized", file=sys.stderr)

    def __call__(self, request: HttpRequest) -> HttpResponse:
        print(f"Auth0Middleware processing request: {request.method} {request.path}", file=sys.stderr)
        
        # Log authentication-related headers
        if request.path.startswith('/api/'):  # Adjust this path as needed
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            print(f"Authorization header: {auth_header[:20]}...", file=sys.stderr)
        
        response = self.get_response(request)
        
        print("Auth0Middleware processing response", file=sys.stderr)
        print(f"Response status code: {response.status_code}", file=sys.stderr)
        
        response['Expires'] = '0'
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response['X-XSS-Protection'] = '0'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response