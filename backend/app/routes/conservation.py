"""Water Conservation Recommendation AI endpoint."""

import logging

from fastapi import APIRouter, HTTPException
from app.schemas import ConservationInput, ConservationRecommendation

logger = logging.getLogger("waterwatchai.conservation")
router = APIRouter(prefix="/conservation", tags=["Water Conservation"])

# Knowledge base for rule-based + ML-style recommendations
CONSERVATION_RULES = {
    "low_rainfall": {
        "threshold": 40,
        "tips": [
            "Implement rainwater harvesting systems to capture available precipitation",
            "Install drip irrigation instead of flood irrigation to reduce wastage by 60%",
            "Establish community water storage tanks for dry-season reserves",
        ],
    },
    "high_usage": {
        "threshold_per_capita": 0.8,  # litres per person (relative)
        "tips": [
            "Deploy smart water meters with real-time usage alerts for households",
            "Introduce tiered water pricing to discourage excessive consumption",
            "Mandate water-efficient fixtures (low-flow taps, dual-flush toilets)",
        ],
    },
    "seasonal": {
        "dry_months": [3, 4, 5, 10, 11],
        "tips": [
            "Pre-position tanker supply routes before peak dry season",
            "Encourage grey-water recycling for non-potable uses (gardening, cleaning)",
            "Schedule maintenance of pipelines before dry season to minimize leakage losses",
        ],
    },
    "general": [
        "Conduct community awareness campaigns on water conservation practices",
        "Plant drought-resistant native vegetation to reduce irrigation demand",
        "Establish leak-detection programs — fix leaks within 24 hours of reporting",
        "Create a water budget for each ward/zone to track and control distribution",
    ],
}


@router.post("/recommend", response_model=ConservationRecommendation)
def get_conservation_recommendations(payload: ConservationInput):
    """AI-powered water conservation recommendations based on area parameters."""
    try:
        recommendations = []
        per_capita_usage = payload.water_usage / payload.population if payload.population > 0 else 0

        # Efficiency score: 0-100 (lower usage per capita + higher rainfall = better)
        rainfall_score = min(payload.rainfall / 100, 1.0) * 40  # max 40 points
        usage_score = max(0, 40 - (per_capita_usage * 50))  # max 40 points
        seasonal_score = 20 if payload.month not in CONSERVATION_RULES["seasonal"]["dry_months"] else 5
        efficiency_score = round(min(rainfall_score + usage_score + seasonal_score, 100), 1)

        # Risk category
        if efficiency_score >= 70:
            risk_cat = "Low Risk"
            priority = "Standard"
            savings_pct = round(5 + (100 - efficiency_score) * 0.3, 1)
        elif efficiency_score >= 40:
            risk_cat = "Moderate Risk"
            priority = "High"
            savings_pct = round(15 + (70 - efficiency_score) * 0.5, 1)
        else:
            risk_cat = "Critical Risk"
            priority = "Urgent"
            savings_pct = round(25 + (40 - efficiency_score) * 0.8, 1)

        # Low rainfall recommendations
        if payload.rainfall < CONSERVATION_RULES["low_rainfall"]["threshold"]:
            recommendations.extend(CONSERVATION_RULES["low_rainfall"]["tips"])

        # High per-capita usage
        if per_capita_usage > CONSERVATION_RULES["high_usage"]["threshold_per_capita"]:
            recommendations.extend(CONSERVATION_RULES["high_usage"]["tips"])

        # Seasonal recommendations
        if payload.month in CONSERVATION_RULES["seasonal"]["dry_months"]:
            recommendations.extend(CONSERVATION_RULES["seasonal"]["tips"])

        # Always add general tips (pick 2)
        import random
        random.seed(int(payload.water_usage + payload.rainfall))  # deterministic
        general = random.sample(CONSERVATION_RULES["general"], 2)
        recommendations.extend(general)

        # Deduplicate while preserving order
        seen = set()
        unique_recs = []
        for r in recommendations:
            if r not in seen:
                seen.add(r)
                unique_recs.append(r)

        return ConservationRecommendation(
            area_name=payload.area_name,
            water_efficiency_score=efficiency_score,
            risk_category=risk_cat,
            recommendations=unique_recs,
            potential_savings_pct=savings_pct,
            priority=priority,
        )
    except Exception as e:
        logger.error(f"Conservation recommendation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations.")
