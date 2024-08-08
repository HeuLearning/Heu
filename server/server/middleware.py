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
from django.utils.cache import add_never_cache_headers

class Auth0Middleware:
    def __init__(self, get_response):
        self.get_response = get_response
        print("Auth0Middleware initialized", file=sys.stderr)

    def __call__(self, request):
        print(f"Auth0Middleware processing request: {request.method} {request.path}", file=sys.stderr)
        response = self.get_response(request)
        print("Auth0Middleware processing response", file=sys.stderr)
        response['Expires'] = 0
        add_never_cache_headers(response)
        response['X-XSS-Protection'] = '0'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response