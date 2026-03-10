"""Optional bonus model: LSTM time-series forecasting of weekly outbreak counts."""

from pathlib import Path

import numpy as np
import pandas as pd
from tensorflow.keras import Sequential
from tensorflow.keras.layers import LSTM, Dense

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "weekly_outbreak_series.csv"
MODEL_PATH = BASE_DIR / "models" / "lstm_outbreak_forecaster.keras"


def generate_series(weeks: int = 156, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    t = np.arange(weeks)
    baseline = 22 + 6 * np.sin(2 * np.pi * t / 52)
    rainfall_effect = 4 * np.sin(2 * np.pi * t / 13)
    noise = rng.normal(0, 2.5, size=weeks)
    outbreaks = np.clip(baseline + rainfall_effect + noise, 1, None)
    return pd.DataFrame({"week": t, "outbreak_count": outbreaks})


def prepare_sequences(values: np.ndarray, window: int = 8) -> tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    for i in range(len(values) - window):
        X.append(values[i : i + window])
        y.append(values[i + window])
    X_arr = np.array(X).reshape(-1, window, 1)
    y_arr = np.array(y)
    return X_arr, y_arr


def main() -> None:
    df = generate_series()
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATA_PATH, index=False)

    values = df["outbreak_count"].to_numpy(dtype=np.float32)
    X, y = prepare_sequences(values)

    split = int(len(X) * 0.8)
    X_train, y_train = X[:split], y[:split]

    model = Sequential(
        [
            LSTM(32, input_shape=(X.shape[1], 1)),
            Dense(16, activation="relu"),
            Dense(1),
        ]
    )
    model.compile(optimizer="adam", loss="mse")
    model.fit(X_train, y_train, epochs=20, batch_size=8, verbose=0)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_PATH)
    print(f"Saved LSTM model to {MODEL_PATH}")


if __name__ == "__main__":
    main()
