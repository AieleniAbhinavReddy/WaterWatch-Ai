import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base, SessionLocal
from app.routes import complaints, prediction, analytics, hygiene
from app.routes.auth import router as auth_router
from app.routes.conservation import router as conservation_router
from app.routes.water_quality import router as water_quality_router
from app.models import User
from app.auth import hash_password

logger = logging.getLogger("waterwatchai")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup, seed admin, dispose engine on shutdown."""
    logger.info("Creating database tables …")
    Base.metadata.create_all(bind=engine)

    # Seed admin user if not exists
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@waterwatchai.com",
                password_hash=hash_password("admin123"),
                role="admin",
            )
            db.add(admin)
            db.commit()
            logger.info("Admin user seeded: admin@waterwatchai.com / admin123")
    except Exception as e:
        logger.error(f"Admin seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

    logger.info("WaterWatch AI API ready.")
    yield
    engine.dispose()
    logger.info("Database engine disposed.")


app = FastAPI(
    title="WaterWatch AI API",
    description="AI-Powered Water & Sanitation Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow React dev server & any origin during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


# Register routers
app.include_router(auth_router)
app.include_router(complaints.router)
app.include_router(prediction.router)
app.include_router(analytics.router)
app.include_router(hygiene.router)
app.include_router(conservation_router)
app.include_router(water_quality_router)


@app.get("/")
def root():
    return {"message": "WaterWatch AI API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
