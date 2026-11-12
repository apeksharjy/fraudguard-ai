from fastapi.testclient import TestClient
from app.main import app


def run_tests():
    with TestClient(app) as client:
        # 1. Health check
        r = client.get("/health")
        assert r.status_code == 200
        print("[PASS] GET /health ->", r.json())

        # 2. Score endpoint with exact illustrative example from Page 4 of PDF:
        # Amount: 18,500, hour: 2, new_device: true, location_change: true, transactions_last_10_min: 5
        tx_payload = {
            "amount": 18500,
            "hour": 2,
            "new_device": True,
            "location_change": True,
            "transactions_last_10_min": 5
        }
        res = client.post("/api/transactions/score", json=tx_payload)
        assert res.status_code == 200, f"Score failed: {res.text}"
        data = res.json()
        print(f"[PASS] POST /api/transactions/score -> Score: {data['risk_score']}, Band: {data['risk_level']}")
        print(f"  Reason codes: {data['reason_codes']}")
        print(f"  Recommended action: {data['recommended_action']}")
        assert data["risk_level"] == "high"
        assert "UNUSUAL_AMOUNT" in data["reason_codes"]
        assert "NEW_DEVICE" in data["reason_codes"]
        assert "RAPID_ATTEMPTS" in data["reason_codes"]

        # 3. Read history
        hist = client.get("/api/transactions")
        assert hist.status_code == 200
        txs = hist.json()
        assert len(txs) > 0
        print(f"[PASS] GET /api/transactions -> Retrieved {len(txs)} transactions")

        # 4. Save feedback
        tx_id = data["id"]
        fb = client.post(f"/api/transactions/{tx_id}/feedback", json={"user_feedback": "not_recognised"})
        assert fb.status_code == 200
        print(f"[PASS] POST /api/transactions/{tx_id}/feedback -> {fb.json()['user_feedback']}")

        # 5. Dashboard summary metrics
        metrics = client.get("/api/metrics/summary")
        assert metrics.status_code == 200
        m_data = metrics.json()
        print(f"[PASS] GET /api/metrics/summary -> Total: {m_data['total_checked']}, High: {m_data['high_risk_count']}, Feedback: {m_data['feedback_counts']}")

        # 6. ML Model evaluation metrics
        model_m = client.get("/api/model/metrics")
        assert model_m.status_code == 200
        print(f"[PASS] GET /api/model/metrics -> ROC-AUC: {model_m.json()['roc_auc']}, Recall: {model_m.json()['recall']}")

        # 7. Smart Assistant Chat
        chat = client.post("/api/assistant/chat", json={
            "prompt_key": "why_flagged",
            "reason_codes": data["reason_codes"],
            "risk_level": data["risk_level"]
        })
        assert chat.status_code == 200
        print(f"[PASS] POST /api/assistant/chat -> Answer: {chat.json()['answer'][:100]}...")

        # 8. Invalid input validation test (negative amount)
        inv = client.post("/api/transactions/score", json={"amount": -50, "hour": 25})
        assert inv.status_code == 422
        print("[PASS] Input validation test: Rejected invalid amount/hour with status 422")

        print("\n=========================================")
        print("ALL 8 END-TO-END BACKEND TESTS PASSED!!")
        print("=========================================")


if __name__ == "__main__":
    run_tests()
