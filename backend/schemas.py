"""Pydantic schemas for request/response payloads."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    """Credentials posted to /api/auth/login as JSON."""

    email: str
    password: str


class TokenResponse(BaseModel):
    """JWT returned after a successful login."""

    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    """Public representation of a user — never exposes the password hash."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    plan: str
    is_active: bool
    created_at: datetime
