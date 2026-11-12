import os
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import UNCERTAINTY_NOTICE
from .models import (
    TransactionInput,
    ScoreResponse,
    FeedbackRequest,
    FeedbackResponse,
    MetricsSummary,
    AssistantChatRequest,
    AssistantChatResponse,
    PayPalConfigUpdate,
    PayPalCheckoutRequest,
    PayPalCheckoutResponse,
    PayPalCaptureRequest
)
from .paypal_service import (
    get_current_paypal_config,
    update_paypal_config,
    create_paypal_order,
    capture_paypal_order
)
from .database import (
    init_db,
    save_transaction,
    save_feedback,
    get_transactions,
    get_transaction_by_id,
    get_metrics_summary,
    seed_demo_transactions_if_empty
)
from .rules_engine import evaluate_rules
from .ml_pipeline import predict_risk, get_model, get_model_evaluation_metrics
from .assistant import compose_assistant_summary, handle_assistant_prompt
from .synthetic_data import generate_synthetic_dataset
from .train_model import train_and_evaluate_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and seed demo records if needed
    init_db()
    seed_demo_transactions_if_empty()
    # Warm up ML model
    get_model()
    yield


app = FastAPI(
    title="AI-Powered Fraud Detection & Smart Payment Assistant API",
    description="Safety assistant prototype for digital payment scenarios using synthetic data.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
def health_check():
    """Check server status."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/api/transactions/score", response_model=ScoreResponse, tags=["Scoring"])
def score_transaction(tx: TransactionInput):
    """
    Validate and score one demo transaction.
    Runs rule heuristics and trained ML classifier to estimate risk score,
    identifies transparent reason codes, and saves to demo history.
    """
    # 1. Evaluate Rule Engine
    reason_codes, rule_impact, rule_details = evaluate_rules(tx)

    # 2. Evaluate ML Pipeline & Hybrid Fusion
    risk_score, ml_prob, risk_level, rec_action = predict_risk(tx, rule_impact, reason_codes)

    # 3. Plain-language grounded assistant explanation
    assistant_explanation = compose_assistant_summary(reason_codes, risk_level.value)

    # 4. Save to demo SQLite database
    now_iso = datetime.now(timezone.utc).isoformat()
    record_data = {
        "amount": tx.amount,
        "hour": tx.hour,
        "new_device": tx.new_device,
        "location_change": tx.location_change,
        "transactions_last_10_min": tx.transactions_last_10_min,
        "risk_score": risk_score,
        "risk_level": risk_level.value,
        "reason_codes": reason_codes,
        "recommended_action": rec_action,
        "created_at": now_iso
    }
    tx_id = save_transaction(record_data)

    return ScoreResponse(
        id=tx_id,
        amount=tx.amount,
        hour=tx.hour,
        new_device=tx.new_device,
        location_change=tx.location_change,
        transactions_last_10_min=tx.transactions_last_10_min,
        risk_score=risk_score,
        risk_level=risk_level,
        reason_codes=reason_codes,
        recommended_action=rec_action,
        assistant_explanation=assistant_explanation,
        ml_probability=round(ml_prob, 4),
        rule_details=rule_details,
        uncertainty_text=UNCERTAINTY_NOTICE,
        created_at=now_iso
    )


@app.get("/api/transactions", tags=["History"])
def list_transactions(
    risk_level: Optional[str] = Query(None, description="Filter by risk band: low, medium, high, or all"),
    feedback_status: Optional[str] = Query(None, description="Filter by user feedback status: pending, recognised, not_recognised, unsure"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Read demo transaction history with filters."""
    return get_transactions(
        risk_level=risk_level,
        feedback_status=feedback_status,
        limit=limit,
        offset=offset
    )


@app.get("/api/transactions/{id}", tags=["History"])
def get_transaction(id: int):
    """Retrieve single transaction details by ID."""
    tx = get_transaction_by_id(id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@app.post("/api/transactions/{id}/feedback", response_model=FeedbackResponse, tags=["Feedback"])
def record_feedback(id: int, fb: FeedbackRequest):
    """
    Save user feedback on a demo transaction.
    Demonstration and review flag - not automated proof that transaction was fraud.
    """
    existing = get_transaction_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="Transaction not found")

    success = save_feedback(id, fb.user_feedback.value, fb.notes)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save feedback")

    return FeedbackResponse(
        success=True,
        transaction_id=id,
        user_feedback=fb.user_feedback.value,
        updated_at=datetime.now(timezone.utc).isoformat(),
        message="Feedback saved for prototype demonstration and safety audit."
    )


@app.get("/api/metrics/summary", response_model=MetricsSummary, tags=["Analytics"])
def get_dashboard_metrics():
    """Return dashboard aggregates and counts by risk band."""
    return get_metrics_summary()


@app.get("/api/model/metrics", tags=["ML Evaluation"])
def get_model_metrics():
    """Return model evaluation metrics, confusion matrix, and feature importances."""
    return get_model_evaluation_metrics()


@app.post("/api/assistant/chat", response_model=AssistantChatResponse, tags=["Smart Assistant"])
def chat_with_assistant(req: AssistantChatRequest):
    """
    Smart payment assistant providing plain-language explanations
    strictly grounded on backend reason codes and safe verification steps.
    """
    return handle_assistant_prompt(
        prompt_key=req.prompt_key,
        custom_query=req.custom_query,
        reason_codes=req.reason_codes,
        risk_level=req.risk_level
    )


@app.post("/api/demo/reset-seed", tags=["Demo Helpers"])
def reset_and_reseed_demo_data():
    """Regenerates synthetic model dataset and resets demo transactions."""
    generate_synthetic_dataset(n_samples=4000)
    train_and_evaluate_model()
    return {"message": "Synthetic dataset regenerated and baseline model retrained successfully."}


# ==========================================
# PAYPAL API INTEGRATION ENDPOINTS
# ==========================================

@app.get("/api/paypal/config", tags=["PayPal Integration"])
def get_paypal_status():
    """Retrieve current PayPal configuration and connection status."""
    return get_current_paypal_config()


@app.post("/api/paypal/config", tags=["PayPal Integration"])
def set_paypal_credentials(req: PayPalConfigUpdate):
    """Configure or update custom PayPal Sandbox Developer credentials."""
    update_paypal_config(req.client_id, req.client_secret, req.environment)
    return {
        "success": True,
        "message": "PayPal credentials updated successfully.",
        "config": get_current_paypal_config()
    }


@app.post("/api/paypal/create-order", response_model=PayPalCheckoutResponse, tags=["PayPal Integration"])
async def paypal_checkout_with_risk_guard(req: PayPalCheckoutRequest):
    """
    Interception Gateway: Evaluates fraud signals prior to creating a PayPal order.
    If High Risk: Intercepts flow, pauses order, and flags reasons to protect the user.
    If Low/Medium (or explicitly overridden): Creates official PayPal v2 Checkout Order.
    """
    # 1. Map to FraudGuard TransactionInput
    current_hour = req.hour if req.hour is not None else datetime.now(timezone.utc).hour
    tx_input = TransactionInput(
        amount=req.amount,
        hour=current_hour,
        new_device=req.new_device,
        location_change=req.location_change,
        transactions_last_10_min=req.transactions_last_10_min
    )

    # 2. Evaluate Rule Engine & ML Pipeline
    reason_codes, rule_impact, rule_details = evaluate_rules(tx_input)
    risk_score, ml_prob, risk_level, rec_action = predict_risk(tx_input, rule_impact, reason_codes)

    # 3. Intercept if High Risk and not bypassed
    is_high_risk = risk_level.value == "high"
    if is_high_risk and not req.bypass_risk_check:
        # Save intercepted attempt to DB
        now_iso = datetime.now(timezone.utc).isoformat()
        tx_id = save_transaction({
            "amount": req.amount,
            "hour": current_hour,
            "new_device": req.new_device,
            "location_change": req.location_change,
            "transactions_last_10_min": req.transactions_last_10_min,
            "risk_score": risk_score,
            "risk_level": risk_level.value,
            "reason_codes": reason_codes,
            "recommended_action": rec_action,
            "demo_status": "intercepted_high_risk",
            "created_at": now_iso
        })

        return PayPalCheckoutResponse(
            order_id="INTERCEPTED",
            status="BLOCKED_BY_FRAUDGUARD",
            approval_url=None,
            decision="intercepted_high_risk",
            risk_score=risk_score,
            risk_level=risk_level.value,
            reason_codes=reason_codes,
            recommended_action=rec_action,
            is_live_sandbox=False,
            message="High anomaly signals detected! Payment creation was safely paused by FraudGuard AI. Please verify before approving.",
            transaction_id=tx_id
        )

    # 4. If approved or authorized: call PayPal API to create Order
    order_data = await create_paypal_order(
        amount=req.amount,
        currency=req.currency,
        description=req.item_name
    )

    # 5. Record approved order in SQLite
    now_iso = datetime.now(timezone.utc).isoformat()
    tx_id = save_transaction({
        "amount": req.amount,
        "hour": current_hour,
        "new_device": req.new_device,
        "location_change": req.location_change,
        "transactions_last_10_min": req.transactions_last_10_min,
        "risk_score": risk_score,
        "risk_level": risk_level.value,
        "reason_codes": reason_codes,
        "recommended_action": "Payment authorized. PayPal order initialized.",
        "demo_status": f"paypal_order_{order_data['order_id']}",
        "created_at": now_iso
    })

    return PayPalCheckoutResponse(
        order_id=order_data["order_id"],
        status=order_data["status"],
        approval_url=order_data.get("approval_url"),
        decision="approved",
        risk_score=risk_score,
        risk_level=risk_level.value,
        reason_codes=reason_codes,
        recommended_action=rec_action,
        is_live_sandbox=order_data.get("is_live_sandbox", False),
        message=f"Order created successfully ({'PayPal Live Sandbox' if order_data.get('is_live_sandbox') else 'PayPal Sandbox Simulation'}).",
        transaction_id=tx_id
    )


@app.post("/api/paypal/capture-order/{order_id}", tags=["PayPal Integration"])
async def paypal_capture_order_endpoint(order_id: str):
    """Capture an authorized PayPal order."""
    res = await capture_paypal_order(order_id)
    return res

