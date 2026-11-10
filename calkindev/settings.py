"""
Django settings for the calkindev project.

Same idea as the settings in the class Task Manager project: the live server
sets an environment variable that a laptop never has, so checking for it tells
us whether we are running locally or deployed. On Elastic Beanstalk that was
PYTHONPATH, on Google App Engine it is GAE_APPLICATION.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: don't run with debug turned on in production!
if os.getenv('GAE_APPLICATION'):
    DEBUG = False

    # Set in app.yaml, which is in .gitignore so the real key never ends up on GitHub
    SECRET_KEY = os.environ['SECRET_KEY']

    # App Engine gives the site an address ending in .appspot.com
    ALLOWED_HOSTS = ['.appspot.com']
    CSRF_TRUSTED_ORIGINS = ['https://*.appspot.com']

    # The site is always served over https on App Engine (see secure: always
    # in app.yaml), so the login and form cookies only need to travel over https,
    # and browsers can be told to only ever use https for it (HSTS)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

    # check --deploy also warns about two settings that don't apply here:
    #   W008 SECURE_SSL_REDIRECT, App Engine already sends http to https (secure: always)
    #   W021 SECURE_HSTS_PRELOAD, an .appspot.com address can't go on the browser preload list
    SILENCED_SYSTEM_CHECKS = ['security.W008', 'security.W021']

    # With DEBUG off Django doesn't print errors anywhere by default. This sends
    # warnings and errors to the console, which on App Engine ends up in Cloud
    # Logging, and errors with a traceback also show in Error Reporting.
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {'class': 'logging.StreamHandler'},
        },
        'root': {
            'handlers': ['console'],
            'level': 'WARNING',
        },
    }
else:
    DEBUG = True

    SECRET_KEY = 'django-insecure-dev-key-only-used-on-my-laptop'

    ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # my apps
    'portfolio',
    'blog',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'calkindev.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # Project level templates folder for base.html and 404.html. Each app
        # also has its own templates folder, found because APP_DIRS is True.
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'calkindev.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

if os.getenv('GAE_APPLICATION'):
    # Cloud SQL for PostgreSQL. App Engine connects to it through a socket file
    # in /cloudsql/, so HOST is a folder path instead of an address.
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ['DB_NAME'],
            'USER': os.environ['DB_USER'],
            'PASSWORD': os.environ['DB_PASSWORD'],
            'HOST': '/cloudsql/' + os.environ['CLOUD_SQL_CONNECTION_NAME'],
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'calkindev_db',
            'USER': 'postgres',
            'PASSWORD': '',  # Put in the password to your local pgadmin (blank for Homebrew Postgres on Mac)
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-nz'

TIME_ZONE = 'Pacific/Auckland'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
# collectstatic copies everything into this folder before deploying, and App
# Engine then serves it at /static/ itself (see the handlers in app.yaml)
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
