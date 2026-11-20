"""
Django settings for Hospital Appointment Management System.
"""

import os
import sys
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-fallback-key")

DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "testserver", "*"]
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# ---------------------------------------------------------------------------
# Database Configuration & Mode Flags
# ---------------------------------------------------------------------------

def _normalize_mongodb_uri(uri):
    if not uri:
        return uri
    uri = uri.strip()
    if "://" in uri and "@" in uri:
        scheme, rest = uri.split("://", 1)
        last_at_idx = rest.rfind("@")
        auth_part = rest[:last_at_idx]
        host_part = rest[last_at_idx + 1 :]
        if ":" in auth_part:
            username, password = auth_part.split(":", 1)
            import urllib.parse
            if "@" in password or ("%" not in password and not password.isalnum()):
                password = urllib.parse.quote_plus(password)
            return f"{scheme}://{username}:{password}@{host_part}"
    return uri


MONGODB_URI = _normalize_mongodb_uri(os.getenv("MONGODB_URI"))
USE_MONGODB = os.getenv(
    "USE_MONGODB",
    "True" if (MONGODB_URI and "<username>" not in MONGODB_URI) else "False",
).lower() in ("true", "1", "yes")

DATABASE_URL = os.getenv("DATABASE_URL")
USE_SQLITE = os.getenv(
    "USE_SQLITE",
    "False" if (USE_MONGODB or DATABASE_URL) else "True",
).lower() in ("true", "1", "yes")
TESTING = "test" in sys.argv


# ---------------------------------------------------------------------------
# Application definition
# ---------------------------------------------------------------------------

if USE_MONGODB and MONGODB_URI:
    INSTALLED_APPS = [
        "config.apps.MongoAdminConfig",
        "config.apps.MongoAuthConfig",
        "config.apps.MongoContentTypesConfig",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.staticfiles",
        # Third-party
        "rest_framework",
        "rest_framework_simplejwt",
        "corsheaders",
        "drf_spectacular",
        # Local
        "core",
    ]
else:
    INSTALLED_APPS = [
        "django.contrib.admin",
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.staticfiles",
        # Third-party
        "rest_framework",
        "rest_framework_simplejwt",
        "corsheaders",
        "drf_spectacular",
        # Local
        "core",
    ]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------------------------------
# Database Engines
# ---------------------------------------------------------------------------

if TESTING or (USE_SQLITE and not USE_MONGODB):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
elif USE_MONGODB and MONGODB_URI:
    mongodb_name = os.getenv("MONGODB_DB_NAME") or os.getenv("DB_NAME", "hospital_db")
    DATABASES = {
        "default": {
            "ENGINE": "django_mongodb_backend",
            "NAME": mongodb_name,
            "HOST": MONGODB_URI,
            "OPTIONS": {},
        }
    }
elif DATABASE_URL:
    from urllib.parse import urlparse, parse_qs
    url = urlparse(DATABASE_URL)
    query_params = parse_qs(url.query)
    options = {}
    if "sslmode" in query_params:
        options["sslmode"] = query_params["sslmode"][0]
    else:
        options["sslmode"] = "require"

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": url.path.lstrip("/"),
            "USER": url.username,
            "PASSWORD": url.password,
            "HOST": url.hostname,
            "PORT": url.port or 5432,
            "OPTIONS": options,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "hospital_db"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", "postgres"),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }


# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

if USE_MONGODB and MONGODB_URI:
    DEFAULT_AUTO_FIELD = "django_mongodb_backend.fields.ObjectIdAutoField"
else:
    DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "core.User"


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
]
CORS_ALLOW_ALL_ORIGINS = True  # Permissive for local development


# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}


# ---------------------------------------------------------------------------
# Simple JWT
# ---------------------------------------------------------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# ---------------------------------------------------------------------------
# drf-spectacular (OpenAPI / Swagger)
# ---------------------------------------------------------------------------

SPECTACULAR_SETTINGS = {
    "TITLE": "Hospital Appointment Management API",
    "DESCRIPTION": "API for managing hospital appointments, patients, and doctors.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}


# ---------------------------------------------------------------------------
# Celery
# ---------------------------------------------------------------------------

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"

# Run tasks synchronously so we don't need Redis/Celery running locally
CELERY_TASK_ALWAYS_EAGER = True


# ---------------------------------------------------------------------------
# Email Configuration
# ---------------------------------------------------------------------------

EMAIL_BACKEND = os.getenv("EMAIL_BACKEND")
if not EMAIL_BACKEND:
    if "test" in sys.argv:
        EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    else:
        EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "sreecharan831@gmail.com")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "oaaxeopgtekpjdmr")
DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL", "CityCare Hospital <sreecharan831@gmail.com>"
)
EMAIL_TIMEOUT = int(os.getenv("EMAIL_TIMEOUT", 8))
