import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  MessageSquare, 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  Info,
  Check,
  Sparkles,
  Lock
} from 'lucide-react';
import { submitFeedback } from '../api/client';

export default function RiskResultCard({ 
  result, 
  onBackToForm, 
  onOpenAssistant,
  onFeedbackSaved
}) {
  const [feedbackStatus, setFeedbackStatus] = useState(result.user_feedback || null);
  const [isSubmittingFb, setIsSubmittingFb] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');

  const score = result.risk_score || 0;
  const level = result.risk_level || 'low';
  const reasonCodes = result.reason_codes || [];
  const recAction = result.recommended_action || 'Pause and verify through your official payment app.';
  const uncertainty = result.uncertainty_text || 'This is an automated demo risk estimate; it cannot confirm fraud.';

  // Color & Gauge config
  const isHigh = level === 'high';
  const isMed = level === 'medium';
  const badgeColor = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';
  const badgeBg = isHigh ? 'var(--risk-high-bg)' : isMed ? 'var(--risk-med-bg)' : 'var(--risk-low-bg)';
  const badgeBorder = isHigh ? 'var(--risk-high-border)' : isMed ? 'var(--risk-med-border)' : 'var(--risk-low-border)';

  // Calculate circular stroke offset (circumference = 2 * PI * r = 2 * 3.14159 * 54 = 339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleFeedback = async (choice) => {
    if (!result.id) return;
    setIsSubmittingFb(true);
    try {
      await submitFeedback(result.id, choice);
      setFeedbackStatus(choice);
      setFeedbackSuccessMsg(`Saved as "${choice.replace('_', ' ')}". Recorded for audit review.`);
      if (onFeedbackSaved) onFeedbackSaved(result.id, choice);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmittingFb(false);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={onBackToForm} className="btn-secondary">
          <ArrowLeft size={16} />
          Check Another Transaction
        </button>

        <button 
          onClick={() => onOpenAssistant(result)}
          className="btn-primary"
          id="btn-open-assistant"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)' }}
        >
          <MessageSquare size={18} />
          Ask Smart Assistant
        </button>
      </div>

      {/* Uncertainty Notice Box (PDF Screen C requirement) */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.85rem',
        color: '#c7d2fe'
      }}>
        <Info size={20} color="#818cf8" style={{ flexShrink: 0 }} />
        <div>
          <strong>Uncertainty Text:</strong> {uncertainty}
        </div>
      </div>

      {/* Main Score & Action Card */}
      <div className="glass-panel" style={{
        padding: '2rem',
        border: `1px solid ${badgeBorder}`,
        boxShadow: `0 8px 32px ${isHigh ? 'var(--risk-high-glow)' : isMed ? 'var(--risk-med-glow)' : 'var(--risk-low-glow)'}`
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          
          {/* Left: Animated Score Gauge & Band */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                {/* Background Track */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="10"
                />
                {/* Animated Indicator Track */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="transparent"
                  stroke={badgeColor}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>

              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  {score}
                </span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  out of 100
                </span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className={`risk-badge ${level}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                  {isHigh ? <Flame size={16} /> : isMed ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  {level.toUpperCase()} RISK
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '320px' }}>
                {isHigh 
                  ? 'Strong anomaly indicators detected. Immediate verification recommended.' 
                  : isMed 
                    ? 'Elevated behavior signature differing from baseline patterns.' 
                    : 'Behavior aligns with typical low-risk routine transactions.'}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                ML Probability: {Math.round((result.ml_probability || (score / 100)) * 100)}% | Anomaly Score: {score}/100
              </div>
            </div>
          </div>

          {/* Right: Recommended Safe Action Box */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
              <Lock size={15} color="#818cf8" />
              <span>RECOMMENDED SAFETY ACTION:</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', lineHeight: '1.4' }}>
              &ldquo;{recAction}&rdquo;
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Safety Protocol: Do not authorize if recipient or amount is unfamiliar. Verify directly on your banking app.
            </p>
          </div>

        </div>
      </div>

      {/* Transparent Reason-Code Breakdown */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#818cf8" />
          Transparent Reason Codes & Signals
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Configured rule signals contributing to this automated risk estimate
        </p>

        {reasonCodes.length === 0 ? (
          <div style={{ padding: '1rem', background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)', borderRadius: '10px', color: '#34d399', fontSize: '0.85rem' }}>
            ✓ No anomaly rules triggered. All parameters (amount, hour, device, location, velocity) are within baseline bounds.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {reasonCodes.map((code, idx) => {
              let label = code;
              let desc = '';
              if (code === 'UNUSUAL_AMOUNT') {
                label = 'UNUSUAL_AMOUNT';
                desc = 'Amount is above the demo review threshold.';
              } else if (code === 'NEW_DEVICE') {
                label = 'NEW_DEVICE';
                desc = 'This demo transaction is marked as using a new device.';
              } else if (code === 'LOCATION_CHANGE') {
                label = 'LOCATION_CHANGE';
                desc = 'Location differs from the demo\'s usual pattern.';
              } else if (code === 'RAPID_ATTEMPTS') {
                label = 'RAPID_ATTEMPTS';
                desc = 'Several transactions occurred in a short period.';
              } else if (code === 'ODD_HOURS') {
                label = 'ODD_HOURS';
                desc = 'Transaction initiated during nocturnal dormancy hours.';
              }

              return (
                <div key={idx} style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span className="reason-pill">
                      <AlertTriangle size={12} />
                      {label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {desc}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assistant Explanation preview */}
        {result.assistant_explanation && (
          <div style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            background: 'rgba(99, 102, 241, 0.06)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MessageSquare size={13} />
              <span>ASSISTANT PLAIN-LANGUAGE SUMMARY</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              &ldquo;{result.assistant_explanation}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Screen E Feedback Section on Result */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Record User Feedback (Review Flag)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              In the prototype, feedback is for demonstration and review—not automatic proof that a transaction was fraud.
            </p>
          </div>
          {feedbackSuccessMsg && (
            <div style={{ fontSize: '0.8rem', color: '#34d399', background: 'var(--risk-low-bg)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--risk-low-border)' }}>
              ✓ {feedbackSuccessMsg}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          <button
            onClick={() => handleFeedback('recognised')}
            disabled={isSubmittingFb}
            className="btn-secondary"
            style={{
              borderColor: feedbackStatus === 'recognised' ? '#10b981' : 'var(--border-subtle)',
              background: feedbackStatus === 'recognised' ? 'var(--risk-low-bg)' : 'transparent',
              color: feedbackStatus === 'recognised' ? '#34d399' : 'var(--text-primary)',
              fontWeight: 600
            }}
          >
            <ThumbsUp size={16} color={feedbackStatus === 'recognised' ? '#10b981' : 'currentColor'} />
            Recognised by User
          </button>

          <button
            onClick={() => handleFeedback('not_recognised')}
            disabled={isSubmittingFb}
            className="btn-secondary"
            style={{
              borderColor: feedbackStatus === 'not_recognised' ? '#ef4444' : 'var(--border-subtle)',
              background: feedbackStatus === 'not_recognised' ? 'var(--risk-high-bg)' : 'transparent',
              color: feedbackStatus === 'not_recognised' ? '#f87171' : 'var(--text-primary)',
              fontWeight: 600
            }}
          >
            <ThumbsDown size={16} color={feedbackStatus === 'not_recognised' ? '#ef4444' : 'currentColor'} />
            Not Recognised (Suspicious)
          </button>

          <button
            onClick={() => handleFeedback('unsure')}
            disabled={isSubmittingFb}
            className="btn-secondary"
            style={{
              borderColor: feedbackStatus === 'unsure' ? '#f59e0b' : 'var(--border-subtle)',
              background: feedbackStatus === 'unsure' ? 'var(--risk-med-bg)' : 'transparent',
              color: feedbackStatus === 'unsure' ? '#fbbf24' : 'var(--text-primary)',
              fontWeight: 600
            }}
          >
            <HelpCircle size={16} color={feedbackStatus === 'unsure' ? '#f59e0b' : 'currentColor'} />
            Unsure / Need Review
          </button>

        </div>
      </div>

    </div>
  );
}
