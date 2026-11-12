import os
from typing import List, Dict, Any, Optional
# pyrefly: ignore[missing-import]
import httpx
from .models import AssistantChatResponse, LLMConfigResponse

# In-memory runtime LLM configuration
_LLM_CONFIG = {
    "provider": os.getenv("LLM_PROVIDER", "gemini"),
    "api_key": os.getenv("GEMINI_API_KEY", os.getenv("OPENAI_API_KEY", ""))
}


def get_llm_config() -> LLMConfigResponse:
    provider = _LLM_CONFIG["provider"]
    key = _LLM_CONFIG["api_key"]
    is_conf = bool(key and len(key.strip()) > 5)
    preview = f"{key[:4]}...{key[-4:]}" if is_conf else "Not Configured"
    msg = (
        f"Active: {provider.upper()} Dynamic AI Assistant"
        if is_conf else
        "Using Grounded Deterministic Template Assistant (Add Gemini/OpenAI key for conversational LLM mode)"
    )
    return LLMConfigResponse(
        provider=provider,
        is_configured=is_conf,
        key_preview=preview,
        status_message=msg
    )


def update_llm_config(provider: str, api_key: str):
    global _LLM_CONFIG
    _LLM_CONFIG["provider"] = provider.lower().strip()
    _LLM_CONFIG["api_key"] = api_key.strip()


async def query_llm_api(system_prompt: str, user_prompt: str) -> Optional[str]:
    key = _LLM_CONFIG["api_key"].strip()
    provider = _LLM_CONFIG["provider"]
    if not key:
        return None

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            if provider == "gemini":
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
                full_text = f"{system_prompt}\n\nUser Question:\n{user_prompt}"
                resp = await client.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json={"contents": [{"parts": [{"text": full_text}]}]}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
                else:
                    print(f"Gemini API error: {resp.status_code} - {resp.text}")

            elif provider == "openai":
                url = "https://api.openai.com/v1/chat/completions"
                resp = await client.post(
                    url,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {key}"
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.4,
                        "max_tokens": 400
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "").strip()
                else:
                    print(f"OpenAI API error: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"LLM API Exception: {e}")

    return None


REASON_EXPLANATION_MAP = {
    "UNUSUAL_AMOUNT": "The transaction amount is above the demo review threshold.",
    "NEW_DEVICE": "This demo transaction is marked as originating from a new or unrecognized device.",
    "LOCATION_CHANGE": "The transaction location differs from the demo user's usual spending pattern.",
    "RAPID_ATTEMPTS": "Several transactions occurred in a short 10-minute window (rapid velocity).",
    "ODD_HOURS": "The transaction occurred during unusual overnight hours (midnight to 4 AM)."
}

RECOMMENDED_ACTION_MAP = {
    "high": "Pause and verify through your official payment or banking app before proceeding. Do not approve unexpected prompts.",
    "medium": "Review transaction details carefully. Verify recent activities in your banking app.",
    "low": "Transaction displays standard baseline characteristics. Proceed with routine vigilance."
}


def compose_assistant_summary(reason_codes: List[str], risk_level: str) -> str:
    """
    Composes grounded plain-language explanation strictly from returned reason codes.
    Matches Section 9 of the specification.
    """
    if not reason_codes:
        if risk_level == "low":
            return (
                "This demo transaction showed no high-risk anomalies according to configured demo rules. "
                "However, this is an automated estimate and cannot confirm that a transaction is 100% safe. "
                "Always verify payment recipients through official channels. Never share your PIN or OTP."
            )
        return (
            "This demo transaction showed moderate behavioral variance. "
            "Please double check the recipient and amount before completing payment."
        )

    # Convert reason codes to human phrases
    phrases = []
    for code in reason_codes:
        if code == "UNUSUAL_AMOUNT":
            phrases.append("an unusually high amount")
        elif code == "NEW_DEVICE":
            phrases.append("an unrecognized new device")
        elif code == "LOCATION_CHANGE":
            phrases.append("a sudden location change")
        elif code == "RAPID_ATTEMPTS":
            phrases.append("several rapid payment attempts in a short time")
        elif code == "ODD_HOURS":
            phrases.append("unusual nocturnal hours")
        else:
            phrases.append(code.lower().replace("_", " "))

    joined_phrases = " and ".join(phrases) if len(phrases) <= 2 else ", ".join(phrases[:-1]) + f", and {phrases[-1]}"

    return (
        f"This demo transaction was flagged because it involves {joined_phrases}. "
        f"I cannot confirm whether it is fraud. Pause and verify the payment in your official "
        f"bank or payment app. Never share your PIN, OTP, or passwords."
    )


async def handle_assistant_prompt(
    prompt_key: Optional[str],
    custom_query: Optional[str],
    reason_codes: List[str],
    risk_level: str
) -> AssistantChatResponse:
    """
    Handles suggested prompts and user queries with strict grounding on reason codes and safety guardrails.
    """
    query_str = (custom_query or "").lower().strip()
    grounded_reasons = [
        REASON_EXPLANATION_MAP[code] for code in reason_codes if code in REASON_EXPLANATION_MAP
    ]

    action_checklist = [
        "Open your official bank or UPI app independently (do not tap unsolicited SMS links).",
        "Check your official transaction statement to verify if money was actually debited.",
        "Ensure your mobile number and email alerts are active for all digital accounts.",
        "Never share your UPI PIN, ATM PIN, OTP, card CVV, or net-banking passwords with anyone."
    ]

    disclaimer = (
        "SAFETY NOTICE: This smart assistant provides guidance for demonstration only. "
        "It cannot verify bank records, cancel transfers, or confirm fraud. "
        "Never disclose credentials, PINs, or OTPs."
    )

    # Dynamic LLM Query (if API key configured and custom query asked)
    if custom_query and _LLM_CONFIG["api_key"]:
        sys_prompt = (
            "You are FraudGuard AI, a helpful digital payment safety assistant. "
            f"Current transaction evaluated: Risk Level: {risk_level.upper()}, "
            f"Reason Codes: {', '.join(reason_codes) if reason_codes else 'No anomalies triggered'}. "
            "Safety Instructions: Answer the user's question concisely (under 120 words). "
            "Do NOT hallucinate bank partnerships or claim 100% fraud proof. "
            "NEVER ask for or accept OTPs, PINs, passwords, or CVVs. "
            "Guide the user to verify safely via official payment apps."
        )
        llm_reply = await query_llm_api(sys_prompt, custom_query)
        if llm_reply:
            return AssistantChatResponse(
                answer=f"🤖 [AI Assistant Analysis]\n\n{llm_reply}",
                grounded_reasons=grounded_reasons,
                action_checklist=action_checklist,
                safety_disclaimer=disclaimer
            )

    # Question: "Why was this flagged?"
    if prompt_key == "why_flagged" or "why" in query_str or "flag" in query_str or "reason" in query_str:
        if not reason_codes:
            ans = (
                "This transaction was evaluated with low risk and did not trigger anomaly rules. "
                "All signals (device, location frequency, velocity, and amount) remained within demo bounds."
            )
        else:
            reasons_text = "\n".join([f"• {r}" for r in grounded_reasons])
            ans = (
                f"This demo transaction was flagged based on the following specific security signals:\n\n"
                f"{reasons_text}\n\n"
                f"These signals suggest deviation from typical behavioral baselines. "
                f"As an AI safety assistant, I estimate risk but cannot make a definitive claim of fraud. "
                f"Please verify via your official payment app."
            )

    # Question: "What should I check?"
    elif prompt_key == "what_to_check" or "check" in query_str or "verify" in query_str or "what should" in query_str:
        ans = (
            "Here is what you should check immediately before taking any action:\n\n"
            "1. Payee Identity: Verify the recipient name matches the person or business you intended to pay.\n"
            "2. Amount Accuracy: Confirm decimal places and total amount in your official app summary.\n"
            "3. Device Security: If you did not initiate this from your phone/browser, secure your account.\n"
            "4. Authentication: Ensure you are entering credentials strictly on a recognized, verified banking screen."
        )

    # Question: "How do I report a suspicious payment safely?"
    elif prompt_key == "how_to_report" or "report" in query_str or "suspicious" in query_str or "police" in query_str:
        ans = (
            "To report a suspicious payment safely:\n\n"
            "1. Call your bank's official 24x7 customer care number found on the back of your debit/credit card.\n"
            "2. Temporarily lock or freeze your card/net-banking using the official mobile banking app.\n"
            "3. In India/designated regions, report cyber fraud at the official National Cyber Crime portal (cybercrime.gov.in) or dial 1930.\n"
            "4. Note the transaction reference ID, date, and time for official dispute filing.\n\n"
            "Remember: Official bank staff will NEVER ask for your PIN, OTP, or CVV."
        )

    else:
        # Default grounded response
        summary = compose_assistant_summary(reason_codes, risk_level)
        ans = (
            f"{summary}\n\n"
            f"Key guidance:\n"
            f"- Verify the recipient directly before authenticating payment.\n"
            f"- Contact official bank support if you do not recognize this activity."
        )

    return AssistantChatResponse(
        answer=ans,
        grounded_reasons=grounded_reasons,
        action_checklist=action_checklist,
        safety_disclaimer=disclaimer
    )
