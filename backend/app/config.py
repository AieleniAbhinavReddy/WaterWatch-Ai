import os
from dotenv import load_dotenv

# Resolve paths: __file__ → backend/app/config.py
# Two levels up lands at the project root (AquaVision/)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

# Default to local SQLite; set DATABASE_URL env var for PostgreSQL/Supabase
DB_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DB_DIR, exist_ok=True)
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(DB_DIR, 'aquavision.db')}",
)
