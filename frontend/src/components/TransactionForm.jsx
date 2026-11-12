import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Smartphone, 
  MapPin, 
  Flame, 
  RotateCcw, 
  Send, 
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';

const PRESETS = [
  {
    name: 'Suspicious Midnight Burst',
    badge: 'High Risk (PDF Demo)',
    badgeColor: '#ef4444',
    amount: 18500,
    hour: 2,
    new_device: true,
    location_change: true,
    transactions_last_10_min: 5,
    description: 'Exact scenario from project spec: $18,500 at 2 AM from new device with 5 rapid attempts.'
  },
  {
    name: 'Normal Daytime Grocery',
    badge: 'Low Risk',
    badgeColor: '#10b981',
    amount: 45,
    hour: 11,
    new_device: false,
    location_change: false,
    transactions_last_10_min: 1,
    description: 'Typical routine coffee/groceries during regular morning hours from trusted phone.'
  },
  {
    name: 'New Device Gadget Purchase',
    badge: 'Medium Risk',
    badgeColor: '#f59e0b',
    amount: 1400,
    hour: 14,
    new_device: true,
    location_change: false,
    transactions_last_10_min: 1,
    description: 'Moderately sized afternoon purchase from a newly upgraded laptop or tablet.'
  },
  {
    name: 'Rapid Multi-Location Carding',
    badge: 'High Risk',
    badgeColor: '#ef4444',
    amount: 920,
    hour: 23,
    new_device: true,
    location_change: true,
    transactions_last_10_min: 7,
    description: 'Multiple rapid automated authorizations firing across distant locations.'
  }
];

export default function TransactionForm({ onSubmit, isLoading }) {
  const [amount, setAmount] = useState('18500');
  const [hour, setHour] = useState(2);
  const [newDevice, setNewDevice] = useState(true);
  const [locationChange, setLocationChange] = useState(true);
  const [velocity, setVelocity] = useState(5);
  const [errorMsg, setErrorMsg] = useState('');

  const applyPreset = (preset) => {
    setAmount(String(preset.amount));
    setHour(preset.hour);
    setNewDevice(preset.new_device);
    setLocationChange(preset.location_change);
    setVelocity(preset.transactions_last_10_min);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid positive payment amount greater than $0.');
      return;
    }
    if (parsedAmount > 10000000) {
      setErrorMsg('Amount exceeds demo limit ($10,000,000).');
      return;
    }

    setErrorMsg('');
    onSubmit({
      amount: parsedAmount,
      hour: parseInt(hour, 10),
      new_device: Boolean(newDevice),
      location_change: Boolean(locationChange),
      transactions_last_10_min: parseInt(velocity, 10)
    });
  };

  const formatHour = (h) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${period} (${String(h).padStart(2, '0')}:00)`;
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Info */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Check a Demo Transaction
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Screen B: Provide fictional transaction signals to simulate risk scoring & explainability.
            </p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', color: '#818cf8' }}>
            <Info size={14} />
            <span>Fictional inputs only. No real money or credentials used.</span>
          </div>
        </div>

        {/* Quick Presets Picker */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} color="#818cf8" />
            <span>QUICK PRESET SCENARIOS (CLICK TO TEST):</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.85rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: `${p.badgeColor}20`, color: p.badgeColor, fontWeight: 700 }}>
                    {p.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          
          {/* Field 1: Amount */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Transaction Amount ($ USD demo)
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <DollarSign size={18} />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 18500"
                className="input-field"
                id="input-amount"
                style={{ paddingLeft: '2.5rem', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600 }}
                required
              />
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Amounts &gt; $15,000 trigger the UNUSUAL_AMOUNT demo review rule.
            </p>
          </div>

          {/* Field 2: Hour of Day */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Hour of Day (24-Hour Clock)
              </label>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {formatHour(hour)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value, 10))}
              id="input-hour"
              style={{
                width: '100%',
                accentColor: 'var(--primary)',
                height: '8px',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              <span>00:00 (Midnight)</span>
              <span>12:00 (Noon)</span>
              <span>23:00 (Night)</span>
            </div>
          </div>

          {/* Field 3: Recent Transaction Velocity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Transactions in Last 10 Minutes
              </label>
              <span style={{ fontSize: '0.85rem', color: velocity >= 4 ? '#f87171' : '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {velocity} attempt{velocity > 1 ? 's' : ''}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={velocity}
              onChange={(e) => setVelocity(parseInt(e.target.value, 10))}
              id="input-velocity"
              style={{
                width: '100%',
                accentColor: velocity >= 4 ? '#ef4444' : 'var(--primary)',
                height: '8px',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              &ge; 4 attempts triggers the RAPID_ATTEMPTS velocity signal.
            </p>
          </div>

        </div>

        {/* Toggles Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          
          {/* Toggle 1: New Device */}
          <div style={{
            background: newDevice ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            border: newDevice ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: newDevice ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={18} color={newDevice ? '#818cf8' : 'var(--text-muted)'} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>New / Unrecognized Device</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Flagged as NEW_DEVICE signal</div>
              </div>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={newDevice}
                onChange={(e) => setNewDevice(e.target.checked)}
                id="toggle-new-device"
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Toggle 2: Location Change */}
          <div style={{
            background: locationChange ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            border: locationChange ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: locationChange ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color={locationChange ? '#06b6d4' : 'var(--text-muted)'} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Location Change Detected</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Flagged as LOCATION_CHANGE signal</div>
              </div>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={locationChange}
                onChange={(e) => setLocationChange(e.target.checked)}
                id="toggle-location-change"
              />
              <span className="toggle-slider" />
            </label>
          </div>

        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="button"
            onClick={() => applyPreset(PRESETS[1])}
            className="btn-secondary"
            disabled={isLoading}
          >
            <RotateCcw size={16} />
            Reset to Normal
          </button>

          <button
            type="submit"
            className="btn-primary"
            id="btn-submit-score"
            disabled={isLoading}
            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
          >
            {isLoading ? (
              <>
                <span className="animate-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                Evaluating Signals...
              </>
            ) : (
              <>
                <Send size={16} />
                Calculate Risk & Explain
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
