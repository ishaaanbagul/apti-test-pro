from pydantic import BaseModel, Field
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from enum import Enum


class QuestionTypeEnum(str, Enum):
    MCQ = "MCQ"
    CODING = "CODING"


# --- MCQ Schemas ---
class MCQCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str = Field(..., pattern="^[ABCD]$")
    difficulty_level: str = "medium"
    language: Optional[str] = None


class MCQResponse(BaseModel):
    mcq_id: UUID
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    difficulty_level: str
    language: Optional[str]
    
    class Config:
        from_attributes = True


class MCQListResponse(BaseModel):
    questions: List[MCQResponse]
    total: int
    page: int
    page_size: int


# --- Coding Question Schemas (MongoDB) ---
class CodingQuestionCreate(BaseModel):
    title: str
    description: str
    difficulty: str = "medium"
    labels: List[str] = []
    sample_input: str = ""
    sample_output: Any = ""
    constraints: str = ""


class CodingQuestionResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    labels: List[str] = []
    sample_input: str = ""
    sample_output: Any = ""
    constraints: str = ""


class CodingQuestionListResponse(BaseModel):
    questions: List[CodingQuestionResponse]
    total: int
    page: int
    page_size: int


# --- Unified Question Schema ---
class UnifiedQuestionResponse(BaseModel):
    question_id: UUID
    source_id: UUID
    question_text: str
    difficulty_level: str
    language: Optional[str]
    type: QuestionTypeEnum
    created_at: datetime
    
    class Config:
        from_attributes = True
