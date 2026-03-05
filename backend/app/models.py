import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, DateTime, Text
from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_uuid)
    username = Column(String(100), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    issue_type = Column(String(50), default="Other")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)


class WaterData(Base):
    __tablename__ = "water_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    area_name = Column(String(100), nullable=False)
    rainfall = Column(Float)
    population = Column(Integer)
    water_usage = Column(Float)
    complaint_count = Column(Integer)
    month = Column(Integer)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    area_name = Column(String(100), nullable=False)
    risk_score = Column(Float)
    risk_level = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)


class HygieneContent(Base):
    __tablename__ = "hygiene_content"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(50), nullable=False)  # water_safety, sanitation, hygiene
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    icon = Column(String(50), default="info")
    order = Column(Integer, default=0)
