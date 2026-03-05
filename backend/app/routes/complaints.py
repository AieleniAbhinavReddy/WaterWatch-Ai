import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Complaint
from app.schemas import ComplaintCreate, ComplaintOut, ComplaintStatusUpdate

logger = logging.getLogger("waterwatchai.complaints")
router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post("/create", response_model=ComplaintOut, status_code=201)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    try:
        complaint = Complaint(**payload.model_dump())
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        logger.info(f"Complaint created: {complaint.id}")
        return complaint
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create complaint: {e}")
        raise HTTPException(status_code=500, detail="Failed to create complaint.")


@router.get("", response_model=List[ComplaintOut])
def get_complaints(q: str = None, limit: int = None, db: Session = Depends(get_db)):
    try:
        query = db.query(Complaint)
        if q:
            pattern = f"%{q}%"
            query = query.filter(
                Complaint.title.ilike(pattern) | Complaint.description.ilike(pattern)
            )
        query = query.order_by(Complaint.created_at.desc())
        if limit and limit > 0:
            query = query.limit(limit)
        return query.all()
    except Exception as e:
        logger.error(f"Failed to fetch complaints: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve complaints.")


@router.put("/{complaint_id}/status", response_model=ComplaintOut)
def update_complaint_status(
    complaint_id: str,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
):
    """Update the status of a complaint (Pending / In Progress / Resolved)."""
    try:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found.")
        valid = ["Pending", "In Progress", "Resolved"]
        if payload.status not in valid:
            raise HTTPException(status_code=400, detail=f"Status must be one of: {valid}")
        complaint.status = payload.status
        db.commit()
        db.refresh(complaint)
        logger.info(f"Complaint {complaint_id} status → {payload.status}")
        return complaint
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update complaint status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status.")
