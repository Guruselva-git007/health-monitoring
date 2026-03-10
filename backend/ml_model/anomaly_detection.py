"""Bonus utility: detect unusual water-quality sensor readings."""

from pathlib import Path

import pandas as pd
from sklearn.ensemble import IsolationForest

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "simulated_outbreak_data.csv"
OUTPUT_PATH = BASE_DIR / "data" / "water_anomalies.csv"

FEATURES = ["ph", "turbidity", "temperature", "ecoli", "rainfall"]


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Run simulate_dataset.py first.")

    df = pd.read_csv(DATA_PATH)
    model = IsolationForest(contamination=0.03, random_state=42)
    preds = model.fit_predict(df[FEATURES])

    anomalous = df[preds == -1].copy()
    anomalous["anomaly_score"] = model.decision_function(anomalous[FEATURES])

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    anomalous.to_csv(OUTPUT_PATH, index=False)
    print(f"Detected {len(anomalous)} anomalies. Saved to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
