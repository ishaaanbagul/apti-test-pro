import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models import Test, TestQuestion, UnifiedQuestion, MCQQuestion, QuestionTypeEnum, TestStatusEnum
from app.schemas.test_schemas import (
    TestCreate, TestUpdate, TestResponse, TestWithQuestionsResponse,
    AddQuestionsRequest, NewMCQInTest, NewCodingInTest, QuestionAttachment
)
from app.services.mcq_service import MCQService
from app.services.coding_service import CodingService


class TestService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.mcq_service = MCQService(db)
    
    async def create_test(self, data: TestCreate) -> TestWithQuestionsResponse:
        """Create a test with optional questions (MCQ + Coding) in a transaction."""
        async with self.db.begin():
            # Create test
            test = Test(
                test_name=data.test_name,
                duration_minutes=data.duration_minutes,
                created_by=data.created_by,
                status=TestStatusEnum(data.status.value),
            )
            self.db.add(test)
            await self.db.flush()
            
            order_idx = 0
            
            # Add existing questions
            for q in data.existing_questions:
                await self._add_question_to_test(
                    test.test_id, q.question_id, q.question_type, 
                    q.order_index if q.order_index is not None else order_idx
                )
                order_idx += 1
            
            # Create and add new MCQs
            for mcq_data in data.new_mcqs:
                unified_q = await self._create_mcq_and_unified(mcq_data)
                await self._add_question_to_test(
                    test.test_id, unified_q.question_id, QuestionTypeEnum.MCQ,
                    mcq_data.order_index if mcq_data.order_index is not None else order_idx
                )
                order_idx += 1
            
            # Create and add new coding questions
            coding_service = CodingService()
            for coding_data in data.new_coding_questions:
                unified_q = await self._create_coding_and_unified(coding_data, coding_service)
                await self._add_question_to_test(
                    test.test_id, unified_q.question_id, QuestionTypeEnum.CODING,
                    coding_data.order_index if coding_data.order_index is not None else order_idx
                )
                order_idx += 1
            
            await self.db.commit()
        
        return await self.get_test_with_questions(test.test_id)
    
    async def _create_mcq_and_unified(self, data: NewMCQInTest) -> UnifiedQuestion:
        """Create MCQ and its unified_question entry."""
        mcq = MCQQuestion(
            question_text=data.question_text,
            option_a=data.option_a,
            option_b=data.option_b,
            option_c=data.option_c,
            option_d=data.option_d,
            correct_answer=data.correct_answer,
            difficulty_level=data.difficulty_level,
            language=data.language,
        )
        self.db.add(mcq)
        await self.db.flush()
        
        unified = UnifiedQuestion(
            source_id=mcq.mcq_id,
            question_text=data.question_text,
            difficulty_level=data.difficulty_level,
            language=data.language,
            type=QuestionTypeEnum.MCQ,
        )
        self.db.add(unified)
        await self.db.flush()
        return unified
    
    async def _create_coding_and_unified(self, data: NewCodingInTest, coding_service: CodingService) -> UnifiedQuestion:
        """Create coding question in MongoDB and unified_question in Postgres."""
        # Insert into MongoDB
        coding_doc = await coding_service.create_coding_question({
            "title": data.title,
            "description": data.description,
            "difficulty": data.difficulty,
            "labels": data.labels,
            "sample_input": data.sample_input,
            "sample_output": data.sample_output,
            "constraints": data.constraints,
        })
        
        # Use MongoDB's int id converted to UUID format (store as string-based UUID)
        mongo_id_as_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, str(coding_doc["id"]))
        
        unified = UnifiedQuestion(
            source_id=mongo_id_as_uuid,
            question_text=data.title,  # Use title as question_text
            difficulty_level=data.difficulty,
            language=None,
            type=QuestionTypeEnum.CODING,
        )
        self.db.add(unified)
        await self.db.flush()
        return unified
    
    async def _add_question_to_test(
        self, test_id: uuid.UUID, question_id: uuid.UUID, 
        question_type: QuestionTypeEnum, order_index: int
    ):
        """Add a question to test_questions table."""
        test_q = TestQuestion(
            test_id=test_id,
            question_id=question_id,
            question_type=question_type,
            order_index=order_index,
        )
        self.db.add(test_q)
        await self.db.flush()
    
    async def add_questions_to_test(self, test_id: uuid.UUID, data: AddQuestionsRequest) -> TestWithQuestionsResponse:
        """Add questions to an existing test."""
        # Get current max order_index
        result = await self.db.execute(
            select(func.max(TestQuestion.order_index)).where(TestQuestion.test_id == test_id)
        )
        max_order = result.scalar() or -1
        order_idx = max_order + 1
        
        async with self.db.begin():
            # Add existing questions
            for q in data.existing_questions:
                await self._add_question_to_test(
                    test_id, q.question_id, q.question_type,
                    q.order_index if q.order_index is not None else order_idx
                )
                order_idx += 1
            
            # Create and add new MCQs
            for mcq_data in data.new_mcqs:
                unified_q = await self._create_mcq_and_unified(mcq_data)
                await self._add_question_to_test(
                    test_id, unified_q.question_id, QuestionTypeEnum.MCQ,
                    mcq_data.order_index if mcq_data.order_index is not None else order_idx
                )
                order_idx += 1
            
            # Create and add new coding questions
            coding_service = CodingService()
            for coding_data in data.new_coding_questions:
                unified_q = await self._create_coding_and_unified(coding_data, coding_service)
                await self._add_question_to_test(
                    test_id, unified_q.question_id, QuestionTypeEnum.CODING,
                    coding_data.order_index if coding_data.order_index is not None else order_idx
                )
                order_idx += 1
            
            await self.db.commit()
        
        return await self.get_test_with_questions(test_id)
    
    async def get_test(self, test_id: uuid.UUID) -> Optional[Test]:
        """Get test by ID."""
        result = await self.db.execute(
            select(Test).where(Test.test_id == test_id)
        )
        return result.scalar_one_or_none()
    
    async def get_test_with_questions(self, test_id: uuid.UUID) -> Optional[TestWithQuestionsResponse]:
        """Get test with all questions and their details."""
        result = await self.db.execute(
            select(Test)
            .options(selectinload(Test.test_questions).selectinload(TestQuestion.unified_question))
            .where(Test.test_id == test_id)
        )
        test = result.scalar_one_or_none()
        if not test:
            return None
        
        # Build response
        questions = []
        mcq_ids = []
        coding_source_ids = []
        
        for tq in sorted(test.test_questions, key=lambda x: x.order_index):
            q_data = {
                "id": tq.id,
                "question_id": tq.question_id,
                "question_type": tq.question_type.value,
                "order_index": tq.order_index,
                "question_text": tq.unified_question.question_text if tq.unified_question else None,
                "difficulty_level": tq.unified_question.difficulty_level if tq.unified_question else None,
            }
            questions.append(q_data)
            
            if tq.unified_question:
                if tq.question_type == QuestionTypeEnum.MCQ:
                    mcq_ids.append(tq.unified_question.source_id)
                else:
                    coding_source_ids.append(tq.unified_question.source_id)
        
        # Fetch MCQ details
        mcq_details = []
        if mcq_ids:
            mcq_result = await self.db.execute(
                select(MCQQuestion).where(MCQQuestion.mcq_id.in_(mcq_ids))
            )
            for mcq in mcq_result.scalars():
                mcq_details.append({
                    "mcq_id": str(mcq.mcq_id),
                    "question_text": mcq.question_text,
                    "option_a": mcq.option_a,
                    "option_b": mcq.option_b,
                    "option_c": mcq.option_c,
                    "option_d": mcq.option_d,
                    "correct_answer": mcq.correct_answer,
                    "difficulty_level": mcq.difficulty_level,
                    "language": mcq.language,
                })
        
        # Fetch coding details from MongoDB
        coding_details = []
        if coding_source_ids:
            coding_service = CodingService()
            for source_id in coding_source_ids:
                # Reverse UUID5 to get original MongoDB id
                # For simplicity, we'll fetch all and filter
                # In production, store MongoDB id separately
                pass  # Coding details would need MongoDB lookup
        
        return TestWithQuestionsResponse(
            test_id=test.test_id,
            test_name=test.test_name,
            created_by=test.created_by,
            duration_minutes=test.duration_minutes,
            status=test.status.value,
            created_at=test.created_at,
            questions=questions,
            mcq_details=mcq_details,
            coding_details=coding_details,
        )
    
    async def update_test(self, test_id: uuid.UUID, data: TestUpdate) -> Optional[Test]:
        """Update test basic info."""
        test = await self.get_test(test_id)
        if not test:
            return None
        
        if data.test_name is not None:
            test.test_name = data.test_name
        if data.duration_minutes is not None:
            test.duration_minutes = data.duration_minutes
        if data.status is not None:
            test.status = TestStatusEnum(data.status.value)
        
        await self.db.commit()
        await self.db.refresh(test)
        return test
    
    async def delete_test(self, test_id: uuid.UUID) -> bool:
        """Delete test (cascades to test_questions)."""
        test = await self.get_test(test_id)
        if not test:
            return False
        
        await self.db.delete(test)
        await self.db.commit()
        return True
    
    async def list_tests(
        self, page: int = 1, page_size: int = 20, 
        status: Optional[TestStatusEnum] = None,
        created_by: Optional[uuid.UUID] = None
    ) -> tuple[List[Test], int]:
        """List tests with pagination and filters."""
        query = select(Test)
        count_query = select(func.count(Test.test_id))
        
        if status:
            query = query.where(Test.status == status)
            count_query = count_query.where(Test.status == status)
        
        if created_by:
            query = query.where(Test.created_by == created_by)
            count_query = count_query.where(Test.created_by == created_by)
        
        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Get paginated results
        query = query.order_by(Test.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        tests = result.scalars().all()
        
        return list(tests), total
    
    async def remove_question_from_test(self, test_id: uuid.UUID, question_id: uuid.UUID) -> bool:
        """Remove a question from a test."""
        result = await self.db.execute(
            select(TestQuestion).where(
                TestQuestion.test_id == test_id,
                TestQuestion.question_id == question_id
            )
        )
        test_q = result.scalar_one_or_none()
        if not test_q:
            return False
        
        await self.db.delete(test_q)
        await self.db.commit()
        return True
