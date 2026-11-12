import random
import pandas as pd
import numpy as np
from .config import SYNTHETIC_DATA_PATH


def generate_synthetic_dataset(n_samples: int = 4000, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates synthetic labelled digital payment transaction data for model training.
    Strictly fictional demo data with controlled probability distributions.
    """
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []

    for _ in range(n_samples):
        # Determine latent scenario
        scenario_prob = random.random()

        if scenario_prob < 0.70:
            # 1. Normal Daily Routine (Legitimate)
            amount = round(float(np.random.gamma(shape=2.5, scale=400.0)), 2)
            amount = max(10.0, min(amount, 8000.0))
            # Usual waking hours 8 AM to 22 PM
            hour_p = np.array([
                0.01, 0.01, 0.005, 0.005, 0.01, 0.02, 0.03, 0.04,
                0.06, 0.07, 0.08, 0.08, 0.08, 0.08, 0.07, 0.07,
                0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.015, 0.015
            ])
            hour_p = hour_p / hour_p.sum()
            hour = int(np.random.choice(range(24), p=hour_p))
            new_device = 1 if random.random() < 0.04 else 0
            location_change = 1 if random.random() < 0.05 else 0
            velocity = int(np.random.choice([1, 2, 3], p=[0.85, 0.12, 0.03]))
            is_fraud = 0

        elif scenario_prob < 0.85:
            # 2. Benign Exceptions (Edge cases: legitimate new phone or travel)
            amount = round(float(np.random.uniform(500, 12000)), 2)
            hour = random.randint(9, 23)
            new_device = 1 if random.random() < 0.60 else 0
            location_change = 1 if random.random() < 0.50 else 0
            velocity = int(np.random.choice([1, 2, 3], p=[0.70, 0.22, 0.08]))
            # Very low fraud rate for benign exceptions
            is_fraud = 1 if (new_device and location_change and random.random() < 0.20) else 0

        else:
            # 3. Fraud / High-Risk Anomaly Scenarios
            # Anomaly: large transfers, burst attempts, new device, odd midnight hours
            fraud_type = random.choice(["account_takeover", "rapid_burst", "large_midnight_transfer"])

            if fraud_type == "account_takeover":
                amount = round(float(np.random.uniform(15000, 95000)), 2)
                hour = random.choice([0, 1, 2, 3, 4, 23])
                new_device = 1
                location_change = 1 if random.random() < 0.85 else 0
                velocity = random.randint(2, 6)
                is_fraud = 1

            elif fraud_type == "rapid_burst":
                amount = round(float(np.random.uniform(3000, 28000)), 2)
                hour = random.randint(0, 23)
                new_device = 1 if random.random() < 0.70 else 0
                location_change = 1 if random.random() < 0.60 else 0
                velocity = random.randint(4, 9)
                is_fraud = 1

            else:  # large_midnight_transfer
                amount = round(float(np.random.uniform(22000, 120000)), 2)
                hour = random.choice([1, 2, 3, 4])
                new_device = 1 if random.random() < 0.75 else 0
                location_change = 1 if random.random() < 0.70 else 0
                velocity = random.randint(1, 4)
                is_fraud = 1

        records.append({
            "amount": amount,
            "hour": hour,
            "new_device": new_device,
            "location_change": location_change,
            "transactions_last_10_min": velocity,
            "is_fraud": is_fraud
        })

    df = pd.DataFrame(records)
    SYNTHETIC_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(SYNTHETIC_DATA_PATH, index=False)
    print(f"Generated {len(df)} synthetic transactions -> {SYNTHETIC_DATA_PATH}")
    print(f"Fraud distribution:\n{df['is_fraud'].value_counts(normalize=True).round(3)}")
    return df


if __name__ == "__main__":
    generate_synthetic_dataset()
