import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)
from .config import MODEL_PATH, METRICS_PATH, SYNTHETIC_DATA_PATH
from .synthetic_data import generate_synthetic_dataset


FEATURE_NAMES = [
    "amount",
    "amount_log",
    "hour",
    "is_night_hour",
    "new_device",
    "location_change",
    "transactions_last_10_min",
    "device_and_location"
]


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    X = pd.DataFrame()
    X["amount"] = df["amount"].astype(float)
    X["amount_log"] = np.log1p(df["amount"].astype(float))
    X["hour"] = df["hour"].astype(int)
    X["is_night_hour"] = df["hour"].isin([23, 0, 1, 2, 3, 4]).astype(int)
    X["new_device"] = df["new_device"].astype(int)
    X["location_change"] = df["location_change"].astype(int)
    X["transactions_last_10_min"] = df["transactions_last_10_min"].astype(int)
    X["device_and_location"] = (df["new_device"].astype(int) * df["location_change"].astype(int))
    return X[FEATURE_NAMES]


def train_and_evaluate_model():
    # 1. Ensure synthetic data exists
    if not SYNTHETIC_DATA_PATH.exists():
        df = generate_synthetic_dataset(n_samples=5000)
    else:
        df = pd.read_csv(SYNTHETIC_DATA_PATH)

    print(f"Loaded {len(df)} transactions for model training...")

    X = build_features(df)
    y = df["is_fraud"].astype(int)

    # 2. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    # 3. Model training: Balanced Random Forest
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=8,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    # 4. Evaluation
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Feature importances
    feature_importances = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in zip(FEATURE_NAMES, clf.feature_importances_)
    ]
    feature_importances.sort(key=lambda x: x["importance"], reverse=True)

    metrics = {
        "model_type": "RandomForestClassifier (Ensemble)",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": {
            "true_negative": cm[0][0],
            "false_positive": cm[0][1],
            "false_negative": cm[1][0],
            "true_positive": cm[1][1]
        },
        "feature_importances": feature_importances,
        "limitations": [
            "Trained exclusively on synthetic distributions with simulated anomaly signatures.",
            "Cannot replace multi-factor authentication or bank-grade KYC databases.",
            "High amount threshold is static in MVP; real production requires rolling user percentiles.",
            "Provides an estimated risk probability, not confirmation of actual financial fraud."
        ],
        "safeguards": [
            "Model decisions are paired with transparent reason codes.",
            "No sensitive payment credentials (PIN, OTP, CVV) are ever accepted or processed.",
            "All predictions carry visible uncertainty warnings."
        ]
    }

    # 5. Save model and metrics
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(clf, MODEL_PATH)

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print("Model training complete!")
    print(f"Metrics saved to {METRICS_PATH}")
    print(f"ROC-AUC: {auc:.4f} | Recall: {rec:.4f} | Precision: {prec:.4f}")
    return clf, metrics


if __name__ == "__main__":
    train_and_evaluate_model()
