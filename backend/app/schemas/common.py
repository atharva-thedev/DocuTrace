from typing import Generic, TypeVar, Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")

class PaginationMeta(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: List[T]
    pagination: PaginationMeta

class ErrorDetail(BaseModel):
    code: str
    message: str
    fields: Optional[Dict[str, List[str]]] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
