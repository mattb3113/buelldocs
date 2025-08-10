"""
User service for authentication and user management
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import uuid

from app.db.models import User
from app.schemas.auth import UserCreate, UserUpdate, TokenData
from app.core.config import settings


class UserService:
    """Service for user operations"""
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def hash_password(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(
        self, 
        data: dict, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
    
    def decode_access_token(self, token: str) -> Optional[TokenData]:
        """Decode and validate a JWT access token"""
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM]
            )
            
            user_id: str = payload.get("sub")
            email: str = payload.get("email")
            
            if user_id is None:
                return None
                
            return TokenData(user_id=user_id, email=email)
            
        except JWTError:
            return None
    
    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        query = select(User).where(User.email == email)
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        """Get user by ID"""
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def create_user(self, db: AsyncSession, user_data: UserCreate) -> User:
        """Create a new user"""
        # Validate passwords match
        user_data.validate_passwords_match()
        
        # Hash the password
        hashed_password = self.hash_password(user_data.password)
        
        # Create user object
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            is_active=True,
            is_verified=False,
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return user
    
    async def update_user(
        self, 
        db: AsyncSession, 
        user_id: uuid.UUID, 
        user_data: UserUpdate
    ) -> Optional[User]:
        """Update user information"""
        user = await self.get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Update fields
        for field, value in user_data.model_dump(exclude_unset=True).items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    async def authenticate_user(
        self, 
        db: AsyncSession, 
        email: str, 
        password: str
    ) -> Optional[User]:
        """Authenticate user with email and password"""
        user = await self.get_user_by_email(db, email)
        
        if not user or not user.is_active:
            return None
        
        if not self.verify_password(password, user.hashed_password):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        await db.commit()
        
        return user
    
    async def is_email_taken(self, db: AsyncSession, email: str) -> bool:
        """Check if email is already taken"""
        user = await self.get_user_by_email(db, email)
        return user is not None
    
    async def deactivate_user(self, db: AsyncSession, user_id: uuid.UUID) -> bool:
        """Deactivate a user account"""
        user = await self.get_user_by_id(db, user_id)
        if not user:
            return False
        
        user.is_active = False
        await db.commit()
        
        return True
    
    async def verify_email(self, db: AsyncSession, user_id: uuid.UUID) -> bool:
        """Verify user email"""
        user = await self.get_user_by_id(db, user_id)
        if not user:
            return False
        
        user.is_verified = True
        await db.commit()
        
        return True


# Global service instance
user_service = UserService()