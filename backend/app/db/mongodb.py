from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

from app.core.config import settings

client: Optional[AsyncIOMotorClient] = None
database: Optional[AsyncIOMotorDatabase] = None


async def connect_mongodb():
    global client, database
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.MONGODB_DB_NAME]
    # Verify connection
    await client.admin.command("ping")


async def close_mongodb():
    global client
    if client:
        client.close()


def get_mongodb() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("MongoDB not connected")
    return database


def get_coding_questions_collection():
    return get_mongodb()["coding_questions"]
