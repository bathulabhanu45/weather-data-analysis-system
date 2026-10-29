import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory
BASE_DIR = Path(__file__).resolve().parent

# Load .env if present
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR.parent / '.env')

class Config:
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'aetheria-weather-secret-key-2026-prod')
    PORT = int(os.getenv('PORT', 5001))
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')

    # MySQL Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'weather_analysis')

    # SQLite fallback path if MySQL server is not running
    SQLITE_PATH = BASE_DIR / 'weather_analysis.db'

    # Uploads directory
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    SAMPLE_DATA_PATH = BASE_DIR / 'data' / 'sample_weather_data.csv'
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB
