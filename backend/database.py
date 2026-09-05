"""Database engine, session factory and declarative base.

Reads DATABASE_URL from the environment (see `.env.example`) and exposes a
`get_db` dependency that FastAPI routes use to obtain a scoped session.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# SQLite connections may only be used by the thread that created them unless
# we opt out of that check — required for FastAPI's threaded request handling.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base shared by every ORM model."""


def get_db():
    """FastAPI dependency: yield a database session and always close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
