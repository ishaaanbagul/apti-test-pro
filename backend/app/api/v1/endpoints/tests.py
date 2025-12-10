from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.services.test_service import TestService
from app.schemas.test_schemas import (
    TestCreate, TestUpdate, TestResponse, TestListResponse,
    TestWithQuestionsResponse, AddQuestionsRequest, TestStatusEnum
)

router = APIRouter()


async def get_test_service(db: AsyncSession = Depends(get_db)) -> TestService:
    return TestService(db)


@router.post("/", response_model=TestWithQuestionsResponse, status_code=201)
async def create_test(
    data: TestCreate,
    service: TestService = Depends(get_test_service)
):
    """
    Create a new test with optional questions.
    
    You can:
    - Create test with basic info only
    - Attach existing questions (by question_id from unified_questions)
    - Create new MCQ questions inline
    - Create new coding questions inline
    """
    result = await service.create_test(data)
    return result


@router.post("/{test_id}/questions", response_model=TestWithQuestionsResponse)
async def add_questions_to_test(
    test_id: UUID,
    data: AddQuestionsRequest,
    service: TestService = Depends(get_test_service)
):
    """
    Add questions to an existing test.
    
    Supports adding:
    - Existing questions by question_id
    - New MCQ questions (created inline)
    - New coding questions (created inline)
    """
    test = await service.get_test(test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    result = await service.add_questions_to_test(test_id, data)
    return result


@router.get("/{test_id}", response_model=TestWithQuestionsResponse)
async def get_test(
    test_id: UUID,
    service: TestService = Depends(get_test_service)
):
    """Get a test with all its questions."""
    result = await service.get_test_with_questions(test_id)
    if not result:
        raise HTTPException(status_code=404, detail="Test not found")
    return result


@router.put("/{test_id}", response_model=TestResponse)
async def update_test(
    test_id: UUID,
    data: TestUpdate,
    service: TestService = Depends(get_test_service)
):
    """Update test basic info (name, duration, status)."""
    result = await service.update_test(test_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Test not found")
    return TestResponse.model_validate(result)


@router.delete("/{test_id}", status_code=204)
async def delete_test(
    test_id: UUID,
    service: TestService = Depends(get_test_service)
):
    """Delete a test (cascades to test_questions)."""
    success = await service.delete_test(test_id)
    if not success:
        raise HTTPException(status_code=404, detail="Test not found")


@router.get("/", response_model=TestListResponse)
async def list_tests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[TestStatusEnum] = None,
    created_by: Optional[UUID] = None,
    service: TestService = Depends(get_test_service)
):
    """List all tests with pagination and optional filters."""
    from app.models import TestStatusEnum as ModelStatus
    status_filter = ModelStatus(status.value) if status else None
    
    tests, total = await service.list_tests(page, page_size, status_filter, created_by)
    
    return TestListResponse(
        tests=[TestResponse.model_validate(t) for t in tests],
        total=total,
        page=page,
        page_size=page_size
    )


@router.delete("/{test_id}/questions/{question_id}", status_code=204)
async def remove_question_from_test(
    test_id: UUID,
    question_id: UUID,
    service: TestService = Depends(get_test_service)
):
    """Remove a question from a test."""
    success = await service.remove_question_from_test(test_id, question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found in test")
