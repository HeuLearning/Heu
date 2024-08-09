from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
import requests
from django.conf import settings

User = get_user_model()
import logging

logger = logging.getLogger(__name__)

class Auth0Backend(ModelBackend):
    def authenticate(self, request, token=None):
        logger.info("Auth0Backend authenticate method started")
        if not token:
            logger.warning("No token provided to Auth0Backend")
            return None

        try:
            logger.info("Verifying token with Auth0")
            domain = settings.AUTH0_DOMAIN
            url = f'https://{domain}/userinfo'
            headers = {"Authorization": f'Bearer {token}'}
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            user_info = response.json()
            logger.info("Token verified successfully")

            logger.info("Updating or creating user")
            user, created = User.objects.update_or_create(
                user_id=user_info['sub'],
                # defaults={
                #     'username': user_info.get('nickname', ''),
                #     'email': user_info.get('email', ''),
                #     'first_name': user_info.get('given_name', ''),
                #     'last_name': user_info.get('family_name', ''),
                #     'user_type': user_info.get('user_type', 'st')
                # }
            )  
            print("AUTH0BACKEND USER:", user)
            logger.info(f"User {'created' if created else 'updated'}: {user.user_id}")

            return user
        except requests.RequestException as e:
            logger.error(f"Error verifying token with Auth0: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in Auth0Backend: {str(e)}")
            return None