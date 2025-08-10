"""
Document generation service for creating PDFs from templates
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jinja2 import Template, Environment, FileSystemLoader
from weasyprint import HTML, CSS
from typing import Optional, Dict, Any, List
from pathlib import Path
import tempfile
import uuid
import json
import logging

from app.db.models import Document, DocumentTemplate, Paystub, BankStatement, W2Form
from app.schemas.documents import (
    PaystubCreate, BankStatementCreate, W2FormCreate
)
from app.core.config import settings

logger = logging.getLogger(__name__)


class DocumentGenerationService:
    """Service for document generation and PDF creation"""
    
    def __init__(self):
        self.templates_dir = Path(settings.TEMPLATES_DIR)
        self.pdf_output_dir = Path(settings.PDF_OUTPUT_DIR)
        
        # Ensure directories exist
        self.templates_dir.mkdir(exist_ok=True)
        self.pdf_output_dir.mkdir(exist_ok=True)
        
        # Initialize Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(self.templates_dir)
        )
        
        # Add custom filters
        self._add_custom_filters()
    
    def _add_custom_filters(self):
        """Add custom Jinja2 filters"""
        
        def currency_filter(value):
            """Format value as currency"""
            if value is None:
                return "$0.00"
            return f"${float(value):,.2f}"
        
        def date_filter(value, format_str="%B %d, %Y"):
            """Format date"""
            if value is None:
                return ""
            return value.strftime(format_str)
        
        def percentage_filter(value):
            """Format value as percentage"""
            if value is None:
                return "0.00%"
            return f"{float(value):.2f}%"
        
        self.jinja_env.filters['currency'] = currency_filter
        self.jinja_env.filters['date'] = date_filter
        self.jinja_env.filters['percentage'] = percentage_filter
    
    async def get_template(
        self, 
        db: AsyncSession, 
        template_type: str, 
        template_id: Optional[str] = None
    ) -> Optional[DocumentTemplate]:
        """Get document template by type or ID"""
        if template_id:
            query = select(DocumentTemplate).where(
                DocumentTemplate.id == uuid.UUID(template_id),
                DocumentTemplate.is_active == True
            )
        else:
            query = select(DocumentTemplate).where(
                DocumentTemplate.template_type == template_type,
                DocumentTemplate.is_active == True
            ).order_by(DocumentTemplate.created_at.desc())
        
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    def process_template(self, template_content: str, data: Dict[str, Any]) -> str:
        """Process template with data"""
        try:
            template = Template(template_content)
            return template.render(**data)
        except Exception as e:
            logger.error(f"Template processing error: {e}")
            raise ValueError(f"Failed to process template: {str(e)}")
    
    def generate_pdf(
        self, 
        html_content: str, 
        css_content: Optional[str] = None
    ) -> bytes:
        """Generate PDF from HTML content"""
        try:
            # Create HTML object
            html_obj = HTML(string=html_content)
            
            # Create CSS object if provided
            css_obj = None
            if css_content:
                css_obj = CSS(string=css_content)
            
            # Generate PDF
            if css_obj:
                pdf_bytes = html_obj.write_pdf(stylesheets=[css_obj])
            else:
                pdf_bytes = html_obj.write_pdf()
            
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"PDF generation error: {e}")
            raise ValueError(f"Failed to generate PDF: {str(e)}")
    
    async def save_pdf(self, pdf_bytes: bytes, filename: str) -> str:
        """Save PDF bytes to file and return URL"""
        try:
            file_path = self.pdf_output_dir / filename
            
            with open(file_path, 'wb') as f:
                f.write(pdf_bytes)
            
            # Return relative URL
            return f"/pdf_output/{filename}"
            
        except Exception as e:
            logger.error(f"PDF save error: {e}")
            raise ValueError(f"Failed to save PDF: {str(e)}")
    
    async def create_paystub(
        self, 
        db: AsyncSession, 
        user_id: uuid.UUID, 
        paystub_data: PaystubCreate,
        template_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create paystub document and generate PDF"""
        try:
            # Get template
            template = await self.get_template(db, "paystub", template_id)
            if not template:
                raise ValueError("Paystub template not found")
            
            # Create document record
            document = Document(
                user_id=user_id,
                title=f"Paystub - {paystub_data.employee_name} - {paystub_data.pay_date}",
                type="paystub",
                category="financial",
                template_id=template.id
            )
            
            db.add(document)
            await db.flush()
            
            # Create paystub record
            paystub = Paystub(
                document_id=document.id,
                **paystub_data.model_dump()
            )
            
            db.add(paystub)
            await db.flush()
            
            # Prepare template data
            template_data = {
                "paystub": paystub_data.model_dump(),
                "document": {
                    "id": str(document.id),
                    "title": document.title,
                    "created_at": document.created_at
                }
            }
            
            # Process template
            html_content = self.process_template(
                template.template_content, 
                template_data
            )
            
            # Generate PDF
            pdf_bytes = self.generate_pdf(html_content, template.template_css)
            
            # Save PDF
            filename = f"paystub_{document.id}.pdf"
            pdf_url = await self.save_pdf(pdf_bytes, filename)
            
            # Update document with PDF URL
            document.pdf_url = pdf_url
            
            await db.commit()
            
            return {
                "document_id": str(document.id),
                "pdf_url": pdf_url,
                "success": True
            }
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Paystub creation error: {e}")
            raise ValueError(f"Failed to create paystub: {str(e)}")
    
    async def create_bank_statement(
        self, 
        db: AsyncSession, 
        user_id: uuid.UUID, 
        statement_data: BankStatementCreate,
        template_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create bank statement document and generate PDF"""
        try:
            # Get template
            template = await self.get_template(db, "bank_statement", template_id)
            if not template:
                raise ValueError("Bank statement template not found")
            
            # Create document record
            document = Document(
                user_id=user_id,
                title=f"Bank Statement - {statement_data.bank_name} - {statement_data.statement_date}",
                type="bank_statement",
                category="financial",
                template_id=template.id
            )
            
            db.add(document)
            await db.flush()
            
            # Create bank statement record
            bank_statement = BankStatement(
                document_id=document.id,
                **statement_data.model_dump()
            )
            
            db.add(bank_statement)
            await db.flush()
            
            # Prepare template data
            template_data = {
                "statement": statement_data.model_dump(),
                "document": {
                    "id": str(document.id),
                    "title": document.title,
                    "created_at": document.created_at
                }
            }
            
            # Process template
            html_content = self.process_template(
                template.template_content, 
                template_data
            )
            
            # Generate PDF
            pdf_bytes = self.generate_pdf(html_content, template.template_css)
            
            # Save PDF
            filename = f"bank_statement_{document.id}.pdf"
            pdf_url = await self.save_pdf(pdf_bytes, filename)
            
            # Update document with PDF URL
            document.pdf_url = pdf_url
            
            await db.commit()
            
            return {
                "document_id": str(document.id),
                "pdf_url": pdf_url,
                "success": True
            }
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Bank statement creation error: {e}")
            raise ValueError(f"Failed to create bank statement: {str(e)}")
    
    async def create_w2_form(
        self, 
        db: AsyncSession, 
        user_id: uuid.UUID, 
        w2_data: W2FormCreate,
        template_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create W-2 form document and generate PDF"""
        try:
            # Get template
            template = await self.get_template(db, "w2_form", template_id)
            if not template:
                raise ValueError("W-2 form template not found")
            
            # Create document record
            document = Document(
                user_id=user_id,
                title=f"W-2 Form - {w2_data.employee_name} - {w2_data.employer_name}",
                type="w2_form",
                category="financial",
                template_id=template.id
            )
            
            db.add(document)
            await db.flush()
            
            # Create W-2 form record
            w2_form = W2Form(
                document_id=document.id,
                **w2_data.model_dump()
            )
            
            db.add(w2_form)
            await db.flush()
            
            # Prepare template data
            template_data = {
                "w2": w2_data.model_dump(),
                "document": {
                    "id": str(document.id),
                    "title": document.title,
                    "created_at": document.created_at
                }
            }
            
            # Process template
            html_content = self.process_template(
                template.template_content, 
                template_data
            )
            
            # Generate PDF
            pdf_bytes = self.generate_pdf(html_content, template.template_css)
            
            # Save PDF
            filename = f"w2_form_{document.id}.pdf"
            pdf_url = await self.save_pdf(pdf_bytes, filename)
            
            # Update document with PDF URL
            document.pdf_url = pdf_url
            
            await db.commit()
            
            return {
                "document_id": str(document.id),
                "pdf_url": pdf_url,
                "success": True
            }
            
        except Exception as e:
            await db.rollback()
            logger.error(f"W-2 form creation error: {e}")
            raise ValueError(f"Failed to create W-2 form: {str(e)}")
    
    async def get_document_with_data(
        self, 
        db: AsyncSession, 
        document_id: uuid.UUID
    ) -> Optional[Dict[str, Any]]:
        """Get document with associated data"""
        # Get document
        query = select(Document).where(Document.id == document_id)
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            return None
        
        # Get associated data based on document type
        document_data = {
            "id": str(document.id),
            "title": document.title,
            "type": document.type,
            "category": document.category,
            "status": document.status,
            "pdf_url": document.pdf_url,
            "created_at": document.created_at,
            "updated_at": document.updated_at
        }
        
        if document.type == "paystub":
            query = select(Paystub).where(Paystub.document_id == document.id)
            result = await db.execute(query)
            paystub = result.scalar_one_or_none()
            if paystub:
                document_data["paystub"] = paystub
        
        elif document.type == "bank_statement":
            query = select(BankStatement).where(BankStatement.document_id == document.id)
            result = await db.execute(query)
            statement = result.scalar_one_or_none()
            if statement:
                document_data["bank_statement"] = statement
        
        elif document.type == "w2_form":
            query = select(W2Form).where(W2Form.document_id == document.id)
            result = await db.execute(query)
            w2_form = result.scalar_one_or_none()
            if w2_form:
                document_data["w2_form"] = w2_form
        
        return document_data


# Global service instance
document_generation_service = DocumentGenerationService()