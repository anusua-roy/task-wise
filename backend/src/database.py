import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# ----------------------------------------------------------------------
# 1. Configuration
# ----------------------------------------------------------------------
# The connection URL should be read from environment variables for security 
# and deployment flexibility (e.g., set in Docker Compose or Azure App Service).
# Example format: postgresql://user:password@host:port/dbname
DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/task_tracker_db"
)

# ----------------------------------------------------------------------
# 2. Database Engine and Session
# ----------------------------------------------------------------------

# The engine handles the database connection pool
engine = create_engine(
    DATABASE_URL,
    # Use 'pool_pre_ping' to ensure connections are alive
    pool_pre_ping=True
)

# SessionLocal is a factory for creating individual database sessions.
# The autocommit/autoflush settings are ideal for FastAPI dependencies.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class used for defining models
Base = declarative_base()


# ----------------------------------------------------------------------
# 3. Dependency Function for FastAPI
# ----------------------------------------------------------------------

def get_db():
    """
    Dependency function that provides a database session to FastAPI route handlers.
    It ensures the session is always closed, even if errors occur.

    Usage in a route: Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        # Crucial step: close the session after the request is finished
        db.close()