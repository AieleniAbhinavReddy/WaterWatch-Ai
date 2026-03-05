import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import HygieneContent
from app.schemas import HygieneTipOut

logger = logging.getLogger("waterwatchai.hygiene")
router = APIRouter(prefix="/hygiene", tags=["Hygiene"])

# Default tips seeded on first request if table is empty
_DEFAULT_TIPS = [
    # Water Safety
    {
        "category": "water_safety",
        "title": "Boil Water Before Drinking",
        "content": "Always boil water for at least 1 minute (3 minutes at high altitude) to kill harmful bacteria, viruses, and parasites. This is the most reliable method to make water safe when you're unsure of its quality.",
        "icon": "flame",
        "order": 1,
    },
    {
        "category": "water_safety",
        "title": "Store Water Safely",
        "content": "Store drinking water in clean, food-grade containers with tight-fitting lids. Keep containers off the ground and away from chemicals. Replace stored water every 24 hours if untreated.",
        "icon": "container",
        "order": 2,
    },
    {
        "category": "water_safety",
        "title": "Use Water Purification Tablets",
        "content": "When boiling is not possible, use water purification tablets containing chlorine or iodine. Follow the package instructions for dosage and wait time before drinking.",
        "icon": "pill",
        "order": 3,
    },
    {
        "category": "water_safety",
        "title": "Test Your Water Regularly",
        "content": "Have your water source tested at least once a year for bacteria, nitrates, and other contaminants. Contact your local water authority for testing kits or services.",
        "icon": "test-tube",
        "order": 4,
    },
    # Sanitation
    {
        "category": "sanitation",
        "title": "Maintain Proper Sewage Systems",
        "content": "Ensure septic tanks are inspected every 3 years and pumped every 3-5 years. Never discharge untreated sewage into water bodies. Report sewage leaks immediately to local authorities.",
        "icon": "wrench",
        "order": 5,
    },
    {
        "category": "sanitation",
        "title": "Practice Safe Waste Disposal",
        "content": "Separate wet and dry waste. Never dump garbage near water sources. Use designated waste collection points and support community clean-up drives.",
        "icon": "trash",
        "order": 6,
    },
    {
        "category": "sanitation",
        "title": "Build & Maintain Latrines",
        "content": "Construct latrines at least 30 meters away from water sources. Keep them clean, well-ventilated, and with proper covers. Open defecation contaminates water and spreads disease.",
        "icon": "building",
        "order": 7,
    },
    # Hygiene
    {
        "category": "hygiene",
        "title": "Wash Hands Frequently",
        "content": "Wash hands with soap and water for at least 20 seconds — before eating, after using the toilet, and after touching public surfaces. Hand hygiene prevents 30-50% of diarrheal diseases.",
        "icon": "hand",
        "order": 8,
    },
    {
        "category": "hygiene",
        "title": "Keep Food Preparation Areas Clean",
        "content": "Wash all fruits and vegetables with safe water before eating. Clean cooking utensils and surfaces regularly. Separate raw meat from ready-to-eat food to prevent cross-contamination.",
        "icon": "utensils",
        "order": 9,
    },
    {
        "category": "hygiene",
        "title": "Promote Menstrual Hygiene",
        "content": "Use clean menstrual hygiene products and change them regularly. Dispose of used products properly. Access to clean water and private sanitation facilities is essential for menstrual health.",
        "icon": "heart",
        "order": 10,
    },
    {
        "category": "hygiene",
        "title": "Protect Children's Health",
        "content": "Ensure children drink safe water and wash hands before meals. Teach proper toilet use early. Child diarrhea — largely preventable through WASH — remains a leading cause of under-5 mortality.",
        "icon": "baby",
        "order": 11,
    },
    {
        "category": "water_safety",
        "title": "Protect Water Sources",
        "content": "Keep animal pens, latrines, and chemical storage away from wells and streams. Plant vegetation buffers around water sources. Report illegal dumping or contamination immediately.",
        "icon": "shield",
        "order": 12,
    },
]


def _seed_tips(db: Session):
    """Seed default hygiene tips if the table is empty."""
    if db.query(HygieneContent).count() > 0:
        return
    for tip in _DEFAULT_TIPS:
        db.add(HygieneContent(**tip))
    db.commit()
    logger.info(f"Seeded {len(_DEFAULT_TIPS)} hygiene tips.")


@router.get("/tips", response_model=List[HygieneTipOut])
def get_hygiene_tips(category: str = None, db: Session = Depends(get_db)):
    """Return hygiene / water-safety / sanitation tips. Optionally filter by category."""
    try:
        _seed_tips(db)
        query = db.query(HygieneContent).order_by(HygieneContent.order)
        if category:
            query = query.filter(HygieneContent.category == category)
        return query.all()
    except Exception as e:
        logger.error(f"Failed to fetch hygiene tips: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve hygiene content.")
