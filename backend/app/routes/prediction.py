import logging

from fastapi import APIRouter, HTTPException
from app.schemas import PredictionInput, PredictionResult
from app.services.ai_model import predict_risk

logger = logging.getLogger("aquavision.prediction")
router = APIRouter(prefix="/prediction", tags=["Prediction"])


@router.post("/risk", response_model=PredictionResult)
def predict(payload: PredictionInput):
    try:
        result = predict_risk(payload)
        logger.info(f"Prediction: {result.risk_level} ({result.risk_score})")
        return result
    except FileNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(status_code=503, detail="AI model not available. Train the model first.")
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail="Risk prediction failed.")
