from typing import List, Dict, Any, Tuple
from .config import UNUSUAL_AMOUNT_THRESHOLD, RAPID_ATTEMPTS_THRESHOLD, ODD_HOURS_NIGHT
from .models import TransactionInput, RuleDetail


def evaluate_rules(tx: TransactionInput) -> Tuple[List[str], int, List[RuleDetail]]:
    """
    Evaluates rule-based signals deterministically and transparently.
    Returns:
        reason_codes: list of triggered reason code strings
        rule_score_delta: total impact points
        rule_details: structured details for UI inspection
    """
    reason_codes = []
    rule_details = []
    total_impact = 0

    # Rule 1: Unusual Amount
    is_unusual_amount = tx.amount >= UNUSUAL_AMOUNT_THRESHOLD
    if is_unusual_amount:
        reason_codes.append("UNUSUAL_AMOUNT")
        impact = 35
        total_impact += impact
    else:
        impact = 0
    rule_details.append(
        RuleDetail(
            code="UNUSUAL_AMOUNT",
            description=f"Transaction amount ({tx.amount:,.2f}) exceeds demo review threshold ({UNUSUAL_AMOUNT_THRESHOLD:,.0f})",
            triggered=is_unusual_amount,
            severity="high" if tx.amount >= 25000 else "medium",
            impact_points=impact
        )
    )

    # Rule 2: New Device
    if tx.new_device:
        reason_codes.append("NEW_DEVICE")
        impact = 25
        total_impact += impact
    else:
        impact = 0
    rule_details.append(
        RuleDetail(
            code="NEW_DEVICE",
            description="Transaction originates from an unrecognized device or browser fingerprint",
            triggered=tx.new_device,
            severity="medium",
            impact_points=impact
        )
    )

    # Rule 3: Location Change
    if tx.location_change:
        reason_codes.append("LOCATION_CHANGE")
        impact = 20
        total_impact += impact
    else:
        impact = 0
    rule_details.append(
        RuleDetail(
            code="LOCATION_CHANGE",
            description="Transaction geographic coordinates or IP differ from normal usage zone",
            triggered=tx.location_change,
            severity="medium",
            impact_points=impact
        )
    )

    # Rule 4: Rapid Attempts
    is_rapid = tx.transactions_last_10_min >= RAPID_ATTEMPTS_THRESHOLD
    if is_rapid:
        reason_codes.append("RAPID_ATTEMPTS")
        impact = 30
        total_impact += impact
    else:
        impact = 0
    rule_details.append(
        RuleDetail(
            code="RAPID_ATTEMPTS",
            description=f"Rapid velocity: {tx.transactions_last_10_min} attempts recorded in the last 10 minutes (threshold: {RAPID_ATTEMPTS_THRESHOLD})",
            triggered=is_rapid,
            severity="high",
            impact_points=impact
        )
    )

    # Rule 5: Odd Midnight Hours (Compound Rule)
    is_odd_hour = tx.hour in ODD_HOURS_NIGHT and tx.amount > 5000
    if is_odd_hour and "UNUSUAL_HOURS" not in reason_codes:
        reason_codes.append("ODD_HOURS")
        impact = 15
        total_impact += impact
        rule_details.append(
            RuleDetail(
                code="ODD_HOURS",
                description=f"Elevated transaction during nocturnal inactivity window ({tx.hour:02d}:00 hours)",
                triggered=True,
                severity="low",
                impact_points=impact
            )
        )

    # Dynamic Custom Rules (Configured via UI)
    try:
        from .database import get_custom_rules
        custom_rules = get_custom_rules(active_only=True)
        for crule in custom_rules:
            field = crule.get("field", "")
            operator = crule.get("operator", ">")
            thresh = float(crule.get("threshold_value", 0))
            impact_pts = int(crule.get("risk_score_impact", 10))
            code = crule.get("reason_code", "CUSTOM_ALERT")
            name = crule.get("name", "Custom Rule")

            # Extract field value
            if field == "amount":
                val = float(tx.amount)
            elif field == "hour":
                val = float(tx.hour)
            elif field == "transactions_last_10_min":
                val = float(tx.transactions_last_10_min)
            elif field == "new_device":
                val = 1.0 if tx.new_device else 0.0
            elif field == "location_change":
                val = 1.0 if tx.location_change else 0.0
            else:
                continue

            # Compare
            triggered = False
            if operator == ">" and val > thresh:
                triggered = True
            elif operator == ">=" and val >= thresh:
                triggered = True
            elif operator == "<" and val < thresh:
                triggered = True
            elif operator == "<=" and val <= thresh:
                triggered = True
            elif operator in ("==", "=") and abs(val - thresh) < 1e-6:
                triggered = True
            elif operator == "!=" and abs(val - thresh) >= 1e-6:
                triggered = True

            if triggered:
                if code not in reason_codes:
                    reason_codes.append(code)
                total_impact += impact_pts

            rule_details.append(
                RuleDetail(
                    code=code,
                    description=f"Custom: {name} ({field} {operator} {thresh})",
                    triggered=triggered,
                    severity="high" if impact_pts >= 30 else "medium",
                    impact_points=impact_pts if triggered else 0
                )
            )
    except Exception as e:
        print(f"Error evaluating custom rules: {e}")

    return reason_codes, total_impact, rule_details
