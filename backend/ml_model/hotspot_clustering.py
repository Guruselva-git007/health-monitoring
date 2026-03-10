"""Bonus utility: cluster outbreak hotspots from geolocated prediction results."""

from pathlib import Path

import pandas as pd
from sklearn.cluster import DBSCAN

BASE_DIR = Path(__file__).resolve().parent
INPUT_PATH = BASE_DIR / "data" / "risk_map_points.csv"
OUTPUT_PATH = BASE_DIR / "data" / "risk_hotspots.csv"


def main() -> None:
    if not INPUT_PATH.exists():
        raise FileNotFoundError(
            f"Input file missing at {INPUT_PATH}. Provide columns: latitude, longitude, risk_level."
        )

    df = pd.read_csv(INPUT_PATH)
    if not {"latitude", "longitude"}.issubset(set(df.columns)):
        raise ValueError("Input file must include latitude and longitude columns")

    coords = df[["latitude", "longitude"]].to_numpy()
    model = DBSCAN(eps=0.02, min_samples=5)
    labels = model.fit_predict(coords)

    out = df.copy()
    out["cluster_id"] = labels
    out.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved clustered hotspots to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
