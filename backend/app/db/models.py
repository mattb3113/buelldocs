"""
SQLAlchemy database models
"""
from sqlalchemy import (
    Column, String, Integer, DateTime, Text, Boolean, DECIMAL, Date, Time,
    ForeignKey, Index, CheckConstraint, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from app.db.database import Base


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps"""
    
    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=func.now(), nullable=False)
    
    @declared_attr
    def updated_at(cls):
        return Column(
            DateTime, 
            default=func.now(), 
            onupdate=func.now(), 
            nullable=False
        )


class User(Base, TimestampMixin):
    """User model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime)
    
    # Relationships
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="user", cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<User {self.email}>"


class DocumentTemplate(Base, TimestampMixin):
    """Document template model"""
    __tablename__ = "document_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    template_content = Column(Text)
    template_variables = Column(JSONB)
    template_css = Column(Text)
    template_type = Column(String(50))
    version = Column(String(20), default="1.0")
    is_active = Column(Boolean, default=True)
    description = Column(Text)
    
    # Relationships
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="template"
    )
    
    def __repr__(self):
        return f"<DocumentTemplate {self.name}>"


class Document(Base, TimestampMixin):
    """Base document model"""
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    template_id = Column(UUID(as_uuid=True), ForeignKey("document_templates.id"))
    pdf_url = Column(String(255))
    status = Column(String(20), default="active")
    metadata = Column(JSONB)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="documents")
    template: Mapped["DocumentTemplate"] = relationship(
        "DocumentTemplate", back_populates="documents"
    )
    
    # Financial document relationships
    paystub: Mapped["Paystub"] = relationship(
        "Paystub", back_populates="document", uselist=False, cascade="all, delete-orphan"
    )
    bank_statement: Mapped["BankStatement"] = relationship(
        "BankStatement", back_populates="document", uselist=False, cascade="all, delete-orphan"
    )
    w2_form: Mapped["W2Form"] = relationship(
        "W2Form", back_populates="document", uselist=False, cascade="all, delete-orphan"
    )
    
    # Indexes
    __table_args__ = (
        Index("ix_documents_user_type", "user_id", "type"),
        Index("ix_documents_created_at", "created_at"),
    )
    
    def __repr__(self):
        return f"<Document {self.title} ({self.type})>"


class Paystub(Base):
    """Paystub model"""
    __tablename__ = "paystubs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), unique=True, nullable=False)
    
    # Employer Information
    employer_name = Column(String(255), nullable=False)
    employer_address = Column(String(255))
    employer_city = Column(String(100))
    employer_state = Column(String(50))
    employer_zip = Column(String(20))
    employer_phone = Column(String(20))
    employer_ein = Column(String(20))
    
    # Employee Information
    employee_name = Column(String(255), nullable=False)
    employee_address = Column(String(255))
    employee_city = Column(String(100))
    employee_state = Column(String(50))
    employee_zip = Column(String(20))
    employee_id = Column(String(50))
    employee_ssn = Column(String(11))
    employee_marital_status = Column(String(20))
    employee_allowances = Column(Integer)
    
    # Pay Period Information
    pay_period_start = Column(Date, nullable=False)
    pay_period_end = Column(Date, nullable=False)
    pay_date = Column(Date, nullable=False)
    pay_frequency = Column(String(20))
    
    # Earnings
    regular_hours = Column(DECIMAL(5, 2))
    regular_rate = Column(DECIMAL(10, 2))
    regular_pay = Column(DECIMAL(10, 2))
    overtime_hours = Column(DECIMAL(5, 2))
    overtime_rate = Column(DECIMAL(10, 2))
    overtime_pay = Column(DECIMAL(10, 2))
    doubletime_hours = Column(DECIMAL(5, 2))
    doubletime_rate = Column(DECIMAL(10, 2))
    doubletime_pay = Column(DECIMAL(10, 2))
    bonus_pay = Column(DECIMAL(10, 2))
    commission_pay = Column(DECIMAL(10, 2))
    other_earnings = Column(JSONB)
    
    # Deductions
    federal_tax = Column(DECIMAL(10, 2))
    state_tax = Column(DECIMAL(10, 2))
    social_security_tax = Column(DECIMAL(10, 2))
    medicare_tax = Column(DECIMAL(10, 2))
    state_disability_insurance = Column(DECIMAL(10, 2))
    health_insurance_premium = Column(DECIMAL(10, 2))
    dental_insurance_premium = Column(DECIMAL(10, 2))
    vision_insurance_premium = Column(DECIMAL(10, 2))
    retirement_401k = Column(DECIMAL(10, 2))
    retirement_roth_401k = Column(DECIMAL(10, 2))
    other_deductions = Column(JSONB)
    
    # Totals
    gross_pay = Column(DECIMAL(10, 2), nullable=False)
    net_pay = Column(DECIMAL(10, 2), nullable=False)
    year_to_date_gross = Column(DECIMAL(10, 2))
    year_to_date_net = Column(DECIMAL(10, 2))
    
    # Payment Information
    payment_method = Column(String(20))
    bank_name = Column(String(255))
    bank_account_type = Column(String(20))
    bank_account_number = Column(String(20))
    bank_routing_number = Column(String(20))
    
    # Additional Fields
    check_number = Column(String(20))
    paystub_number = Column(Integer)
    notes = Column(Text)
    
    # Relationship
    document: Mapped["Document"] = relationship("Document", back_populates="paystub")
    
    def __repr__(self):
        return f"<Paystub {self.employee_name} - {self.pay_date}>"


class BankStatement(Base):
    """Bank statement model"""
    __tablename__ = "bank_statements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), unique=True, nullable=False)
    
    # Bank Information
    bank_name = Column(String(255), nullable=False)
    bank_address = Column(String(255))
    bank_phone = Column(String(20))
    bank_website = Column(String(255))
    
    # Account Information
    account_number = Column(String(50), nullable=False)
    account_type = Column(String(20), nullable=False)
    account_holder_name = Column(String(255), nullable=False)
    account_holder_address = Column(String(255))
    
    # Statement Information
    statement_period_start = Column(Date, nullable=False)
    statement_period_end = Column(Date, nullable=False)
    statement_date = Column(Date, nullable=False)
    statement_number = Column(String(20))
    
    # Balances
    beginning_balance = Column(DECIMAL(12, 2), nullable=False)
    ending_balance = Column(DECIMAL(12, 2), nullable=False)
    total_deposits = Column(DECIMAL(12, 2))
    total_withdrawals = Column(DECIMAL(12, 2))
    total_interest_earned = Column(DECIMAL(12, 2))
    total_fees_charged = Column(DECIMAL(12, 2))
    available_balance = Column(DECIMAL(12, 2))
    
    # Interest Information
    interest_rate = Column(DECIMAL(5, 2))
    interest_ytd = Column(DECIMAL(12, 2))
    apy = Column(DECIMAL(5, 2))
    
    # Transactions
    transactions = Column(JSONB, nullable=False)
    
    # Additional Information
    overdraft_fees = Column(DECIMAL(12, 2))
    monthly_service_fee = Column(DECIMAL(12, 2))
    other_fees = Column(JSONB)
    rewards_points_balance = Column(Integer)
    messages = Column(Text)
    
    # Layout Information
    bank_template_id = Column(String(50), nullable=False)
    custom_css = Column(Text)
    
    # Relationship
    document: Mapped["Document"] = relationship("Document", back_populates="bank_statement")
    
    def __repr__(self):
        return f"<BankStatement {self.bank_name} - {self.account_number}>"


class W2Form(Base):
    """W-2 form model"""
    __tablename__ = "w2_forms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), unique=True, nullable=False)
    
    # Employee Information
    employee_name = Column(String(255), nullable=False)
    employee_address = Column(String(255))
    employee_city = Column(String(100))
    employee_state = Column(String(50))
    employee_zip = Column(String(20))
    employee_ssn = Column(String(11))
    
    # Employer Information
    employer_name = Column(String(255), nullable=False)
    employer_address = Column(String(255))
    employer_city = Column(String(100))
    employer_state = Column(String(50))
    employer_zip = Column(String(20))
    employer_ein = Column(String(10))
    employer_control_number = Column(String(20))
    
    # Wages and Taxes
    wages_tips_other_comp = Column(DECIMAL(10, 2), nullable=False)
    federal_income_tax_withheld = Column(DECIMAL(10, 2))
    social_security_wages = Column(DECIMAL(10, 2))
    social_security_tax_withheld = Column(DECIMAL(10, 2))
    medicare_wages_tips = Column(DECIMAL(10, 2))
    medicare_tax_withheld = Column(DECIMAL(10, 2))
    social_security_tips = Column(DECIMAL(10, 2))
    allocated_tips = Column(DECIMAL(10, 2))
    dependent_care_benefits = Column(DECIMAL(10, 2))
    nonqualified_plans = Column(DECIMAL(10, 2))
    statutory_employee = Column(Boolean)
    retirement_plan = Column(Boolean)
    third_party_sick_pay = Column(Boolean)
    other = Column(DECIMAL(10, 2))
    
    # State and Local Information
    state_tax_info = Column(JSONB)
    local_tax_info = Column(JSONB)
    employer_state_id = Column(String(20))
    employer_state_id_number = Column(String(20))
    
    # Relationship
    document: Mapped["Document"] = relationship("Document", back_populates="w2_form")
    
    def __repr__(self):
        return f"<W2Form {self.employee_name} - {self.employer_name}>"