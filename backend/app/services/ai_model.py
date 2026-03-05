import os
import logging
import numpy as np
import joblib
from app.schemas import PredictionInput, PredictionResult

logger = logging.getLogger("aquavision.ai_model")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "water_model.pkl")

_model = None


def _load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"water_model.pkl not found at {MODEL_PATH}. "
            "Run `python -m app.utils.train_model` from the backend/ directory first."
        )
    logger.info(f"Loading AI model from {MODEL_PATH}")
    return joblib.load(MODEL_PATH)


def get_model():
    global _model
    if _model is None:
        _model = _load_model()
    return _model


def predict_risk(data: PredictionInput) -> PredictionResult:
    clf = get_model()
    features = np.array(
        [[data.rainfall, data.population, data.water_usage, data.complaint_count, data.month]]
    )
    prediction = clf.predict(features)[0]
    probabilities = clf.predict_proba(features)[0]

    # risk_score = probability of the positive (shortage) class
    if len(probabilities) > 1:
        risk_score = float(probabilities[1])
    else:
        risk_score = float(prediction)

    if risk_score >= 0.7:
        risk_level = "High"
    elif risk_score >= 0.4:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return PredictionResult(risk_score=round(risk_score, 4), risk_level=risk_level)
