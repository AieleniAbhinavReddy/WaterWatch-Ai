"""Water Quality Risk Prediction endpoint."""

import logging

from fastapi import APIRouter, HTTPException
from app.schemas import WaterQualityInput, WaterQualityResult

logger = logging.getLogger("waterwatchai.water_quality")
router = APIRouter(prefix="/water-quality", tags=["Water Quality"])

# WHO / IS 10500 guideline ranges
QUALITY_STANDARDS = {
    "ph": {"min": 6.5, "max": 8.5, "ideal_min": 7.0, "ideal_max": 7.5, "unit": "pH", "weight": 20},
    "turbidity": {"max": 5.0, "ideal_max": 1.0, "unit": "NTU", "weight": 15},
    "dissolved_oxygen": {"min": 5.0, "ideal_min": 7.0, "unit": "mg/L", "weight": 20},
    "conductivity": {"max": 1000, "ideal_max": 500, "unit": "µS/cm", "weight": 15},
    "temperature": {"min": 5, "max": 35, "ideal_min": 15, "ideal_max": 25, "unit": "°C", "weight": 10},
    "total_dissolved_solids": {"max": 500, "ideal_max": 300, "unit": "mg/L", "weight": 20},
}


def _score_parameter(name: str, value: float) -> dict:
    """Score a single parameter 0-100 and return analysis."""
    std = QUALITY_STANDARDS[name]
    score = 100.0
    status = "Good"
    concern = None

    if name == "ph":
        if std["ideal_min"] <= value <= std["ideal_max"]:
            score = 100
        elif std["min"] <= value <= std["max"]:
            dist = min(abs(value - std["ideal_min"]), abs(value - std["ideal_max"]))
            score = max(60, 100 - dist * 20)
        else:
            score = max(0, 30 - abs(value - 7.0) * 5)
            concern = f"pH {value} is outside safe range ({std['min']}-{std['max']})"
    elif name == "dissolved_oxygen":
        if value >= std["ideal_min"]:
            score = 100
        elif value >= std["min"]:
            score = 60 + (value - std["min"]) / (std["ideal_min"] - std["min"]) * 40
        else:
            score = max(0, value / std["min"] * 60)
            concern = f"Dissolved oxygen {value} mg/L is below minimum ({std['min']} mg/L)"
    elif name in ("turbidity", "conductivity", "total_dissolved_solids"):
        ideal_max = std["ideal_max"]
        hard_max = std["max"]
        if value <= ideal_max:
            score = 100
        elif value <= hard_max:
            score = 60 + (hard_max - value) / (hard_max - ideal_max) * 40
        else:
            score = max(0, 60 - (value - hard_max) / hard_max * 60)
            concern = f"{name.replace('_', ' ').title()} {value} {std['unit']} exceeds limit ({hard_max} {std['unit']})"
    elif name == "temperature":
        if std["ideal_min"] <= value <= std["ideal_max"]:
            score = 100
        elif std["min"] <= value <= std["max"]:
            score = 70
        else:
            score = 30
            concern = f"Temperature {value}°C is outside acceptable range"

    if score >= 80:
        status = "Good"
    elif score >= 50:
        status = "Acceptable"
    else:
        status = "Poor"

    return {
        "value": value,
        "unit": std["unit"],
        "score": round(score, 1),
        "status": status,
        "concern": concern,
    }


@router.post("/analyze", response_model=WaterQualityResult)
def analyze_water_quality(payload: WaterQualityInput):
    """Analyze water quality parameters and predict risk level."""
    try:
        params = {}
        weighted_score = 0
        total_weight = 0
        risks = []
        recommendations = []

        for field_name in QUALITY_STANDARDS:
            value = getattr(payload, field_name)
            result = _score_parameter(field_name, value)
            weight = QUALITY_STANDARDS[field_name]["weight"]
            weighted_score += result["score"] * weight
            total_weight += weight
            params[field_name] = result

            if result["concern"]:
                risks.append(result["concern"])

        quality_score = round(weighted_score / total_weight, 1) if total_weight > 0 else 0

        # Overall quality label
        if quality_score >= 80:
            overall = "Excellent"
        elif quality_score >= 60:
            overall = "Good"
        elif quality_score >= 40:
            overall = "Fair"
        elif quality_score >= 20:
            overall = "Poor"
        else:
            overall = "Hazardous"

        # Generate specific recommendations
        if params["ph"]["score"] < 70:
            if payload.ph < 6.5:
                recommendations.append("Water is acidic — consider lime dosing or alkaline filtration to raise pH")
            else:
                recommendations.append("Water is alkaline — carbon dioxide injection or acid dosing may help")

        if params["turbidity"]["score"] < 70:
            recommendations.append("High turbidity detected — install sediment filters or improve coagulation/flocculation")

        if params["dissolved_oxygen"]["score"] < 70:
            recommendations.append("Low dissolved oxygen — install aerators or cascade systems to improve oxygenation")

        if params["conductivity"]["score"] < 70:
            recommendations.append("High conductivity indicates mineral contamination — consider reverse-osmosis treatment")

        if params["total_dissolved_solids"]["score"] < 70:
            recommendations.append("Elevated TDS — install multi-stage water purification (RO/UV) before distribution")

        if params["temperature"]["score"] < 70:
            recommendations.append("Temperature outside optimal range — investigate thermal pollution sources")

        if not recommendations:
            recommendations.append("All parameters within safe limits — continue regular monitoring schedule")

        if quality_score < 60:
            recommendations.append("Schedule immediate water sampling and laboratory testing for pathogens")
            recommendations.append("Issue public advisory to boil water before consumption until quality is restored")

        return WaterQualityResult(
            overall_quality=overall,
            quality_score=quality_score,
            parameters=params,
            risks=risks,
            recommendations=recommendations,
        )
    except Exception as e:
        logger.error(f"Water quality analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Water quality analysis failed.")
