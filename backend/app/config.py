from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "fraud_assistant.db"
MODEL_PATH = DATA_DIR / "model.joblib"
METRICS_PATH = DATA_DIR / "model_metrics.json"
SYNTHETIC_DATA_PATH = DATA_DIR / "synthetic_transactions.csv"

# Fraud Rules Thresholds
UNUSUAL_AMOUNT_THRESHOLD = 15000.0
RAPID_ATTEMPTS_THRESHOLD = 4
ODD_HOURS_NIGHT = [0, 1, 2, 3, 4]  # Midnight to early morning

# Risk Score Bands
HIGH_RISK_THRESHOLD = 70
MEDIUM_RISK_THRESHOLD = 40

# Official Safety / Uncertainty Notice
UNCERTAINTY_NOTICE = (
    "This is an automated demo risk estimate; it cannot confirm fraud. "
    "This prototype uses synthetic data. Do not connect to or execute real money movement."
)

# PayPal API Configuration (Sandbox by default)
import os
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_ENV = os.getenv("PAYPAL_ENV", "sandbox")
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com" if PAYPAL_ENV == "sandbox" else "https://api-m.paypal.com"

