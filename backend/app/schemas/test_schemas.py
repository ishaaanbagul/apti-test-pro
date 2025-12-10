from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum


class TestStatusEnum(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"


class QuestionTypeEnum(str, Enum):
    MCQ = "MCQ"
    CODING = "CODING"


# --- Question attachment schemas ---
class QuestionAttachment(BaseModel):
    """For attaching existing questions to a test"""
    question_id: UUID
    question_type: QuestionTypeEnum
    order_index: Optional[int] = None


class NewMCQInTest(BaseModel):
    """For creating new MCQ and attaching to test"""
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str = Field(..., pattern="^[ABCD]$")
    difficulty_level: str = "medium"
    language: Optional[str] = None
    order_index: Optional[int] = None


class NewCodingInTest(BaseModel):
    """For creating new coding question and attaching to test"""
    title: str
    description: str
    difficulty: str = "medium"
    labels: List[str] = []
    sample_input: str = ""
    sample_output: str = ""
    constraints: str = ""
    order_index: Optional[int] = None


# --- Test schemas ---
class TestCreate(BaseModel):
    test_name: str = Field(..., min_length=1, max_length=255)
    duration_minutes: int = Field(..., ge=1, le=480)
    created_by: UUID
    status: TestStatusEnum = TestStatusEnum.DRAFT
    
    # Optional: attach questions during creation
    existing_questions: List[QuestionAttachment] = []
    new_mcqs: List[NewMCQInTest] = []
    new_coding_questions: List[NewCodingInTest] = []


class TestUpdate(BaseModel):
    test_name: Optional[str] = Field(None, min_length=1, max_length=255)
    duration_minutes: Optional[int] = Field(None, ge=1, le=480)
    status: Optional[TestStatusEnum] = None


class TestQuestionResponse(BaseModel):
    id: UUID
    question_id: UUID
    question_type: QuestionTypeEnum
    order_index: int
    question_text: Optional[str] = None
    difficulty_level: Optional[str] = None
    
    class Config:
        from_attributes = True


class TestResponse(BaseModel):
    test_id: UUID
    test_name: str
    created_by: UUID
    duration_minutes: int
    status: TestStatusEnum
    created_at: datetime
    
    class Config:
        from_attributes = True


class TestWithQuestionsResponse(TestResponse):
    questions: List[TestQuestionResponse] = []
    mcq_details: List[dict] = []
    coding_details: List[dict] = []


class TestListResponse(BaseModel):
    tests: List[TestResponse]
    total: int
    page: int
    page_size: int


class AddQuestionsRequest(BaseModel):
    """Request to add questions to an existing test"""
    existing_questions: List[QuestionAttachment] = []
    new_mcqs: List[NewMCQInTest] = []
    new_coding_questions: List[NewCodingInTest] = []
