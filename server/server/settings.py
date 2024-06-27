"""
Django settings for server project.

Generated by 'django-admin startproject' using Django 4.2.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
from dotenv import load_dotenv
import os
# import django_heroku


load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = os.environ.get('SECRET_KEY')
SECRET_KEY = "sdlfkjsdlfkjsdlffoaijxcplvkajerpgoiqher!!!!o2ijr020233823498ta;lbkn34r[98]"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['https://logion-backend-9dd1f22b3713.herokuapp.com', 'ec2-100-27-5-254.compute-1.amazonaws.com', '127.0.0.1', 'localhost']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'heu.apps.HeuConfig',
    'server',
    'corsheaders',
    'rest_framework',
]

MIDDLEWARE = [
    'server.middleware.Auth0Middleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

ROOT_URLCONF = 'server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'server.wsgi.application'


CSP_FRAME_ANCESTORS = "'none'"

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    # 'EXCEPTION_HANDLER': 'messages_api.views.api_exception_handler',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTTokenUserAuthentication',
    ],
}

# JWT

AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
AUTH0_AUDIENCE = os.environ.get('AUTH0_AUDIENCE')

SIMPLE_JWT = {
    'ALGORITHM': 'RS256',
    'JWK_URL': f'https://{AUTH0_DOMAIN}/.well-known/jwks.json',
    'AUDIENCE': AUTH0_AUDIENCE,
    'ISSUER': f'https://{AUTH0_DOMAIN}/',
    'USER_ID_CLAIM': 'sub',
    'AUTH_TOKEN_CLASSES': ('authz.tokens.Auth0Token',),
}

DATA_UPLOAD_MAX_MEMORY_SIZE = 524288000

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

dbname = os.getenv("DATABASE_NAME")
dbuser = os.getenv("DATABASE_USER")
dbpassword = os.getenv("DATABASE_PASSWORD")
dbhost = os.getenv("DATABASE_HOST")
dbport = os.getenv("DATABASE_PORT")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': dbname,
        'USER': dbuser,
        'PASSWORD': dbpassword,
        'HOST': dbhost,
        'PORT': dbport,
        'sslmode': 'require'
    }
}


# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": "logiondb2",
#     }
# }

# if not DEBUG: 
#     name = os.environ.get('DATABASE')
#     user = os.environ.get('USER')
#     password = os.environ.get('PASSWORD')
#     host = os.environ.get('HOST')
#     port = os.environ.get('PORT')

#     DATABASES = {
#         'default': {
#             'ENGINE': 'django.db.backends.postgresql',
#             "NAME": name,
#             "USER": user,
#             "PASSWORD": password,
#             "HOST": host,
#             "PORT": port,

#         }
#     }


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'America/New_York'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = ['https://logion-princeton.vercel.app', 'http://localhost:3000', 'http://127.0.0.1:3000', 'https://localhost:3000', 'https://127.0.0.1:3000']


AUTH_USER_MODEL = 'heu.CustomUser'


# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql_psycopg2',
#         'NAME': '<DATABASE>',
#         'USER': '<USER>',
#         'PASSWORD': '<PASSWORD>',
#         'HOST': '<HOST>',
#         'PORT': '5432',
#     }
# }
  
# Optional section to include if 
# you want to include static files
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# STATIC_URL = '/static/'
# django_heroku.settings(locals())

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}