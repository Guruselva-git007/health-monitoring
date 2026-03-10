import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

try:
    from ml_model.simulate_dataset import build_dataset
except ModuleNotFoundError:
    from simulate_dataset import build_dataset

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "simulated_outbreak_data.csv"
MODEL_PATH = BASE_DIR / "models" / "rf_risk_model.joblib"
METRICS_PATH = BASE_DIR / "models" / "rf_metrics.json"

FEATURES = [
    "ph",
    "turbidity",
    "temperature",
    "ecoli",
    "number_of_symptom_reports",
    "population_density",
    "rainfall",
]
TARGET = "risk_level"


def load_dataset() -> pd.DataFrame:
    if DATA_PATH.exists():
        return pd.read_csv(DATA_PATH)

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df = build_dataset(rows=6000, seed=42)
    df.to_csv(DATA_PATH, index=False)
    return df


def main() -> None:
    df = load_dataset()

    X = df[FEATURES]
    y = df[TARGET]

    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=y_encoded,
    )

    model = RandomForestClassifier(
        n_estimators=400,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average="weighted", zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, average="weighted", zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, average="weighted", zero_division=0)),
        "labels": list(encoder.classes_),
        "feature_order": FEATURES,
    }

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    artifact = {
        "model": model,
        "labels": list(encoder.classes_),
        "feature_order": FEATURES,
    }
    joblib.dump(artifact, MODEL_PATH)

    with METRICS_PATH.open("w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print("Training complete")
    print(json.dumps(metrics, indent=2))
    print(f"Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    main()
