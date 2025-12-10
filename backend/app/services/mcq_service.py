import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models import MCQQuestion, UnifiedQuestion, QuestionTypeEnum
from app.schemas.question_schemas import MCQCreate, MCQResponse


class MCQService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_mcq(self, data: MCQCreate) -> tuple[MCQQuestion, UnifiedQuestion]:
        """Create MCQ and its unified_question entry."""
        mcq = MCQQuestion(
            question_text=data.question_text,
            option_a=data.option_a,
            option_b=data.option_b,
            option_c=data.option_c,
            option_d=data.option_d,
            correct_answer=data.correct_answer.upper(),
            difficulty_level=data.difficulty_level,
            language=data.language,
        )
        self.db.add(mcq)
        await self.db.flush()
        
        # Create unified question entry
        unified = UnifiedQuestion(
            source_id=mcq.mcq_id,
            question_text=data.question_text,
            difficulty_level=data.difficulty_level,
            language=data.language,
            type=QuestionTypeEnum.MCQ,
        )
        self.db.add(unified)
        await self.db.commit()
        await self.db.refresh(mcq)
        await self.db.refresh(unified)
        
        return mcq, unified
    
    async def get_mcq(self, mcq_id: uuid.UUID) -> Optional[MCQQuestion]:
        """Get MCQ by ID."""
        result = await self.db.execute(
            select(MCQQuestion).where(MCQQuestion.mcq_id == mcq_id)
        )
        return result.scalar_one_or_none()
    
    async def list_mcqs(
        self, 
        page: int = 1, 
        page_size: int = 20,
        difficulty: Optional[str] = None,
        language: Optional[str] = None,
        search: Optional[str] = None
    ) -> tuple[List[MCQQuestion], int]:
        """List MCQs with pagination and filters."""
        query = select(MCQQuestion)
        count_query = select(func.count(MCQQuestion.mcq_id))
        
        if difficulty:
            query = query.where(MCQQuestion.difficulty_level == difficulty)
            count_query = count_query.where(MCQQuestion.difficulty_level == difficulty)
        
        if language:
            query = query.where(MCQQuestion.language == language)
            count_query = count_query.where(MCQQuestion.language == language)
        
        if search:
            search_filter = MCQQuestion.question_text.ilike(f"%{search}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)
        
        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Get paginated results
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        mcqs = result.scalars().all()
        
        return list(mcqs), total
    
    async def get_unified_question_for_mcq(self, mcq_id: uuid.UUID) -> Optional[UnifiedQuestion]:
        """Get unified question entry for an MCQ."""
        result = await self.db.execute(
            select(UnifiedQuestion).where(
                UnifiedQuestion.source_id == mcq_id,
                UnifiedQuestion.type == QuestionTypeEnum.MCQ
            )
        )
        return result.scalar_one_or_none()
