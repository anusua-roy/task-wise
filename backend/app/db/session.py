from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    future=True,
    pool_pre_ping=True,  # prevents stale connections (important for cloud DB)
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
