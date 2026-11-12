import sqlite3
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from .config import DB_PATH, UNCERTAINTY_NOTICE


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Transactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            amount REAL NOT NULL,
            hour INTEGER NOT NULL,
            new_device INTEGER NOT NULL,
            location_change INTEGER NOT NULL,
            transactions_last_10_min INTEGER NOT NULL,
            risk_score INTEGER NOT NULL,
            risk_level TEXT NOT NULL,
            reason_codes TEXT NOT NULL,
            recommended_action TEXT NOT NULL,
            demo_status TEXT NOT NULL DEFAULT 'completed',
            user_feedback TEXT DEFAULT NULL
        )
    """)

    # Feedback table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id INTEGER NOT NULL,
            user_feedback TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (transaction_id) REFERENCES transactions(id)
        )
    """)

    # Custom Dynamic Rules Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS custom_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            field TEXT NOT NULL,
            operator TEXT NOT NULL,
            threshold_value REAL NOT NULL,
            reason_code TEXT NOT NULL,
            risk_score_impact INTEGER NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trans_created ON transactions(created_at DESC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trans_risk ON transactions(risk_level)")

    # Seed default custom rules if empty
    cursor.execute("SELECT COUNT(*) FROM custom_rules")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now(timezone.utc).isoformat()
        default_rules = [
            ("High Value Transfer (> $10k)", "amount", ">", 10000.0, "CUSTOM_HIGH_VALUE", 30, 1, now_str),
            ("Rapid Velocity Surge (>= 6 attempts)", "transactions_last_10_min", ">=", 6.0, "CUSTOM_VELOCITY_SURGE", 35, 1, now_str),
            ("Midnight Transactions (hour < 5)", "hour", "<", 5.0, "CUSTOM_MIDNIGHT_ALERT", 20, 1, now_str)
        ]
        cursor.executemany("""
            INSERT INTO custom_rules (name, field, operator, threshold_value, reason_code, risk_score_impact, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, default_rules)

    conn.commit()
    conn.close()


def save_transaction(data: Dict[str, Any]) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()

    reason_codes_json = json.dumps(data.get("reason_codes", []))
    created_at = data.get("created_at") or datetime.now(timezone.utc).isoformat()

    cursor.execute("""
        INSERT INTO transactions (
            created_at, amount, hour, new_device, location_change,
            transactions_last_10_min, risk_score, risk_level,
            reason_codes, recommended_action, demo_status, user_feedback
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        created_at,
        data["amount"],
        data["hour"],
        1 if data["new_device"] else 0,
        1 if data["location_change"] else 0,
        data["transactions_last_10_min"],
        data["risk_score"],
        data["risk_level"],
        reason_codes_json,
        data.get("recommended_action", "Pause and verify through your official payment app."),
        data.get("demo_status", "completed"),
        data.get("user_feedback", None)
    ))

    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id


def save_feedback(transaction_id: int, feedback: str, notes: Optional[str] = None) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()

    now = datetime.now(timezone.utc).isoformat()

    # Record in feedback table
    cursor.execute("""
        INSERT INTO feedback (transaction_id, user_feedback, notes, created_at)
        VALUES (?, ?, ?, ?)
    """, (transaction_id, feedback, notes, now))

    # Update transaction record user_feedback
    cursor.execute("""
        UPDATE transactions
        SET user_feedback = ?
        WHERE id = ?
    """, (feedback, transaction_id))

    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


def get_transactions(
    risk_level: Optional[str] = None,
    feedback_status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM transactions WHERE 1=1"
    params = []

    if risk_level and risk_level.lower() != "all":
        query += " AND risk_level = ?"
        params.append(risk_level.lower())

    if feedback_status:
        if feedback_status == "pending":
            query += " AND user_feedback IS NULL"
        elif feedback_status != "all":
            query += " AND user_feedback = ?"
            params.append(feedback_status)

    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["new_device"] = bool(d["new_device"])
        d["location_change"] = bool(d["location_change"])
        try:
            d["reason_codes"] = json.loads(d["reason_codes"])
        except Exception:
            d["reason_codes"] = []
        result.append(d)

    return result


def get_transaction_by_id(tx_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    d = dict(row)
    d["new_device"] = bool(d["new_device"])
    d["location_change"] = bool(d["location_change"])
    try:
        d["reason_codes"] = json.loads(d["reason_codes"])
    except Exception:
        d["reason_codes"] = []
    return d


def get_metrics_summary() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total and counts by risk level
    cursor.execute("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as high_count,
            SUM(CASE WHEN risk_level = 'medium' THEN 1 ELSE 0 END) as med_count,
            SUM(CASE WHEN risk_level = 'low' THEN 1 ELSE 0 END) as low_count
        FROM transactions
    """)
    totals_row = cursor.fetchone()
    total = totals_row["total"] or 0
    high_count = totals_row["high_count"] or 0
    med_count = totals_row["med_count"] or 0
    low_count = totals_row["low_count"] or 0

    # Feedback counts
    cursor.execute("""
        SELECT user_feedback, COUNT(*) as count
        FROM transactions
        WHERE user_feedback IS NOT NULL
        GROUP BY user_feedback
    """)
    fb_rows = cursor.fetchall()
    fb_dict = {"recognised": 0, "not_recognised": 0, "unsure": 0, "pending": 0}
    for r in fb_rows:
        fb_dict[r["user_feedback"]] = r["count"]

    cursor.execute("SELECT COUNT(*) as pending FROM transactions WHERE user_feedback IS NULL")
    fb_dict["pending"] = cursor.fetchone()["pending"] or 0

    # Risk score distribution bins (0-20, 21-40, 41-60, 61-80, 81-100)
    cursor.execute("""
        SELECT
            SUM(CASE WHEN risk_score BETWEEN 0 AND 20 THEN 1 ELSE 0 END) as bin_0_20,
            SUM(CASE WHEN risk_score BETWEEN 21 AND 40 THEN 1 ELSE 0 END) as bin_21_40,
            SUM(CASE WHEN risk_score BETWEEN 41 AND 60 THEN 1 ELSE 0 END) as bin_41_60,
            SUM(CASE WHEN risk_score BETWEEN 61 AND 80 THEN 1 ELSE 0 END) as bin_61_80,
            SUM(CASE WHEN risk_score BETWEEN 81 AND 100 THEN 1 ELSE 0 END) as bin_81_100
        FROM transactions
    """)
    dist_row = cursor.fetchone()
    risk_distribution = [
        {"range": "0-20 (Safe)", "count": dist_row["bin_0_20"] or 0, "band": "low"},
        {"range": "21-40 (Normal)", "count": dist_row["bin_21_40"] or 0, "band": "low"},
        {"range": "41-60 (Moderate)", "count": dist_row["bin_41_60"] or 0, "band": "medium"},
        {"range": "61-80 (Elevated)", "count": dist_row["bin_61_80"] or 0, "band": "high"},
        {"range": "81-100 (Critical)", "count": dist_row["bin_81_100"] or 0, "band": "high"},
    ]

    # Recent transactions (top 5)
    cursor.execute("""
        SELECT id, created_at, amount, risk_score, risk_level, reason_codes, user_feedback
        FROM transactions
        ORDER BY id DESC
        LIMIT 6
    """)
    recent_rows = cursor.fetchall()
    conn.close()

    recent_activity = []
    for r in recent_rows:
        d = dict(r)
        try:
            d["reason_codes"] = json.loads(d["reason_codes"])
        except Exception:
            d["reason_codes"] = []
        recent_activity.append(d)

    return {
        "total_checked": total,
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count,
        "feedback_counts": fb_dict,
        "risk_distribution": risk_distribution,
        "recent_activity": recent_activity,
        "disclaimer": UNCERTAINTY_NOTICE
    }


def seed_demo_transactions_if_empty():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM transactions")
    count = cursor.fetchone()[0]

    if count == 0:
        # Pre-seed realistic synthetic records
        demo_records = [
            {
                "created_at": "2026-10-21T09:15:00Z",
                "amount": 240.0,
                "hour": 9,
                "new_device": 0,
                "location_change": 0,
                "transactions_last_10_min": 1,
                "risk_score": 12,
                "risk_level": "low",
                "reason_codes": json.dumps([]),
                "recommended_action": "Standard processing. No security hold required.",
                "user_feedback": "recognised"
            },
            {
                "created_at": "2026-10-21T11:45:00Z",
                "amount": 18500.0,
                "hour": 2,
                "new_device": 1,
                "location_change": 1,
                "transactions_last_10_min": 5,
                "risk_score": 86,
                "risk_level": "high",
                "reason_codes": json.dumps(["UNUSUAL_AMOUNT", "NEW_DEVICE", "RAPID_ATTEMPTS"]),
                "recommended_action": "Pause and verify through your official payment app.",
                "user_feedback": "not_recognised"
            },
            {
                "created_at": "2026-10-21T13:20:00Z",
                "amount": 1200.0,
                "hour": 13,
                "new_device": 1,
                "location_change": 0,
                "transactions_last_10_min": 1,
                "risk_score": 45,
                "risk_level": "medium",
                "reason_codes": json.dumps(["NEW_DEVICE"]),
                "recommended_action": "Verify device prompt on your registered mobile banking app.",
                "user_feedback": "recognised"
            },
            {
                "created_at": "2026-10-21T14:10:00Z",
                "amount": 32000.0,
                "hour": 14,
                "new_device": 0,
                "location_change": 1,
                "transactions_last_10_min": 2,
                "risk_score": 68,
                "risk_level": "medium",
                "reason_codes": json.dumps(["UNUSUAL_AMOUNT", "LOCATION_CHANGE"]),
                "recommended_action": "Confirm this travel or outbound payment before continuing.",
                "user_feedback": "unsure"
            },
            {
                "created_at": "2026-10-21T16:05:00Z",
                "amount": 75.0,
                "hour": 16,
                "new_device": 0,
                "location_change": 0,
                "transactions_last_10_min": 1,
                "risk_score": 8,
                "risk_level": "low",
                "reason_codes": json.dumps([]),
                "recommended_action": "Standard processing.",
                "user_feedback": "recognised"
            },
            {
                "created_at": "2026-10-21T18:30:00Z",
                "amount": 45000.0,
                "hour": 1,
                "new_device": 1,
                "location_change": 1,
                "transactions_last_10_min": 6,
                "risk_score": 94,
                "risk_level": "high",
                "reason_codes": json.dumps(["UNUSUAL_AMOUNT", "NEW_DEVICE", "LOCATION_CHANGE", "RAPID_ATTEMPTS"]),
                "recommended_action": "Pause and verify immediately. High-risk anomaly signature.",
                "user_feedback": "not_recognised"
            },
            {
                "created_at": "2026-10-21T19:00:00Z",
                "amount": 890.0,
                "hour": 19,
                "new_device": 0,
                "location_change": 0,
                "transactions_last_10_min": 1,
                "risk_score": 15,
                "risk_level": "low",
                "reason_codes": json.dumps([]),
                "recommended_action": "Standard processing.",
                "user_feedback": None
            }
        ]

        for r in demo_records:
            cursor.execute("""
                INSERT INTO transactions (
                    created_at, amount, hour, new_device, location_change,
                    transactions_last_10_min, risk_score, risk_level,
                    reason_codes, recommended_action, demo_status, user_feedback
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
            """, (
                r["created_at"], r["amount"], r["hour"], r["new_device"],
                r["location_change"], r["transactions_last_10_min"],
                r["risk_score"], r["risk_level"], r["reason_codes"],
                r["recommended_action"], r["user_feedback"]
            ))

        conn.commit()

    conn.close()


def get_custom_rules(active_only: bool = False) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    if active_only:
        cursor.execute("SELECT * FROM custom_rules WHERE is_active = 1 ORDER BY id DESC")
    else:
        cursor.execute("SELECT * FROM custom_rules ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "field": r["field"],
            "operator": r["operator"],
            "threshold_value": r["threshold_value"],
            "reason_code": r["reason_code"],
            "risk_score_impact": r["risk_score_impact"],
            "is_active": bool(r["is_active"]),
            "created_at": r["created_at"]
        }
        for r in rows
    ]


def create_custom_rule(
    name: str,
    field: str,
    operator: str,
    threshold_value: float,
    reason_code: str,
    risk_score_impact: int
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO custom_rules (name, field, operator, threshold_value, reason_code, risk_score_impact, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    """, (name, field, operator, threshold_value, reason_code, risk_score_impact, now_str))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id


def toggle_custom_rule(rule_id: int, is_active: Optional[bool] = None) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    if is_active is None:
        cursor.execute("UPDATE custom_rules SET is_active = 1 - is_active WHERE id = ?", (rule_id,))
    else:
        cursor.execute("UPDATE custom_rules SET is_active = ? WHERE id = ?", (1 if is_active else 0, rule_id))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success


def delete_custom_rule(rule_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM custom_rules WHERE id = ?", (rule_id,))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success
