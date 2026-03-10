from pathlib import Path

import numpy as np
import pandas as pd

OUTPUT_PATH = Path(__file__).resolve().parent / "data" / "simulated_outbreak_data.csv"


def build_dataset(rows: int = 5000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    ph = rng.normal(loc=7.1, scale=0.9, size=rows).clip(4.5, 9.8)
    turbidity = rng.gamma(shape=2.2, scale=3.2, size=rows).clip(0.1, 50)
    temperature = rng.normal(loc=27, scale=6, size=rows).clip(10, 45)
    ecoli = rng.binomial(1, p=0.28, size=rows)
    number_of_symptom_reports = rng.poisson(lam=10, size=rows).clip(0, 80)
    population_density = rng.normal(loc=4200, scale=2800, size=rows).clip(50, 16000)
    rainfall = rng.gamma(shape=1.8, scale=35, size=rows).clip(0, 350)

    risk_score = (
        2.5 * ecoli
        + 0.08 * turbidity
        + 0.05 * number_of_symptom_reports
        + 0.00012 * population_density
        + 0.02 * rainfall
        + np.where((ph < 6.5) | (ph > 8.5), 1.2, 0.0)
        + np.where(temperature > 31, 0.8, 0.0)
        + rng.normal(0, 0.45, size=rows)
    )

    risk_label = np.where(risk_score >= 5.0, "HIGH", np.where(risk_score >= 2.8, "MEDIUM", "LOW"))

    return pd.DataFrame(
        {
            "ph": ph,
            "turbidity": turbidity,
            "temperature": temperature,
            "ecoli": ecoli,
            "number_of_symptom_reports": number_of_symptom_reports,
            "population_density": population_density,
            "rainfall": rainfall,
            "risk_level": risk_label,
        }
    )


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df = build_dataset()
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved {len(df)} rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
