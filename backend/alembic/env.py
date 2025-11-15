import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# ----------------------------------------------------------------------
# Custom Path and Model Imports (CRITICAL FIX)
# 
# This ensures that the root of the backend project (where 'src' resides)
# is in the path, allowing 'from src.models import Base' to succeed.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.models import Base # Import your Base metadata object

# This object is the target for autogenerate support.
target_metadata = Base.metadata

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    # --- FIX: Only attempt logging configuration if sections are present ---
    import configparser
    cp = configparser.ConfigParser()
    cp.read(config.config_file_name)
    
    # Check if the [formatters] section exists before calling fileConfig
    if 'formatters' in cp:
        fileConfig(config.config_file_name)
# ----------------------------------------------------------------------
# END FIX
# ----------------------------------------------------------------------

# ----------------------------------------------------------------------
# Custom Database URL Configuration
# ----------------------------------------------------------------------

# Use the DATABASE_URL environment variable if set, falling back to alembic.ini if not found.
DB_URL = os.environ.get("DATABASE_URL")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # In offline mode, we still need a URL, which we manually pull from the environment
    url = DB_URL or config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    Dynamically configures the connection string using the environment variable.
    """
    
    # Get configuration dictionary
    config_section = config.get_section(config.config_ini_section, {})
    
    # CRITICAL FIX: Inject the database URL into the configuration dictionary
    if DB_URL:
        config_section["sqlalchemy.url"] = DB_URL

    # FIX: Filter out all non-SQLAlchemy arguments and ensure proper key naming
    sa_config = {}
    for k, v in config_section.items():
        # Keys starting with sqlalchemy. should be cleaned (e.g., sqlalchemy.url -> url)
        if k.startswith('sqlalchemy.'):
            clean_k = k.replace('sqlalchemy.', '')
            # --- FINAL FIX: EXPLICITLY SKIP THE PROBLEMATIC KEY ---
            if clean_k != 'autogenerate':
                sa_config[clean_k] = v
        # Directly include 'url' if it was injected/read
        elif k == 'url':
            sa_config['url'] = v
    
    # Ensure the URL is present in the final dict being passed (double check)
    if 'url' not in sa_config:
        sa_config['url'] = DB_URL 

    connectable = engine_from_config(
        sa_config,
        prefix="", # Prefix is empty since keys were filtered above
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()