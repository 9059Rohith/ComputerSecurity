import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Application Settings
    APP_NAME: str = "Secure Data Sharing Portal"
    DEBUG: bool = False
    
    # MongoDB Atlas Configuration (Passed from your .env)
    MONGODB_URI: str = os.getenv("MONGODB_URI")
    DB_NAME: str = os.getenv("DB_NAME", "computersecurity")
    
    # Security Components Configuration
    # This 'SECRET_KEY' is used for generating JWT session tokens for NIST Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback_secret_for_lab_only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # [Component 4: Hashing with Salt]
    # A 'PEPPER' adds an extra layer of security beyond the per-user salt
    PEPPER: str = os.getenv("PEPPER", "default_lab_pepper")

    class Config:
        env_file = ".env"

# Instantiate settings to be imported by other files
settings = Settings()