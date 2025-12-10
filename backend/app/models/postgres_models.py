import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, String, Text, Integer, Enum, DateTime, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.postgres import Base


class QuestionTypeEnum(str, PyEnum):
    MCQ = "MCQ"
    CODING = "CODING"


class TestStatusEnum(str, PyEnum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"


class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tests = relationship("Test", back_populates="creator")


class MCQQuestion(Base):
    __tablename__ = "mcq_questions"
    
    mcq_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_answer = Column(String(1), nullable=False)  # A, B, C, or D
    difficulty_level = Column(String(20), nullable=False)
    language = Column(String(50), nullable=True)


class UnifiedQuestion(Base):
    __tablename__ = "unified_questions"
    
    question_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), nullable=False)  # mcq_id or MongoDB ObjectId as UUID
    question_text = Column(Text, nullable=False)
    difficulty_level = Column(String(20), nullable=False)
    language = Column(String(50), nullable=True)
    type = Column(Enum(QuestionTypeEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    test_questions = relationship("TestQuestion", back_populates="unified_question")


class Test(Base):
    __tablename__ = "tests"
    
    test_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_name = Column(String(255), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    status = Column(Enum(TestStatusEnum), default=TestStatusEnum.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User", back_populates="tests")
    test_questions = relationship("TestQuestion", back_populates="test", cascade="all, delete-orphan")


class TestQuestion(Base):
    __tablename__ = "test_questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.test_id", ondelete="CASCADE"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("unified_questions.question_id", ondelete="CASCADE"), nullable=False)
    question_type = Column(Enum(QuestionTypeEnum), nullable=False)
    order_index = Column(Integer, nullable=False)
    
    test = relationship("Test", back_populates="test_questions")
    unified_question = relationship("UnifiedQuestion", back_populates="test_questions")
