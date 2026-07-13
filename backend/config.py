import os
import datetime
from dotenv import load_dotenv

# Load env variables from a .env file if it exists
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'students-registration-system-super-secret-key-12345')
    
    # JWT Settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-super-secret-key-67890')
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(hours=4)
    
    # Database Settings - default to MySQL under XAMPP, fallback to SQLite
    MYSQL_USER = os.environ.get('DB_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('DB_PASSWORD', '')
    MYSQL_HOST = os.environ.get('DB_HOST', 'localhost')
    MYSQL_PORT = os.environ.get('DB_PORT', '3306')
    MYSQL_DB = os.environ.get('DB_NAME', 'students_registration')
    
    # Assemble MySQL URI
    MYSQL_URI = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    # SQLite Fallback URI
    SQLITE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'students_registration.db')}"
    
    # Choose Database URI. Will default to MySQL, but app.py will check if MySQL is available at start.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', MYSQL_URI)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Testing mode
    TESTING = False
