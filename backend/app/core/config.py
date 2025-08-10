"""
Application configuration settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import secrets


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )
    
    # Application Settings
    APP_NAME: str = "BuellDocs API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # Security Settings
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/buelldocs"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 20
    
    # File Storage Settings
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: set[str] = {"pdf", "png", "jpg", "jpeg"}
    
    # Template Settings
    TEMPLATES_DIR: str = "./templates"
    DEFAULT_TEMPLATE_ENGINE: str = "jinja2"
    
    # PDF Generation Settings
    PDF_OUTPUT_DIR: str = "./pdf_output"
    PDF_DPI: int = 300
    PDF_QUALITY: str = "high"
    
    # Email Settings (for notifications)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Redis Settings (for caching)
    REDIS_URL: Optional[str] = None
    CACHE_EXPIRE_SECONDS: int = 3600
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    def get_database_url(self) -> str:
        """Get the database URL for SQLAlchemy"""
        return self.DATABASE_URL


# Global settings instance
settings = Settings()