from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# -----------  Authentication  -----------

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    username: str
    email: str
    role: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


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


# -----------  Water Data Monthly  -----------

class WaterDataMonthly(BaseModel):
    month: str
    water_usage: float
    rainfall: float


# -----------  Water Conservation AI  -----------

class ConservationInput(BaseModel):
    area_name: str = Field(..., min_length=1, max_length=100)
    rainfall: float = Field(..., ge=0)
    population: int = Field(..., gt=0)
    water_usage: float = Field(..., ge=0)
    month: int = Field(..., ge=1, le=12)


class ConservationRecommendation(BaseModel):
    area_name: str
    water_efficiency_score: float
    risk_category: str
    recommendations: List[str]
    potential_savings_pct: float
    priority: str


# -----------  Water Quality  -----------

class WaterQualityInput(BaseModel):
    ph: float = Field(..., ge=0, le=14, description="pH level")
    turbidity: float = Field(..., ge=0, description="Turbidity (NTU)")
    dissolved_oxygen: float = Field(..., ge=0, description="Dissolved Oxygen (mg/L)")
    conductivity: float = Field(..., ge=0, description="Conductivity (µS/cm)")
    temperature: float = Field(..., description="Water Temperature (°C)")
    total_dissolved_solids: float = Field(..., ge=0, description="TDS (mg/L)")


class WaterQualityResult(BaseModel):
    overall_quality: str
    quality_score: float
    parameters: dict
    risks: List[str]
    recommendations: List[str]
