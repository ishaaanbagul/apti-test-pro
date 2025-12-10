from fastapi import APIRouter

from app.api.v1.endpoints import tests, questions

api_router = APIRouter()

api_router.include_router(tests.router, prefix="/tests", tags=["Tests"])
api_router.include_router(questions.router, prefix="/questions", tags=["Questions"])
