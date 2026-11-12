import React from 'react';
import { AlertTriangle, Lock, ShieldCheck } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12), rgba(99, 102, 241, 0.08))',
      borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
      padding: '0.6rem 1.5rem',
      fontSize: '0.8rem',
      color: '#fde68a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap',
      textAlign: 'center'
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#fbbf24' }}>
        <AlertTriangle size={15} />
        <span>SYNTHETIC DEMO PROTOTYPE:</span>
      </div>
      <span>
        Evaluates synthetic transaction signals only. Does not connect to live banks/UPI or execute money movement.
      </span>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#93c5fd', fontSize: '0.75rem' }}>
        <Lock size={13} />
        <span>Never share your UPI PIN, OTP, or CVV. Automated estimates cannot guarantee 100% fraud detection.</span>
      </div>
    </div>
  );
}
