# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not configured in environment")

# SQLAlchemy engine (sync)
engine = create_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Session factory
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)

# Base model for ORM
Base = declarative_base()

def create_db_and_tables():
    Base.metadata.create_all(bind=engine)
