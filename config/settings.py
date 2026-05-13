import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ====================== SECURITY ======================
SECRET_KEY = 'django-insecure-@vori&&30d+966v!t!tz4stih=g=u6d%@a!-la=+dp^#ag=-=c'  # Change this in production!

DEBUG = True   # Change to False when deploying

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# ====================== APPLICATIONS ======================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',
    'whitenoise.runserver_nostatic',

    'users',
    'courses',
    'enrollment',
    'videos',
    'dashboard',
]

# ====================== MIDDLEWARE ======================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'users.middleware.SingleSessionMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

# ====================== TEMPLATES ======================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

# ====================== DATABASE ======================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',   # Using SQLite for simplicity
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ====================== AUTH & CUSTOM USER ======================
AUTH_USER_MODEL = 'users.CustomUser'
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'dashboard:student_dashboard'
LOGOUT_REDIRECT_URL = 'login'

# ====================== SESSION SETTINGS ======================
SESSION_COOKIE_AGE = 60 * 60 * 2          # 2 hours
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True

CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = False

# ====================== SECURITY ======================
SECURE_SSL_REDIRECT = not DEBUG
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'SAMEORIGIN'           # Required for YouTube
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0

# ====================== STATIC & MEDIA ======================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ====================== OTHER SETTINGS ======================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ====================== CORS ======================
CORS_ALLOW_ALL_ORIGINS = DEBUG

# ====================== REST FRAMEWORK ======================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# ====================== EMAIL ======================
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ====================== LOGGING ======================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}