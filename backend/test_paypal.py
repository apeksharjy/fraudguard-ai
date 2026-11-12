from fastapi.testclient import TestClient
from app.main import app


def run_paypal_tests():
    with TestClient(app) as client:
        # 1. Config endpoint
        c = client.get("/api/paypal/config")
        assert c.status_code == 200
        print("[PASS] GET /api/paypal/config ->", c.json())

        # 2. Test Low Risk PayPal Checkout (should be APPROVED)
        req_low = {
            "amount": 45.0,
            "currency": "USD",
            "item_name": "Software License",
            "hour": 12,
            "new_device": False,
            "location_change": False,
            "transactions_last_10_min": 1
        }
        res_low = client.post("/api/paypal/create-order", json=req_low)
        assert res_low.status_code == 200
        data_low = res_low.json()
        print(f"[PASS] Low Risk PayPal Order -> Decision: {data_low['decision']}, Order ID: {data_low['order_id']}")
        assert data_low["decision"] == "approved"
        assert data_low["risk_level"] == "low"

        # 3. Test High Risk PayPal Checkout (should be INTERCEPTED by FraudGuard)
        req_high = {
            "amount": 18500.0,
            "currency": "USD",
            "item_name": "Luxury Electronics",
            "hour": 2,
            "new_device": True,
            "location_change": True,
            "transactions_last_10_min": 5
        }
        res_high = client.post("/api/paypal/create-order", json=req_high)
        assert res_high.status_code == 200
        data_high = res_high.json()
        print(f"[PASS] High Risk PayPal Order -> Decision: {data_high['decision']}, Reasons: {data_high['reason_codes']}")
        assert data_high["decision"] == "intercepted_high_risk"
        assert "UNUSUAL_AMOUNT" in data_high["reason_codes"]
        assert "NEW_DEVICE" in data_high["reason_codes"]

        # 4. Capture Order
        order_id = data_low["order_id"]
        cap_res = client.post(f"/api/paypal/capture-order/{order_id}")
        assert cap_res.status_code == 200
        print(f"[PASS] POST /api/paypal/capture-order/{order_id} -> Status: {cap_res.json()['status']}")

        print("\n==============================================")
        print("ALL PAYPAL BACKEND INTEGRATION TESTS PASSED!!")
        print("==============================================")


if __name__ == "__main__":
    run_paypal_tests()
