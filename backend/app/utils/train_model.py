"""
Train a RandomForestClassifier on water_dataset.csv and save as water_model.pkl.

Usage (from the backend/ directory):
    python -m app.utils.train_model
"""

import os
import sys
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Paths -----------------------------------------------------------------------
# __file__ → backend/app/utils/train_model.py  →  two levels up = backend/  →  one more = project root
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DATASET_PATH = os.path.join(ROOT_DIR, "water_dataset.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "services", "water_model.pkl")

FEATURES = ["rainfall", "population", "water_usage", "complaint_count", "month"]
TARGET = "shortage_risk"


def seed_water_data():
    """Optionally seed the water_data table in the database."""
    try:
        from app.database import SessionLocal
        from app.models import WaterData

        df = pd.read_csv(DATASET_PATH)
        db = SessionLocal()
        existing = db.query(WaterData).count()
        if existing > 0:
            print(f"water_data table already has {existing} rows — skipping seed.")
            db.close()
            return
        for _, row in df.iterrows():
            db.add(WaterData(
                area_name=row["area_name"],
                rainfall=row["rainfall"],
                population=row["population"],
                water_usage=row["water_usage"],
                complaint_count=row["complaint_count"],
                month=row["month"],
            ))
        db.commit()
        print(f"Seeded {len(df)} rows into water_data table.")
        db.close()
    except Exception as e:
        print(f"Could not seed water_data (non-fatal): {e}")


def train():
    if not os.path.exists(DATASET_PATH):
        print(f"ERROR: Dataset not found at {DATASET_PATH}")
        sys.exit(1)

    print(f"Loading dataset from {DATASET_PATH} ...")
    df = pd.read_csv(DATASET_PATH)

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("\n--- Classification Report ---")
    print(classification_report(y_test, y_pred, zero_division=0))
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")

    # Attempt to seed the water_data table
    seed_water_data()


if __name__ == "__main__":
    train()
