import os
import datetime
from dotenv import load_dotenv

# Load env variables from a .env file if it exists
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'students-registration-system-super-secret-key-12345')
    
    # JWT Settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-super-secret-key-67890-secure-32-byte-length-key')
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(hours=4)
    
    # Database - use DATABASE_URL from environment (Neon/Supabase/Heroku PostgreSQL)
    # Falls back to local SQLite for development
    _db_url = os.environ.get('DATABASE_URL', '')
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = _db_url if _db_url else f"sqlite:///{os.path.join(BASE_DIR, 'students_registration.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
    
    # Testing mode
    TESTING = False
