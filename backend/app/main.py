import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base
from app.routes import complaints, prediction, analytics, hygiene

logger = logging.getLogger("aquavision")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup, dispose engine on shutdown."""
    logger.info("Creating database tables …")
    Base.metadata.create_all(bind=engine)
    logger.info("AquaVision API ready.")
    yield
    engine.dispose()
    logger.info("Database engine disposed.")


app = FastAPI(
    title="AquaVision API",
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
app.include_router(complaints.router)
app.include_router(prediction.router)
app.include_router(analytics.router)
app.include_router(hygiene.router)


@app.get("/")
def root():
    return {"message": "AquaVision API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
