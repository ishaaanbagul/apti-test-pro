# Talentshire - Create Test Backend

FastAPI backend for the Create Test module using PostgreSQL and MongoDB.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/talentshire
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=talentshire
SECRET_KEY=your-secret-key
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
