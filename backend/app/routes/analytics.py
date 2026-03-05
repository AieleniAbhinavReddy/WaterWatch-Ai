import logging
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer

from app.database import get_db
from app.models import Complaint, Prediction, WaterData
from app.schemas import AnalyticsSummary, AnalyticsDetail, ComplaintsByMonth, TrendData, IssueTypeCount, WaterDataMonthly

logger = logging.getLogger("waterwatchai.analytics")
router = APIRouter(prefix="/analytics", tags=["Analytics"])

MONTH_NAMES = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    try:
        total_complaints = db.query(func.count(Complaint.id)).scalar() or 0
        high_risk_areas = (
            db.query(func.count(Prediction.id))
            .filter(Prediction.risk_level == "High")
            .scalar()
            or 0
        )

        avg_rainfall = db.query(func.avg(WaterData.rainfall)).scalar() or 0.0
        avg_water_usage = db.query(func.avg(WaterData.water_usage)).scalar() or 0.0
        avg_complaint_count = db.query(func.avg(WaterData.complaint_count)).scalar() or 0.0

        return AnalyticsSummary(
            total_complaints=total_complaints,
            high_risk_areas=high_risk_areas,
            avg_rainfall=round(float(avg_rainfall), 2),
            avg_water_usage=round(float(avg_water_usage), 2),
            avg_complaint_count=round(float(avg_complaint_count), 2),
        )
    except Exception as e:
        logger.error(f"Analytics summary failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate analytics.")


@router.get("/detail", response_model=AnalyticsDetail)
def get_detail(db: Session = Depends(get_db)):
    """Extended analytics with per-month complaint breakdown."""
    try:
        total_complaints = db.query(func.count(Complaint.id)).scalar() or 0
        high_risk_areas = (
            db.query(func.count(Prediction.id))
            .filter(Prediction.risk_level == "High")
            .scalar()
            or 0
        )
        avg_rainfall = db.query(func.avg(WaterData.rainfall)).scalar() or 0.0
        avg_water_usage = db.query(func.avg(WaterData.water_usage)).scalar() or 0.0
        avg_complaint_count = db.query(func.avg(WaterData.complaint_count)).scalar() or 0.0

        # Complaints grouped by month (strftime works for SQLite & PG via SA)
        rows = (
            db.query(
                func.cast(func.strftime("%m", Complaint.created_at), Integer).label("m"),
                func.count(Complaint.id).label("cnt"),
            )
            .group_by("m")
            .order_by("m")
            .all()
        )
        month_map = {int(r.m): r.cnt for r in rows if r.m}
        complaints_by_month = [
            ComplaintsByMonth(month=MONTH_NAMES[i], count=month_map.get(i, 0))
            for i in range(1, 13)
        ]

        return AnalyticsDetail(
            total_complaints=total_complaints,
            high_risk_areas=high_risk_areas,
            avg_rainfall=round(float(avg_rainfall), 2),
            avg_water_usage=round(float(avg_water_usage), 2),
            avg_complaint_count=round(float(avg_complaint_count), 2),
            complaints_by_month=complaints_by_month,
        )
    except Exception as e:
        logger.error(f"Analytics detail failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate detailed analytics.")


@router.get("/trends", response_model=TrendData)
def get_trends(db: Session = Depends(get_db)):
    """Complaint trends: by month and by issue type."""
    try:
        total = db.query(func.count(Complaint.id)).scalar() or 0
        resolved = (
            db.query(func.count(Complaint.id))
            .filter(Complaint.status == "Resolved")
            .scalar() or 0
        )
        pending = (
            db.query(func.count(Complaint.id))
            .filter(Complaint.status == "Pending")
            .scalar() or 0
        )

        # By month
        month_rows = (
            db.query(
                func.cast(func.strftime("%m", Complaint.created_at), Integer).label("m"),
                func.count(Complaint.id).label("cnt"),
            )
            .group_by("m")
            .order_by("m")
            .all()
        )
        month_map = {int(r.m): r.cnt for r in month_rows if r.m}
        complaints_by_month = [
            ComplaintsByMonth(month=MONTH_NAMES[i], count=month_map.get(i, 0))
            for i in range(1, 13)
        ]

        # By issue type
        type_rows = (
            db.query(
                Complaint.issue_type,
                func.count(Complaint.id).label("cnt"),
            )
            .group_by(Complaint.issue_type)
            .all()
        )
        issues_by_type = [
            IssueTypeCount(issue_type=r.issue_type or "Other", count=r.cnt)
            for r in type_rows
        ]

        return TrendData(
            complaints_by_month=complaints_by_month,
            issues_by_type=issues_by_type,
            total_complaints=total,
            resolved_count=resolved,
            pending_count=pending,
        )
    except Exception as e:
        logger.error(f"Analytics trends failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate trend analytics.")


@router.get("/water-data", response_model=list[WaterDataMonthly])
def get_water_data_monthly(db: Session = Depends(get_db)):
    """Aggregate water_data by month – returns avg water_usage and avg rainfall per month."""
    try:
        rows = (
            db.query(
                WaterData.month.label("m"),
                func.avg(WaterData.water_usage).label("avg_usage"),
                func.avg(WaterData.rainfall).label("avg_rain"),
            )
            .group_by(WaterData.month)
            .order_by(WaterData.month)
            .all()
        )
        month_map = {r.m: (float(r.avg_usage), float(r.avg_rain)) for r in rows}
        return [
            WaterDataMonthly(
                month=MONTH_NAMES[i],
                water_usage=round(month_map.get(i, (0, 0))[0], 2),
                rainfall=round(month_map.get(i, (0, 0))[1], 2),
            )
            for i in range(1, 13)
        ]
    except Exception as e:
        logger.error(f"Water data monthly failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch water data.")
