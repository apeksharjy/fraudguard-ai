const API_BASE = '';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Health check failed:', err);
    throw err;
  }
}

export async function scoreTransaction(data) {
  const res = await fetch(`${API_BASE}/api/transactions/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Transaction check failed with status ${res.status}`);
  }
  return await res.json();
}

export async function fetchTransactions({ risk_level, feedback_status, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (risk_level && risk_level !== 'all') params.append('risk_level', risk_level);
  if (feedback_status && feedback_status !== 'all') params.append('feedback_status', feedback_status);
  params.append('limit', limit);
  params.append('offset', offset);

  const res = await fetch(`${API_BASE}/api/transactions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load transaction history');
  return await res.json();
}

export async function submitFeedback(transactionId, userFeedback, notes = '') {
  const res = await fetch(`${API_BASE}/api/transactions/${transactionId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_feedback: userFeedback, notes })
  });
  if (!res.ok) throw new Error('Failed to submit user feedback');
  return await res.json();
}

export async function fetchMetricsSummary() {
  const res = await fetch(`${API_BASE}/api/metrics/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return await res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/api/model/metrics`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return await res.json();
}

export async function askAssistant({ prompt_key, custom_query, reason_codes = [], risk_level = 'low' }) {
  const res = await fetch(`${API_BASE}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt_key, custom_query, reason_codes, risk_level })
  });
  if (!res.ok) throw new Error('Failed to get assistant response');
  return await res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/api/demo/reset-seed`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo dataset');
  return await res.json();
}

export async function fetchPayPalConfig() {
  const res = await fetch(`${API_BASE}/api/paypal/config`);
  if (!res.ok) throw new Error('Failed to fetch PayPal configuration');
  return await res.json();
}

export async function savePayPalConfig(clientId, clientSecret, environment = 'sandbox') {
  const res = await fetch(`${API_BASE}/api/paypal/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      environment
    })
  });
  if (!res.ok) throw new Error('Failed to update PayPal credentials');
  return await res.json();
}

export async function createPayPalCheckoutOrder(payload) {
  const res = await fetch(`${API_BASE}/api/paypal/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'PayPal order creation failed');
  }
  return await res.json();
}

export async function capturePayPalOrder(orderId) {
  const res = await fetch(`${API_BASE}/api/paypal/capture-order/${orderId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to capture PayPal order');
  return await res.json();
}

