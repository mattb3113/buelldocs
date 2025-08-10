"""
Document generation API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.database import get_db
from app.schemas.documents import (
    PaystubCreate, BankStatementCreate, W2FormCreate
)
from app.schemas.auth import User as UserSchema
from app.api.auth import get_current_user
from app.services.document_generation_service import document_generation_service

router = APIRouter()


@router.post("/paystub", response_model=dict)
async def generate_paystub(
    paystub_data: PaystubCreate,
    template_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Generate a paystub document"""
    try:
        result = await document_generation_service.create_paystub(
            db=db,
            user_id=current_user.id,
            paystub_data=paystub_data,
            template_id=template_id
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate paystub: {str(e)}"
        )


@router.post("/bank-statement", response_model=dict)
async def generate_bank_statement(
    statement_data: BankStatementCreate,
    template_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Generate a bank statement document"""
    try:
        result = await document_generation_service.create_bank_statement(
            db=db,
            user_id=current_user.id,
            statement_data=statement_data,
            template_id=template_id
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate bank statement: {str(e)}"
        )


@router.post("/w2-form", response_model=dict)
async def generate_w2_form(
    w2_data: W2FormCreate,
    template_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """Generate a W-2 form document"""
    try:
        result = await document_generation_service.create_w2_form(
            db=db,
            user_id=current_user.id,
            w2_data=w2_data,
            template_id=template_id
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate W-2 form: {str(e)}"
        )


@router.get("/templates/{document_type}", response_model=list)
async def get_available_templates(
    document_type: str,
    db: AsyncSession = Depends(get_db)
):
    """Get available templates for a document type"""
    try:
        from sqlalchemy import select
        from app.db.models import DocumentTemplate
        
        query = select(DocumentTemplate).where(
            DocumentTemplate.template_type == document_type,
            DocumentTemplate.is_active == True
        ).order_by(DocumentTemplate.created_at.desc())
        
        result = await db.execute(query)
        templates = result.scalars().all()
        
        return [
            {
                "id": str(template.id),
                "name": template.name,
                "description": template.description,
                "version": template.version
            }
            for template in templates
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve templates: {str(e)}"
        )


@router.get("/preview/{document_type}", response_model=dict)
async def preview_document(
    document_type: str,
    template_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get preview data for a document type"""
    try:
        # Get template
        template = await document_generation_service.get_template(
            db, document_type, template_id
        )
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Return template info and sample data structure
        preview_data = {
            "template_id": str(template.id),
            "template_name": template.name,
            "template_type": template.template_type,
            "description": template.description,
            "required_fields": [],
            "sample_data": {}
        }
        
        # Add sample data based on document type
        if document_type == "paystub":
            preview_data["sample_data"] = {
                "employer_name": "Sample Company Inc.",
                "employee_name": "John Doe",
                "pay_period_start": "2024-01-01",
                "pay_period_end": "2024-01-15",
                "pay_date": "2024-01-20",
                "gross_pay": "2500.00",
                "net_pay": "1850.00"
            }
        elif document_type == "bank_statement":
            preview_data["sample_data"] = {
                "bank_name": "Sample Bank",
                "account_holder_name": "John Doe",
                "account_number": "****1234",
                "statement_date": "2024-01-31",
                "beginning_balance": "1000.00",
                "ending_balance": "1500.00"
            }
        elif document_type == "w2_form":
            preview_data["sample_data"] = {
                "employee_name": "John Doe",
                "employer_name": "Sample Company Inc.",
                "wages_tips_other_comp": "50000.00",
                "federal_income_tax_withheld": "7500.00"
            }
        
        return preview_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate preview: {str(e)}"
        )


@router.get("/supported-types", response_model=list)
async def get_supported_document_types():
    """Get list of supported document types for generation"""
    return [
        {
            "type": "paystub",
            "name": "Pay Stub",
            "category": "financial",
            "description": "Employee payroll stub with earnings and deductions",
            "supported": True
        },
        {
            "type": "bank_statement",
            "name": "Bank Statement",
            "category": "financial", 
            "description": "Bank account statement with transactions",
            "supported": True
        },
        {
            "type": "w2_form",
            "name": "W-2 Form",
            "category": "financial",
            "description": "Annual tax form W-2",
            "supported": True
        },
        {
            "type": "form_1099",
            "name": "1099 Form",
            "category": "financial",
            "description": "Tax form 1099",
            "supported": False
        },
        {
            "type": "diploma",
            "name": "Diploma",
            "category": "academic",
            "description": "Academic diploma certificate",
            "supported": False
        },
        {
            "type": "transcript",
            "name": "Academic Transcript",
            "category": "academic",
            "description": "Official academic transcript",
            "supported": False
        },
        {
            "type": "employment_verification",
            "name": "Employment Verification",
            "category": "employment",
            "description": "Employment verification letter",
            "supported": False
        }
    ]