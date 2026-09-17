import os
from typing import Optional, Any, Dict, List
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import MongoClient
from loguru import logger
from app.core.config import settings

class MongoDBManager:
    """Async & Sync MongoDB Connection Manager for DocuTrace."""
    
    _async_client: Optional[AsyncIOMotorClient] = None
    _async_db: Optional[AsyncIOMotorDatabase] = None
    _sync_client: Optional[MongoClient] = None
    _sync_db = None

    @classmethod
    def get_database_name(cls) -> str:
        """Extract or default database name from MONGODB_URI."""
        uri = settings.MONGODB_URI or ""
        if "/" in uri.split("?")[0]:
            path_part = uri.split("?")[0].split("/")[-1]
            if path_part and not path_part.startswith("@"):
                return path_part
        return "docutrace"

    @classmethod
    def get_async_db(cls) -> Optional[AsyncIOMotorDatabase]:
        """Get or initialize the Async Motor Database connection."""
        if not settings.MONGODB_URI:
            logger.warning("MONGODB_URI is not set in configuration.")
            return None

        if cls._async_client is None:
            try:
                cls._async_client = AsyncIOMotorClient(
                    settings.MONGODB_URI,
                    serverSelectionTimeoutMS=5000,
                )
                db_name = cls.get_database_name()
                cls._async_db = cls._async_client[db_name]
                logger.info(f"Initialized Async Motor MongoDB connection for database: '{db_name}'")
            except Exception as e:
                logger.error(f"Failed to initialize Async Motor MongoDB: {e}")
                return None
                
        return cls._async_db

    @classmethod
    def get_sync_db(cls):
        """Get or initialize synchronous PyMongo Database connection."""
        if not settings.MONGODB_URI:
            return None

        if cls._sync_client is None:
            try:
                cls._sync_client = MongoClient(
                    settings.MONGODB_URI,
                    serverSelectionTimeoutMS=5000,
                )
                db_name = cls.get_database_name()
                cls._sync_db = cls._sync_client[db_name]
                logger.info(f"Initialized Sync PyMongo connection for database: '{db_name}'")
            except Exception as e:
                logger.error(f"Failed to initialize Sync PyMongo: {e}")
                return None

        return cls._sync_db

    @classmethod
    async def close_connections(cls):
        """Close client connections on shutdown."""
        if cls._async_client:
            cls._async_client.close()
            cls._async_client = None
            cls._async_db = None
            logger.info("Closed Async Motor MongoDB connection.")
        if cls._sync_client:
            cls._sync_client.close()
            cls._sync_client = None
            cls._sync_db = None
            logger.info("Closed Sync PyMongo connection.")

# Dependency for FastAPI endpoints
async def get_mongo_database() -> Optional[AsyncIOMotorDatabase]:
    return MongoDBManager.get_async_db()
