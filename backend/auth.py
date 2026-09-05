"""Security helpers: password hashing, JWT handling and demo-user seeding.

The demo user is hardcoded for the MVP. In production, replace `seed_demo_user`
with a real registration flow and rotate SECRET_KEY per environment.
"""

import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models import User

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret-change-me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------------------------
# Hardcoded demo credentials (MVP only)
# ---------------------------------------------------------------------------
DEMO_EMAIL = "demo@emailsaas.com"
DEMO_PASSWORD = "Demo@1234"


def hash_password(password: str) -> str:
    """Return a bcrypt hash of *password*."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT whose `sub` claim is the user's email."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """Return the token subject, or None when the token is invalid/expired."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


def seed_demo_user(db: Session) -> User:
    """Create the hardcoded demo user (bcrypt-hashed) if it doesn't exist."""
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if user is None:
        user = User(
            email=DEMO_EMAIL,
            full_name="Demo Marketer",
            hashed_password=hash_password(DEMO_PASSWORD),
            plan="growth",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
