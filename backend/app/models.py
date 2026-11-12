from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class FeedbackOption(str, Enum):
    RECOGNISED = "recognised"
    NOT_RECOGNISED = "not_recognised"
    UNSURE = "unsure"


class TransactionInput(BaseModel):
    amount: float = Field(
        ...,
        gt=0,
        le=10_000_000,
        description="Transaction amount in demo currency (must be positive, e.g. 18500)"
    )
    hour: int = Field(
        ...,
        ge=0,
        le=23,
        description="Hour of transaction (0 to 23 in 24-hour clock)"
    )
    new_device: bool = Field(
        default=False,
        description="Whether this transaction originates from an unrecognized device"
    )
    location_change: bool = Field(
        default=False,
        description="Whether transaction location is outside user's frequent geography"
    )
    transactions_last_10_min: int = Field(
        default=1,
        ge=0,
        le=100,
        description="Number of transaction attempts detected in the last 10 minutes"
    )

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be strictly greater than 0")
        return round(v, 2)


class RuleDetail(BaseModel):
    code: str
    description: str
    triggered: bool
    severity: str  # "high", "medium", "low"
    impact_points: int


class ScoreResponse(BaseModel):
    id: Optional[int] = None
    amount: float
    hour: int
    new_device: bool
    location_change: bool
    transactions_last_10_min: int
    risk_score: int = Field(..., ge=0, le=100, description="Risk score from 0-100")
    risk_level: RiskLevel
    reason_codes: List[str]
    recommended_action: str
    assistant_explanation: str
    ml_probability: float
    rule_details: List[RuleDetail]
    uncertainty_text: str
    created_at: str


class FeedbackRequest(BaseModel):
    user_feedback: FeedbackOption = Field(
        ...,
        description="Feedback choice: recognised, not_recognised, or unsure"
    )
    notes: Optional[str] = Field(None, max_length=500, description="Optional user note")


class FeedbackResponse(BaseModel):
    success: bool
    transaction_id: int
    user_feedback: str
    updated_at: str
    message: str


class TransactionRecord(BaseModel):
    id: int
    created_at: str
    amount: float
    hour: int
    new_device: bool
    location_change: bool
    transactions_last_10_min: int
    risk_score: int
    risk_level: str
    reason_codes: List[str]
    recommended_action: str
    demo_status: str
    user_feedback: Optional[str] = None


class MetricsSummary(BaseModel):
    total_checked: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    feedback_counts: Dict[str, int]
    risk_distribution: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    disclaimer: str


class AssistantChatRequest(BaseModel):
    prompt_key: Optional[str] = None  # e.g., "why_flagged", "what_to_check", "how_to_report"
    custom_query: Optional[str] = None
    reason_codes: List[str] = Field(default_factory=list)
    risk_level: str = "low"
    amount: Optional[float] = None
    new_device: Optional[bool] = None
    location_change: Optional[bool] = None
    transactions_last_10_min: Optional[int] = None


class AssistantChatResponse(BaseModel):
    answer: str
    grounded_reasons: List[str]
    action_checklist: List[str]
    safety_disclaimer: str


class PayPalConfigUpdate(BaseModel):
    client_id: str
    client_secret: str
    environment: str = "sandbox"


class PayPalCheckoutRequest(BaseModel):
    amount: float = Field(..., gt=0, le=10_000_000)
    currency: str = "USD"
    item_name: str = "Digital Payment Order"
    hour: Optional[int] = None
    new_device: bool = False
    location_change: bool = False
    transactions_last_10_min: int = 1
    bypass_risk_check: bool = False


class PayPalCheckoutResponse(BaseModel):
    order_id: str
    status: str
    approval_url: Optional[str] = None
    decision: str  # "approved", "intercepted_high_risk", "review_required"
    risk_score: int
    risk_level: str
    reason_codes: List[str]
    recommended_action: str
    is_live_sandbox: bool
    message: str
    transaction_id: Optional[int] = None


class PayPalCaptureRequest(BaseModel):
    order_id: str
    user_confirmation: bool = True


# ==========================================
# DYNAMIC FEATURES: RULES, LLM & STREAM
# ==========================================

class CustomRuleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    field: str = Field(..., pattern="^(amount|hour|new_device|location_change|transactions_last_10_min)$")
    operator: str = Field(..., pattern="^(>|>=|<|<=|==|!=)$")
    threshold_value: float
    reason_code: str = Field(..., min_length=2, max_length=50)
    risk_score_impact: int = Field(default=20, ge=-50, le=100)


class CustomRuleItem(BaseModel):
    id: int
    name: str
    field: str
    operator: str
    threshold_value: float
    reason_code: str
    risk_score_impact: int
    is_active: bool
    created_at: str


class LLMConfigUpdate(BaseModel):
    provider: str = Field(default="gemini", pattern="^(gemini|openai)$")
    api_key: str = Field(..., min_length=1)


class LLMConfigResponse(BaseModel):
    provider: str
    is_configured: bool
    key_preview: str
    status_message: str


class SimulateTickResponse(BaseModel):
    transaction: ScoreResponse
    summary: MetricsSummary

