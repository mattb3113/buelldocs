"""
BuellDocs FastAPI Application
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path

from app.core.config import settings
from app.db.database import init_db, close_db
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.api.generators import router as generators_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    logger.info("Starting BuellDocs API...")
    
    # Initialize database
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    # Create necessary directories
    Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)
    Path(settings.PDF_OUTPUT_DIR).mkdir(exist_ok=True)
    Path(settings.TEMPLATES_DIR).mkdir(exist_ok=True)
    
    logger.info("BuellDocs API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down BuellDocs API...")
    
    try:
        await close_db()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database: {e}")
    
    logger.info("BuellDocs API shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="BuellDocs Document Generation API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "success": False
        }
    )


# HTTP exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": exc.detail,
            "success": False
        }
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "app_name": settings.APP_NAME
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "BuellDocs API",
        "version": settings.APP_VERSION,
        "docs_url": f"{settings.API_V1_STR}/docs"
    }


# Include API routers
app.include_router(
    auth_router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)

app.include_router(
    documents_router,
    prefix=f"{settings.API_V1_STR}/documents",
    tags=["Documents"]
)

app.include_router(
    generators_router,
    prefix=f"{settings.API_V1_STR}/generators",
    tags=["Document Generation"]
)

# Mount static files
if Path(settings.PDF_OUTPUT_DIR).exists():
    app.mount(
        "/pdf_output", 
        StaticFiles(directory=settings.PDF_OUTPUT_DIR), 
        name="pdf_output"
    )

if Path(settings.UPLOAD_DIR).exists():
    app.mount(
        "/uploads", 
        StaticFiles(directory=settings.UPLOAD_DIR), 
        name="uploads"
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )