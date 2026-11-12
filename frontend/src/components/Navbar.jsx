import React from 'react';
import { ShieldAlert, Activity, FileText, Database, HelpCircle, RefreshCw, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus, onResetData }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{ padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldAlert size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FraudGuard AI
              </span>
              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 700, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                PROTOTYPE
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              AI Fraud Detection & Smart Payment Safety Assistant
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(17, 24, 39, 0.7)', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              background: activeTab === 'dashboard' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'dashboard' ? '#fff' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            <Activity size={16} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('check')}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              background: activeTab === 'check' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'check' ? '#fff' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            <ShieldAlert size={16} />
            Check Transaction
          </button>

          <button
            onClick={() => setActiveTab('paypal')}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              background: activeTab === 'paypal' ? 'linear-gradient(135deg, #003087, #0079c1)' : 'transparent',
              color: activeTab === 'paypal' ? '#fff' : 'var(--text-secondary)',
              border: activeTab === 'paypal' ? '1px solid rgba(0, 121, 193, 0.5)' : 'none'
            }}
          >
            <span style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '0.9rem', color: activeTab === 'paypal' ? '#ffc439' : '#38bdf8' }}>P</span>
            PayPal Gateway
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'history' ? '#fff' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            <Database size={16} />
            History & Feedback
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              background: activeTab === 'model' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'model' ? '#fff' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            <Cpu size={16} />
            ML Model Metrics
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              background: activeTab === 'guide' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'guide' ? '#38bdf8' : 'var(--text-secondary)',
              border: activeTab === 'guide' ? '1px solid rgba(6, 182, 212, 0.4)' : 'none'
            }}
          >
            <HelpCircle size={16} />
            Demo Script
          </button>
        </nav>

        {/* Backend Status indicator & Reseed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            background: backendStatus ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: backendStatus ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: backendStatus ? '#34d399' : '#f87171'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendStatus ? '#10b981' : '#ef4444',
              display: 'inline-block',
              boxShadow: backendStatus ? '0 0 8px #10b981' : '0 0 8px #ef4444'
            }} />
            {backendStatus ? 'FastAPI Connected' : 'Backend Offline'}
          </div>

          <button
            onClick={onResetData}
            title="Reset & Reseed Demo Data"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              padding: '0.4rem 0.6rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem'
            }}
          >
            <RefreshCw size={13} />
            Reseed
          </button>
        </div>

      </div>
    </header>
  );
}
