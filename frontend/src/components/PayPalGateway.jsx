import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  RefreshCw, 
  Info,
  DollarSign,
  ChevronRight,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { 
  fetchPayPalConfig, 
  savePayPalConfig, 
  createPayPalCheckoutOrder, 
  capturePayPalOrder 
} from '../api/client';

export default function PayPalGateway({ onOpenAssistant, onInspectTransaction }) {
  const [config, setConfig] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [envInput, setEnvInput] = useState('sandbox');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Checkout Form State
  const [itemName, setItemName] = useState('Cloud Server Subscription');
  const [amount, setAmount] = useState('49.99');
  const [currency, setCurrency] = useState('USD');
  const [newDevice, setNewDevice] = useState(false);
  const [locationChange, setLocationChange] = useState(false);
  const [hour, setHour] = useState(14);
  const [velocity, setVelocity] = useState(1);
  const [bypassCheck, setBypassCheck] = useState(false);

  // Evaluation & Order State
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [capturedData, setCapturedData] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await fetchPayPalConfig();
      setConfig(data);
    } catch (err) {
      console.error('Error fetching PayPal config:', err);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await savePayPalConfig(clientIdInput, clientSecretInput, envInput);
      setConfig(res.config);
      setSaveSuccessMsg('PayPal credentials updated successfully!');
      setTimeout(() => {
        setSaveSuccessMsg('');
        setShowConfigModal(false);
      }, 1500);
    } catch (err) {
      alert('Failed to save PayPal credentials');
    }
  };

  const handleApplyPreset = (type) => {
    if (type === 'safe') {
      setItemName('Verified Coffee & Book Order');
      setAmount('18.50');
      setNewDevice(false);
      setLocationChange(false);
      setHour(11);
      setVelocity(1);
      setBypassCheck(false);
      setCheckoutResult(null);
      setCapturedData(null);
    } else if (type === 'moderate') {
      setItemName('Smart Home Assistant Device');
      setAmount('249.00');
      setNewDevice(true);
      setLocationChange(false);
      setHour(16);
      setVelocity(2);
      setBypassCheck(false);
      setCheckoutResult(null);
      setCapturedData(null);
    } else if (type === 'suspicious') {
      setItemName('Bulk High-End Electronics Order');
      setAmount('18500.00');
      setNewDevice(true);
      setLocationChange(true);
      setHour(2);
      setVelocity(5);
      setBypassCheck(false);
      setCheckoutResult(null);
      setCapturedData(null);
    }
  };

  const handlePayPalCheckout = async (forceBypass = false) => {
    setIsProcessing(true);
    setCapturedData(null);
    try {
      const payload = {
        amount: parseFloat(amount),
        currency,
        item_name: itemName,
        hour: parseInt(hour, 10),
        new_device: Boolean(newDevice),
        location_change: Boolean(locationChange),
        transactions_last_10_min: parseInt(velocity, 10),
        bypass_risk_check: forceBypass || bypassCheck
      };

      const result = await createPayPalCheckoutOrder(payload);
      setCheckoutResult(result);
    } catch (err) {
      console.error('PayPal checkout error:', err);
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapturePayment = async (orderId) => {
    setIsCapturing(true);
    try {
      const res = await capturePayPalOrder(orderId);
      setCapturedData(res);
    } catch (err) {
      alert(`Failed to capture PayPal order: ${err.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        background: 'radial-gradient(ellipse at top left, rgba(0, 121, 193, 0.18), transparent 70%), rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(0, 121, 193, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{
              background: '#003087',
              color: '#ffffff',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.75rem',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.05em'
            }}>
              PayPal
            </div>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>
              API GATEWAY + FRAUDGUARD PRE-SCREENING
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            PayPal Smart Payment Gateway
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '720px', lineHeight: '1.5' }}>
            Connects to the <strong>PayPal REST API v2 Orders</strong>. Pre-screens payment attempts with FraudGuard AI: safely intercepts high-risk anomalies before money movement, or creates authorized PayPal orders for verified transactions.
          </p>
        </div>

        {/* Configuration Button & Mode Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            background: config?.is_configured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
            border: config?.is_configured ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(6, 182, 212, 0.35)',
            color: config?.is_configured ? '#34d399' : '#38bdf8',
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: config?.is_configured ? '#10b981' : '#06b6d4' }} />
            {config?.mode_description || 'Loading status...'}
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
          >
            <Key size={14} color="#f59e0b" />
            Configure PayPal API Credentials
          </button>
        </div>
      </div>

      {/* Modal for Custom PayPal Credentials */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 16, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="#f59e0b" />
              PayPal Developer API Credentials
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Add your PayPal Sandbox Client ID & Secret to make live OAuth2 calls to <code>https://api-m.sandbox.paypal.com</code>. Leaving them blank keeps the built-in Sandbox Simulation active.
            </p>

            {saveSuccessMsg && (
              <div style={{ background: 'var(--risk-low-bg)', color: '#34d399', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ✓ {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  PayPal Client ID
                </label>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="e.g. A21AAJ..."
                  className="input-field"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  PayPal Client Secret
                </label>
                <input
                  type="password"
                  value={clientSecretInput}
                  onChange={(e) => setClientSecretInput(e.target.value)}
                  placeholder="e.g. EK8x..."
                  className="input-field"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Environment Mode
                </label>
                <select
                  value={envInput}
                  onChange={(e) => setEnvInput(e.target.value)}
                  className="input-field"
                >
                  <option value="sandbox">Sandbox (Recommended for Testing)</option>
                  <option value="live">Live (Requires Authorized Production Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Checkout Form & Live Interceptor Result */}
      <div className="grid-cols-2">
        
        {/* Left Column: PayPal Order Form & Pre-screening Parameters */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Interactive Checkout Simulator</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Test PayPal payment generation with real-time AI security gate
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                type="button"
                onClick={() => handleApplyPreset('safe')}
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem', borderRadius: '6px', background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)', color: '#34d399', cursor: 'pointer' }}
              >
                Safe $18.50
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('suspicious')}
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem', borderRadius: '6px', background: 'var(--risk-high-bg)', border: '1px solid var(--risk-high-border)', color: '#f87171', cursor: 'pointer' }}
              >
                High Risk $18.5k
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Purchase Item Description
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="input-field"
              placeholder="e.g. Digital Game Pass"
            />
          </div>

          {/* Amount & Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Payment Amount
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <DollarSign size={16} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>

          {/* Behavioral Signals */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              PAYMENT CONTEXT SIGNALS:
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem' }}>Unrecognized Device</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={newDevice}
                  onChange={(e) => setNewDevice(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem' }}>Location Anomaly</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={locationChange}
                  onChange={(e) => setLocationChange(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem' }}>Attempts in last 10m: <strong>{velocity}</strong></span>
              <input
                type="range"
                min="1"
                max="10"
                value={velocity}
                onChange={(e) => setVelocity(parseInt(e.target.value, 10))}
                style={{ width: '120px', accentColor: velocity >= 4 ? '#ef4444' : 'var(--primary)' }}
              />
            </div>
          </div>

          {/* PayPal Checkout Button (Styled with official PayPal gold & blue) */}
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={() => handlePayPalCheckout(false)}
              disabled={isProcessing}
              style={{
                width: '100%',
                background: 'linear-gradient(180deg, #ffc439 0%, #ffb300 100%)',
                color: '#003087',
                border: 'none',
                borderRadius: '24px',
                padding: '0.85rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 4px 15px rgba(255, 196, 57, 0.35)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid #003087', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  FraudGuard Pre-screening Payment...
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.03em' }}>
                    Pay<span style={{ color: '#0079c1' }}>Pal</span>
                  </span>
                  <span>| Safe Checkout with AI Guard</span>
                </>
              )}
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Protected by FraudGuard AI Risk Evaluation &bull; Real-time Anomaly Interception
            </div>
          </div>

        </div>

        {/* Right Column: Gateway Pre-screening Result & Order Capture */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#06b6d4" />
                Live Pre-screening Outcome
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {checkoutResult ? `Risk: ${checkoutResult.risk_score}/100` : 'Awaiting checkout action'}
              </span>
            </div>

            {!checkoutResult ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                <CreditCard size={44} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  No Payment Initiated Yet
                </h4>
                <p style={{ fontSize: '0.85rem', maxWidth: '340px', margin: '0 auto' }}>
                  Click the <strong>PayPal Safe Checkout</strong> button on the left to test live anomaly screening and order creation.
                </p>
              </div>
            ) : checkoutResult.decision === 'intercepted_high_risk' ? (
              /* High Risk Intercepted Banner */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{
                  background: 'var(--risk-high-bg)',
                  border: '1px solid var(--risk-high-border)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Flame size={22} color="#ef4444" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className="risk-badge high">HIGH RISK ({checkoutResult.risk_score}/100)</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171' }}>ORDER PAUSED</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                      Payment Intercepted Before Money Movement!
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: '1.5' }}>
                      {checkoutResult.message}
                    </p>
                  </div>
                </div>

                {/* Reason Codes */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    TRIGGERED SECURITY SIGNALS:
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {checkoutResult.reason_codes?.map((rc, i) => (
                      <span key={i} className="reason-pill">
                        <AlertTriangle size={12} />
                        {rc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Safety Action */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.2rem' }}>
                    RECOMMENDED SAFETY PROTOCOL:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                    &ldquo;{checkoutResult.recommended_action}&rdquo;
                  </div>
                </div>

                {/* Actions: Ask Assistant or Force Proceed */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => onOpenAssistant({
                      amount: parseFloat(amount),
                      risk_score: checkoutResult.risk_score,
                      risk_level: checkoutResult.risk_level,
                      reason_codes: checkoutResult.reason_codes,
                      assistant_explanation: checkoutResult.recommended_action
                    })}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)', fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
                  >
                    <MessageSquare size={16} />
                    Consult Safety Assistant
                  </button>

                  <button
                    onClick={() => handlePayPalCheckout(true)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.55rem 0.9rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                  >
                    Authorize &amp; Override (Demo Test)
                  </button>
                </div>

              </div>
            ) : (
              /* Approved PayPal Order Display */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{
                  background: 'var(--risk-low-bg)',
                  border: '1px solid var(--risk-low-border)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={24} color="#10b981" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="risk-badge low">{checkoutResult.risk_level} Risk ({checkoutResult.risk_score}/100)</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>APPROVED BY FRAUDGUARD</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Signals verified within standard baseline parameters. Order created on PayPal REST API.
                    </div>
                  </div>
                </div>

                {/* PayPal Order Metadata Box */}
                <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>PayPal Order ID:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{checkoutResult.order_id}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                    <span style={{ color: '#34d399', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{checkoutResult.status}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Backend Mode:</span>
                    <span>{checkoutResult.is_live_sandbox ? 'PayPal Live Sandbox' : 'PayPal Sandbox Simulation'}</span>
                  </div>
                </div>

                {/* Capture Payment Step */}
                {!capturedData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleCapturePayment(checkoutResult.order_id)}
                      disabled={isCapturing}
                      className="btn-primary"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                        width: '100%',
                        justifyContent: 'center'
                      }}
                    >
                      {isCapturing ? (
                        <>
                          <span className="animate-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                          Capturing via PayPal API...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          Capture Payment (Execute PayPal Transfer)
                        </>
                      )}
                    </button>

                    {checkoutResult.approval_url && (
                      <a
                        href={checkoutResult.approval_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          textAlign: 'center',
                          fontSize: '0.8rem',
                          color: '#38bdf8',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>Open PayPal Sandbox Approval Page</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textAlign: 'center'
                  }}>
                    <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
                      Payment Captured Successfully!
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#a7f3d0', fontFamily: 'var(--font-mono)' }}>
                      Capture ID: {capturedData.capture_id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      Transaction recorded in persistent SQLite audit log.
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={13} color="#818cf8" />
            <span>Never exposes merchant client secret to client-side code. All evaluations run server-side.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
