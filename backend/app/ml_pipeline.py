import joblib
import json
import pandas as pd
from typing import Tuple, Dict, Any
from .config import MODEL_PATH, METRICS_PATH, HIGH_RISK_THRESHOLD, MEDIUM_RISK_THRESHOLD
from .models import TransactionInput, RiskLevel
from .train_model import build_features, train_and_evaluate_model

_MODEL = None


def get_model():
    global _MODEL
    if _MODEL is None:
        if not MODEL_PATH.exists():
            print("Model not found on disk, training baseline model now...")
            _MODEL, _ = train_and_evaluate_model()
        else:
            try:
                _MODEL = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"Error loading model: {e}, retraining...")
                _MODEL, _ = train_and_evaluate_model()
    return _MODEL


def predict_risk(tx: TransactionInput, rule_impact: int, reason_codes: list) -> Tuple[int, float, RiskLevel, str]:
    """
    Combines ML model output with rule-based heuristics.
    Returns:
        risk_score (int 0-100)
        ml_probability (float 0.0 - 1.0)
        risk_level (RiskLevel: low, medium, high)
        recommended_action (str)
    """
    model = get_model()

    # Build single-row DataFrame for inference
    df = pd.DataFrame([{
        "amount": tx.amount,
        "hour": tx.hour,
        "new_device": 1 if tx.new_device else 0,
        "location_change": 1 if tx.location_change else 0,
        "transactions_last_10_min": tx.transactions_last_10_min
    }])

    X = build_features(df)
    ml_prob = float(model.predict_proba(X)[0][1])
    ml_score = int(round(ml_prob * 100))

    # Threshold & Rule Fusion Policy
    # Combine: 60% ML probability + 40% rule impact bonus
    rule_score = min(100, rule_impact)
    combined_score = int(round(0.60 * ml_score + 0.40 * rule_score))

    # Critical override rules:
    # 1. New device + Rapid attempts OR New device + Unusual amount
    if "NEW_DEVICE" in reason_codes and ("RAPID_ATTEMPTS" in reason_codes or "UNUSUAL_AMOUNT" in reason_codes):
        combined_score = max(combined_score, 82)

    # 2. Unusual amount alone (> 15000)
    elif "UNUSUAL_AMOUNT" in reason_codes:
        combined_score = max(combined_score, 55)

    # 3. Rapid attempts alone
    elif "RAPID_ATTEMPTS" in reason_codes:
        combined_score = max(combined_score, 50)

    # Bound between 0 and 99
    risk_score = max(0, min(99, combined_score))

    # Determine Risk Band
    if risk_score >= HIGH_RISK_THRESHOLD:
        risk_level = RiskLevel.HIGH
        action = "Pause and verify through your official payment app."
    elif risk_score >= MEDIUM_RISK_THRESHOLD:
        risk_level = RiskLevel.MEDIUM
        action = "Review details carefully. Check payment notification in your official bank app."
    else:
        risk_level = RiskLevel.LOW
        action = "Routine vigilance advised. Verify recipient before confirming."

    return risk_score, ml_prob, risk_level, action


def get_model_evaluation_metrics() -> Dict[str, Any]:
    if METRICS_PATH.exists():
        try:
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    # If not existing or error, train and return
    _, metrics = train_and_evaluate_model()
    return metrics
