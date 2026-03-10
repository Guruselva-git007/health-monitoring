from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import joblib

from database.config import settings


@dataclass
class PredictionResult:
    risk_level: str
    confidence: float
    probabilities: dict[str, float]


class RiskModelManager:
    FEATURE_ORDER = [
        "ph",
        "turbidity",
        "temperature",
        "ecoli",
        "number_of_symptom_reports",
        "population_density",
        "rainfall",
    ]

    def __init__(self) -> None:
        self._artifact: dict | None = None

    def load(self) -> dict | None:
        if self._artifact is not None:
            return self._artifact

        model_path = Path(settings.model_path)
        if not model_path.exists():
            return None

        try:
            self._artifact = joblib.load(model_path)
        except Exception:
            return None
        return self._artifact

    def heuristic_predict(self, features: dict[str, float]) -> PredictionResult:
        score = 0
        score += 2 if features["ecoli"] >= 1 else 0
        score += 2 if features["turbidity"] > 9 else 0
        score += 1 if features["ph"] < 6.5 or features["ph"] > 8.5 else 0
        score += 1 if features["temperature"] > 30 else 0
        score += 2 if features["number_of_symptom_reports"] > 15 else 0
        score += 1 if features["population_density"] > 7000 else 0
        score += 1 if features["rainfall"] > 120 else 0

        if score >= 6:
            probs = {"LOW": 0.05, "MEDIUM": 0.2, "HIGH": 0.75}
        elif score >= 3:
            probs = {"LOW": 0.2, "MEDIUM": 0.65, "HIGH": 0.15}
        else:
            probs = {"LOW": 0.8, "MEDIUM": 0.15, "HIGH": 0.05}

        risk = max(probs, key=probs.get)
        return PredictionResult(risk_level=risk, confidence=probs[risk], probabilities=probs)

    def predict(self, features: dict[str, float]) -> PredictionResult:
        artifact = self.load()
        if artifact is None:
            return self.heuristic_predict(features)

        model = artifact["model"]
        labels: list[str] = artifact["labels"]
        ordered = [[float(features[name]) for name in self.FEATURE_ORDER]]

        if hasattr(model, "predict_proba"):
            probs_arr = model.predict_proba(ordered)[0]
            probs = {labels[i]: float(probs_arr[i]) for i in range(len(labels))}
            risk = max(probs, key=probs.get)
            confidence = probs[risk]
            return PredictionResult(risk_level=risk, confidence=confidence, probabilities=probs)

        pred_idx = int(model.predict(ordered)[0])
        risk = labels[pred_idx]
        probs = {label: 1.0 if label == risk else 0.0 for label in labels}
        return PredictionResult(risk_level=risk, confidence=1.0, probabilities=probs)

    def load_metrics(self) -> dict:
        metrics_path = Path(settings.metrics_path)
        if not metrics_path.exists():
            return {}

        with metrics_path.open("r", encoding="utf-8") as f:
            return json.load(f)


risk_model_manager = RiskModelManager()
