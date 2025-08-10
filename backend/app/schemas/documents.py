"""
Document schemas
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from decimal import Decimal
import uuid


class DocumentBase(BaseModel):
    """Base document schema"""
    title: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., min_length=1, max_length=50)
    category: str = Field(..., min_length=1, max_length=50)


class DocumentCreate(DocumentBase):
    """Document creation schema"""
    template_id: Optional[uuid.UUID] = None
    metadata: Optional[Dict[str, Any]] = None


class DocumentUpdate(BaseModel):
    """Document update schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[str] = Field(None, min_length=1, max_length=20)
    metadata: Optional[Dict[str, Any]] = None


class DocumentInDB(DocumentBase):
    """Document schema for database storage"""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    user_id: uuid.UUID
    template_id: Optional[uuid.UUID] = None
    pdf_url: Optional[str] = None
    status: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


class Document(DocumentInDB):
    """Public document schema"""
    pass


class DocumentList(BaseModel):
    """Document list response schema"""
    documents: List[Document]
    total: int
    page: int
    size: int
    has_next: bool
    has_prev: bool


# Financial Document Schemas

class PaystubBase(BaseModel):
    """Base paystub schema"""
    # Employer Information
    employer_name: str = Field(..., min_length=1, max_length=255)
    employer_address: Optional[str] = None
    employer_city: Optional[str] = None
    employer_state: Optional[str] = None
    employer_zip: Optional[str] = None
    employer_phone: Optional[str] = None
    employer_ein: Optional[str] = None
    
    # Employee Information
    employee_name: str = Field(..., min_length=1, max_length=255)
    employee_address: Optional[str] = None
    employee_city: Optional[str] = None
    employee_state: Optional[str] = None
    employee_zip: Optional[str] = None
    employee_id: Optional[str] = None
    employee_ssn: Optional[str] = None
    employee_marital_status: Optional[str] = None
    employee_allowances: Optional[int] = None
    
    # Pay Period Information
    pay_period_start: date
    pay_period_end: date
    pay_date: date
    pay_frequency: Optional[str] = None
    
    # Earnings
    regular_hours: Optional[Decimal] = None
    regular_rate: Optional[Decimal] = None
    regular_pay: Optional[Decimal] = None
    overtime_hours: Optional[Decimal] = None
    overtime_rate: Optional[Decimal] = None
    overtime_pay: Optional[Decimal] = None
    bonus_pay: Optional[Decimal] = None
    commission_pay: Optional[Decimal] = None
    other_earnings: Optional[Dict[str, Any]] = None
    
    # Deductions
    federal_tax: Optional[Decimal] = None
    state_tax: Optional[Decimal] = None
    social_security_tax: Optional[Decimal] = None
    medicare_tax: Optional[Decimal] = None
    health_insurance_premium: Optional[Decimal] = None
    dental_insurance_premium: Optional[Decimal] = None
    vision_insurance_premium: Optional[Decimal] = None
    retirement_401k: Optional[Decimal] = None
    retirement_roth_401k: Optional[Decimal] = None
    other_deductions: Optional[Dict[str, Any]] = None
    
    # Totals
    gross_pay: Decimal
    net_pay: Decimal
    year_to_date_gross: Optional[Decimal] = None
    year_to_date_net: Optional[Decimal] = None
    
    # Payment Information
    payment_method: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_type: Optional[str] = None
    
    # Additional Fields
    check_number: Optional[str] = None
    paystub_number: Optional[int] = None
    notes: Optional[str] = None


class PaystubCreate(PaystubBase):
    """Paystub creation schema"""
    pass


class PaystubInDB(PaystubBase):
    """Paystub schema for database storage"""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    document_id: uuid.UUID


class Paystub(PaystubInDB):
    """Public paystub schema"""
    pass


class BankStatementBase(BaseModel):
    """Base bank statement schema"""
    # Bank Information
    bank_name: str = Field(..., min_length=1, max_length=255)
    bank_address: Optional[str] = None
    bank_phone: Optional[str] = None
    bank_website: Optional[str] = None
    
    # Account Information
    account_number: str = Field(..., min_length=1, max_length=50)
    account_type: str = Field(..., min_length=1, max_length=20)
    account_holder_name: str = Field(..., min_length=1, max_length=255)
    account_holder_address: Optional[str] = None
    
    # Statement Information
    statement_period_start: date
    statement_period_end: date
    statement_date: date
    statement_number: Optional[str] = None
    
    # Balances
    beginning_balance: Decimal
    ending_balance: Decimal
    total_deposits: Optional[Decimal] = None
    total_withdrawals: Optional[Decimal] = None
    total_interest_earned: Optional[Decimal] = None
    total_fees_charged: Optional[Decimal] = None
    available_balance: Optional[Decimal] = None
    
    # Interest Information
    interest_rate: Optional[Decimal] = None
    interest_ytd: Optional[Decimal] = None
    apy: Optional[Decimal] = None
    
    # Transactions
    transactions: List[Dict[str, Any]]
    
    # Additional Information
    overdraft_fees: Optional[Decimal] = None
    monthly_service_fee: Optional[Decimal] = None
    other_fees: Optional[Dict[str, Any]] = None
    rewards_points_balance: Optional[int] = None
    messages: Optional[str] = None
    
    # Layout Information
    bank_template_id: str = Field(..., min_length=1, max_length=50)
    custom_css: Optional[str] = None


class BankStatementCreate(BankStatementBase):
    """Bank statement creation schema"""
    pass


class BankStatementInDB(BankStatementBase):
    """Bank statement schema for database storage"""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    document_id: uuid.UUID


class BankStatement(BankStatementInDB):
    """Public bank statement schema"""
    pass


class W2FormBase(BaseModel):
    """Base W-2 form schema"""
    # Employee Information
    employee_name: str = Field(..., min_length=1, max_length=255)
    employee_address: Optional[str] = None
    employee_city: Optional[str] = None
    employee_state: Optional[str] = None
    employee_zip: Optional[str] = None
    employee_ssn: Optional[str] = None
    
    # Employer Information
    employer_name: str = Field(..., min_length=1, max_length=255)
    employer_address: Optional[str] = None
    employer_city: Optional[str] = None
    employer_state: Optional[str] = None
    employer_zip: Optional[str] = None
    employer_ein: Optional[str] = None
    employer_control_number: Optional[str] = None
    
    # Wages and Taxes
    wages_tips_other_comp: Decimal
    federal_income_tax_withheld: Optional[Decimal] = None
    social_security_wages: Optional[Decimal] = None
    social_security_tax_withheld: Optional[Decimal] = None
    medicare_wages_tips: Optional[Decimal] = None
    medicare_tax_withheld: Optional[Decimal] = None
    social_security_tips: Optional[Decimal] = None
    allocated_tips: Optional[Decimal] = None
    dependent_care_benefits: Optional[Decimal] = None
    nonqualified_plans: Optional[Decimal] = None
    statutory_employee: Optional[bool] = None
    retirement_plan: Optional[bool] = None
    third_party_sick_pay: Optional[bool] = None
    other: Optional[Decimal] = None
    
    # State and Local Information
    state_tax_info: Optional[Dict[str, Any]] = None
    local_tax_info: Optional[Dict[str, Any]] = None
    employer_state_id: Optional[str] = None
    employer_state_id_number: Optional[str] = None


class W2FormCreate(W2FormBase):
    """W-2 form creation schema"""
    pass


class W2FormInDB(W2FormBase):
    """W-2 form schema for database storage"""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    document_id: uuid.UUID


class W2Form(W2FormInDB):
    """Public W-2 form schema"""
    pass


# Template Schemas

class DocumentTemplateBase(BaseModel):
    """Base document template schema"""
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., min_length=1, max_length=50)
    category: str = Field(..., min_length=1, max_length=50)
    template_content: Optional[str] = None
    template_variables: Optional[Dict[str, Any]] = None
    template_css: Optional[str] = None
    template_type: Optional[str] = None
    version: str = Field(default="1.0", max_length=20)
    description: Optional[str] = None


class DocumentTemplateCreate(DocumentTemplateBase):
    """Document template creation schema"""
    pass


class DocumentTemplateUpdate(BaseModel):
    """Document template update schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    template_content: Optional[str] = None
    template_variables: Optional[Dict[str, Any]] = None
    template_css: Optional[str] = None
    version: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class DocumentTemplateInDB(DocumentTemplateBase):
    """Document template schema for database storage"""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class DocumentTemplate(DocumentTemplateInDB):
    """Public document template schema"""
    pass