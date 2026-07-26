import os
import datetime
from dotenv import load_dotenv

# Load env variables from a .env file if it exists (local development)
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    # ─── Security Keys ────────────────────────────────────────────────────────
    # REQUIRED in production — set these as environment variables on Render
    # Never use the defaults below in production
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        import secrets as _secrets
        SECRET_KEY = _secrets.token_hex(32)
        print("WARNING: SECRET_KEY not set. Using a random key — sessions will not persist across restarts.")

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        import secrets as _secrets
        JWT_SECRET_KEY = _secrets.token_hex(32)
        print("WARNING: JWT_SECRET_KEY not set. Using a random key — JWTs will be invalidated on every restart.")

    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(hours=4)

    # ─── Database ─────────────────────────────────────────────────────────────
    # Production: set DATABASE_URL to your Neon/Supabase/Railway PostgreSQL URL
    # Local development: falls back to a local SQLite file
    _db_url = os.environ.get('DATABASE_URL', '')

    # Heroku/Neon sometimes return postgres:// — SQLAlchemy requires postgresql://
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)

    SQLALCHEMY_DATABASE_URI = _db_url if _db_url else f"sqlite:///{os.path.join(BASE_DIR, 'students_registration.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        # For PostgreSQL connection pooling in serverless environments
        "pool_size": 5,
        "max_overflow": 10,
    }

    # ─── Frontend URL (for CORS) ──────────────────────────────────────────────
    # Set FRONTEND_URL to your Vercel deployment URL in production
    FRONTEND_URL = os.environ.get('FRONTEND_URL', '')

    # ─── Testing mode ─────────────────────────────────────────────────────────
    TESTING = False
