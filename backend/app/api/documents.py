"""
Document management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional, List
import uuid

from app.db.database import get_db
from app.db.models import Document, User
from app.schemas.documents import (
    Document as DocumentSchema, 
    DocumentCreate, 
    DocumentUpdate, 
    DocumentList
)
from app.schemas.auth import User as UserSchema
from app.api.auth import get_current_user
from app.services.document_generation_service import document_generation_service

router = APIRouter()


@router.get("/", response_model=DocumentList)
async def get_documents(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    type_filter: Optional[str] = Query(None, description="Filter by document type"),
    category_filter: Optional[str] = Query(None, description="Filter by category"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in title"),
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get user's documents with pagination and filtering"""
    try:
        # Build base query
        query = select(Document).where(Document.user_id == current_user.id)
        
        # Apply filters
        if type_filter:
            query = query.where(Document.type == type_filter)
        
        if category_filter:
            query = query.where(Document.category == category_filter)
        
        if status_filter:
            query = query.where(Document.status == status_filter)
        
        if search:
            query = query.where(Document.title.ilike(f"%{search}%"))
        
        # Get total count
        count_query = select(func.count()).select_from(
            query.alias()
        )
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        offset = (page - 1) * size
        query = query.order_by(Document.created_at.desc()).offset(offset).limit(size)
        
        # Execute query
        result = await db.execute(query)
        documents = result.scalars().all()
        
        # Calculate pagination info
        has_next = offset + size < total
        has_prev = page > 1
        
        return DocumentList(
            documents=documents,
            total=total,
            page=page,
            size=size,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve documents: {str(e)}"
        )


@router.get("/{document_id}", response_model=dict)
async def get_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get a specific document with its data"""
    try:
        # Get document with data
        document_data = await document_generation_service.get_document_with_data(
            db, document_id
        )
        
        if not document_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Verify ownership
        query = select(Document).where(
            and_(
                Document.id == document_id,
                Document.user_id == current_user.id
            )
        )
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        return document_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve document: {str(e)}"
        )


@router.put("/{document_id}", response_model=DocumentSchema)
async def update_document(
    document_id: uuid.UUID,
    document_data: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Update document information"""
    try:
        # Get document and verify ownership
        query = select(Document).where(
            and_(
                Document.id == document_id,
                Document.user_id == current_user.id
            )
        )
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Update fields
        for field, value in document_data.model_dump(exclude_unset=True).items():
            if hasattr(document, field):
                setattr(document, field, value)
        
        await db.commit()
        await db.refresh(document)
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update document: {str(e)}"
        )


@router.delete("/{document_id}", response_model=dict)
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Delete a document"""
    try:
        # Get document and verify ownership
        query = select(Document).where(
            and_(
                Document.id == document_id,
                Document.user_id == current_user.id
            )
        )
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Delete document (cascade will handle related data)
        await db.delete(document)
        await db.commit()
        
        return {
            "message": "Document deleted successfully",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )


@router.get("/types/available", response_model=List[dict])
async def get_available_document_types():
    """Get list of available document types"""
    return [
        {
            "type": "paystub",
            "category": "financial",
            "name": "Pay Stub",
            "description": "Employee payroll stub"
        },
        {
            "type": "bank_statement",
            "category": "financial",
            "name": "Bank Statement",
            "description": "Bank account statement"
        },
        {
            "type": "w2_form",
            "category": "financial",
            "name": "W-2 Form",
            "description": "Tax form W-2"
        },
        {
            "type": "form_1099",
            "category": "financial",
            "name": "1099 Form",
            "description": "Tax form 1099"
        },
        {
            "type": "tax_return",
            "category": "financial",
            "name": "Tax Return",
            "description": "Annual tax return"
        },
        {
            "type": "diploma",
            "category": "academic",
            "name": "Diploma",
            "description": "Academic diploma"
        },
        {
            "type": "transcript",
            "category": "academic",
            "name": "Academic Transcript",
            "description": "Academic transcript"
        },
        {
            "type": "employment_verification",
            "category": "employment",
            "name": "Employment Verification",
            "description": "Employment verification letter"
        },
        {
            "type": "professional_reference",
            "category": "employment",
            "name": "Professional Reference",
            "description": "Professional reference letter"
        },
        {
            "type": "offer_letter",
            "category": "employment",
            "name": "Job Offer Letter",
            "description": "Employment offer letter"
        }
    ]


@router.get("/stats/summary", response_model=dict)
async def get_document_stats(
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Get document statistics for current user"""
    try:
        # Get total count
        total_query = select(func.count()).where(Document.user_id == current_user.id)
        total_result = await db.execute(total_query)
        total = total_result.scalar()
        
        # Get count by category
        category_query = select(
            Document.category, 
            func.count(Document.id)
        ).where(
            Document.user_id == current_user.id
        ).group_by(Document.category)
        
        category_result = await db.execute(category_query)
        categories = dict(category_result.fetchall())
        
        # Get count by type
        type_query = select(
            Document.type, 
            func.count(Document.id)
        ).where(
            Document.user_id == current_user.id
        ).group_by(Document.type)
        
        type_result = await db.execute(type_query)
        types = dict(type_result.fetchall())
        
        return {
            "total_documents": total,
            "by_category": categories,
            "by_type": types
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )