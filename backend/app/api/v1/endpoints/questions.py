from uuid import UUID
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.services.mcq_service import MCQService
from app.services.coding_service import CodingService
from app.schemas.question_schemas import (
    MCQCreate, MCQResponse, MCQListResponse,
    CodingQuestionCreate, CodingQuestionResponse, CodingQuestionListResponse,
    UnifiedQuestionResponse
)

router = APIRouter()


# ===== MCQ Endpoints =====

@router.post("/mcq", response_model=MCQResponse, status_code=201)
async def create_mcq(
    data: MCQCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new MCQ question.
    Also creates an entry in unified_questions automatically.
    """
    service = MCQService(db)
    mcq, unified = await service.create_mcq(data)
    return MCQResponse.model_validate(mcq)


@router.get("/mcq/{mcq_id}", response_model=MCQResponse)
async def get_mcq(
    mcq_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get MCQ by ID."""
    service = MCQService(db)
    mcq = await service.get_mcq(mcq_id)
    if not mcq:
        raise HTTPException(status_code=404, detail="MCQ not found")
    return MCQResponse.model_validate(mcq)


@router.get("/mcq", response_model=MCQListResponse)
async def list_mcqs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    difficulty: Optional[str] = None,
    language: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List MCQ questions with pagination and filters."""
    service = MCQService(db)
    mcqs, total = await service.list_mcqs(page, page_size, difficulty, language, search)
    
    return MCQListResponse(
        questions=[MCQResponse.model_validate(m) for m in mcqs],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/mcq/{mcq_id}/unified", response_model=UnifiedQuestionResponse)
async def get_mcq_unified_entry(
    mcq_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get the unified_question entry for an MCQ."""
    service = MCQService(db)
    unified = await service.get_unified_question_for_mcq(mcq_id)
    if not unified:
        raise HTTPException(status_code=404, detail="Unified question entry not found")
    return UnifiedQuestionResponse.model_validate(unified)


# ===== Coding Question Endpoints =====

@router.post("/coding", response_model=CodingQuestionResponse, status_code=201)
async def create_coding_question(data: CodingQuestionCreate):
    """
    Create a new coding question in MongoDB.
    Note: To attach to a test, use the test's add_questions endpoint.
    """
    service = CodingService()
    result = await service.create_coding_question(data.model_dump())
    return CodingQuestionResponse(**result)


@router.get("/coding/{question_id}", response_model=CodingQuestionResponse)
async def get_coding_question(question_id: int):
    """Get coding question by ID."""
    service = CodingService()
    result = await service.get_coding_question(question_id)
    if not result:
        raise HTTPException(status_code=404, detail="Coding question not found")
    return CodingQuestionResponse(**result)


@router.get("/coding", response_model=CodingQuestionListResponse)
async def list_coding_questions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    difficulty: Optional[str] = None,
    labels: Optional[str] = None,  # comma-separated
    search: Optional[str] = None,
):
    """List coding questions with pagination and filters."""
    service = CodingService()
    
    label_list = labels.split(",") if labels else None
    questions, total = await service.list_coding_questions(
        page, page_size, difficulty, label_list, search
    )
    
    return CodingQuestionListResponse(
        questions=[CodingQuestionResponse(**q) for q in questions],
        total=total,
        page=page,
        page_size=page_size
    )


@router.put("/coding/{question_id}", response_model=CodingQuestionResponse)
async def update_coding_question(
    question_id: int,
    data: CodingQuestionCreate
):
    """Update a coding question."""
    service = CodingService()
    result = await service.update_coding_question(question_id, data.model_dump())
    if not result:
        raise HTTPException(status_code=404, detail="Coding question not found")
    return CodingQuestionResponse(**result)


@router.delete("/coding/{question_id}", status_code=204)
async def delete_coding_question(question_id: int):
    """Delete a coding question."""
    service = CodingService()
    success = await service.delete_coding_question(question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Coding question not found")
