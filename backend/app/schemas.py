from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# -----------  Complaints  -----------

ISSUE_TYPES = [
    "Water Contamination",
    "Water Shortage",
    "Pipeline Leakage",
    "Sanitation Failure",
    "Sewage Overflow",
    "Other",
]


class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Title of the complaint")
    description: Optional[str] = Field(None, max_length=2000)
    issue_type: str = Field("Other", description="Type of issue")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


class ComplaintOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    issue_type: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintStatusUpdate(BaseModel):
    status: str = Field(..., description="New status: Pending, In Progress, Resolved")


# -----------  Prediction  -----------

class PredictionInput(BaseModel):
    rainfall: float = Field(..., ge=0, description="Rainfall in mm")
    population: int = Field(..., gt=0, description="Population count")
    water_usage: float = Field(..., ge=0, description="Water usage in litres")
    complaint_count: int = Field(..., ge=0, description="Number of complaints")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")


class PredictionResult(BaseModel):
    risk_score: float
    risk_level: str


# -----------  Analytics  -----------

class AnalyticsSummary(BaseModel):
    total_complaints: int
    high_risk_areas: int
    avg_rainfall: float
    avg_water_usage: float
    avg_complaint_count: float


class ComplaintsByMonth(BaseModel):
    month: str
    count: int


class AnalyticsDetail(BaseModel):
    total_complaints: int
    high_risk_areas: int
    avg_rainfall: float
    avg_water_usage: float
    avg_complaint_count: float
    complaints_by_month: List[ComplaintsByMonth]


# -----------  Trends  -----------

class IssueTypeCount(BaseModel):
    issue_type: str
    count: int


class TrendData(BaseModel):
    complaints_by_month: List[ComplaintsByMonth]
    issues_by_type: List[IssueTypeCount]
    total_complaints: int
    resolved_count: int
    pending_count: int


# -----------  Hygiene  -----------

class HygieneTipOut(BaseModel):
    id: int
    category: str
    title: str
    content: str
    icon: str

    class Config:
        from_attributes = True
