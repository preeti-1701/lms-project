
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'submission-secret'
DEBUG = True

ROOT_URLCONF = 'lms.urls'

INSTALLED_APPS = [
'django.contrib.admin','django.contrib.auth','django.contrib.contenttypes',
'django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles',
'rest_framework','corsheaders','users','courses'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',  # ✅ ADD THIS
]

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

DATABASES = {
 'default': {
  'ENGINE': 'django.db.backends.sqlite3',
  'NAME': BASE_DIR / 'db.sqlite3'
 }
}

AUTH_USER_MODEL = 'users.User'
CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
 'DEFAULT_AUTHENTICATION_CLASSES': (
  'rest_framework_simplejwt.authentication.JWTAuthentication',
 )
}

STATIC_URL = '/static/'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]