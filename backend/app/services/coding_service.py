from typing import List, Optional, Dict, Any
from app.db.mongodb import get_coding_questions_collection


class CodingService:
    """Service for coding questions stored in MongoDB."""
    
    def __init__(self):
        self.collection = get_coding_questions_collection()
    
    async def create_coding_question(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new coding question in MongoDB."""
        # Get next ID (auto-increment simulation)
        last_doc = await self.collection.find_one(sort=[("id", -1)])
        next_id = (last_doc["id"] + 1) if last_doc and "id" in last_doc else 1
        
        doc = {
            "id": next_id,
            "title": data.get("title", ""),
            "description": data.get("description", ""),
            "difficulty": data.get("difficulty", "medium"),
            "labels": data.get("labels", []),
            "sample_input": data.get("sample_input", ""),
            "sample_output": data.get("sample_output", ""),
            "constraints": data.get("constraints", ""),
        }
        
        await self.collection.insert_one(doc)
        return doc
    
    async def get_coding_question(self, question_id: int) -> Optional[Dict[str, Any]]:
        """Get coding question by ID."""
        doc = await self.collection.find_one({"id": question_id})
        if doc:
            doc.pop("_id", None)  # Remove MongoDB's internal _id
        return doc
    
    async def list_coding_questions(
        self,
        page: int = 1,
        page_size: int = 20,
        difficulty: Optional[str] = None,
        labels: Optional[List[str]] = None,
        search: Optional[str] = None
    ) -> tuple[List[Dict[str, Any]], int]:
        """List coding questions with pagination and filters."""
        query = {}
        
        if difficulty:
            query["difficulty"] = difficulty
        
        if labels:
            query["labels"] = {"$all": labels}
        
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]
        
        # Get total count
        total = await self.collection.count_documents(query)
        
        # Get paginated results
        cursor = self.collection.find(query)
        cursor = cursor.skip((page - 1) * page_size).limit(page_size)
        
        questions = []
        async for doc in cursor:
            doc.pop("_id", None)
            questions.append(doc)
        
        return questions, total
    
    async def update_coding_question(self, question_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update coding question."""
        update_data = {k: v for k, v in data.items() if v is not None}
        if not update_data:
            return await self.get_coding_question(question_id)
        
        result = await self.collection.update_one(
            {"id": question_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return None
        
        return await self.get_coding_question(question_id)
    
    async def delete_coding_question(self, question_id: int) -> bool:
        """Delete coding question."""
        result = await self.collection.delete_one({"id": question_id})
        return result.deleted_count > 0
