import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRight, 
  Clock, 
  Smartphone, 
  MapPin, 
  Flame,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import AnalyticsCharts from './AnalyticsCharts';

export default function DashboardSummary({ 
  metrics, 
  onNavigateToCheck, 
  onInspectTransaction, 
  onOpenAssistant 
}) {
  const total = metrics?.total_checked || 0;
  const highCount = metrics?.high_risk_count || 0;
  const medCount = metrics?.medium_risk_count || 0;
  const lowCount = metrics?.low_risk_count || 0;
  const feedback = metrics?.feedback_counts || { recognised: 0, not_recognised: 0, unsure: 0 };
  const totalFeedback = (feedback.recognised || 0) + (feedback.not_recognised || 0) + (feedback.unsure || 0);
  const recent = metrics?.recent_activity || [];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Hero Welcome & Quick Action */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        background: 'radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.18), transparent 70%), rgba(17, 24, 39, 0.8)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            <Sparkles size={16} />
            <span>AI FRAUD DETECTION PIPELINE READY</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
            Digital Payment Safety Assistant
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Scans demo payment anomalies using a trained <strong>Random Forest Classifier</strong> combined with transparent rule heuristics. Identifies suspicious signals and provides grounded verification steps.
          </p>
        </div>

        <button 
          onClick={onNavigateToCheck}
          className="btn-primary"
          id="btn-check-demo"
          style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', borderRadius: '14px' }}
        >
          <ShieldAlert size={20} />
          Check a Demo Transaction
          <ArrowRight size={18} />
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid-cols-4">
        
        {/* Card 1: Total Checked */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Demo Transactions</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#818cf8" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Evaluated against ML & rules engine
          </div>
        </div>

        {/* Card 2: High Risk Alerts */}
        <div className="glass-panel" style={{ 
          padding: '1.25rem 1.5rem', 
          borderLeft: '4px solid var(--risk-high)',
          background: 'rgba(239, 68, 68, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fca5a5' }}>High-Risk Alerts</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} color="#ef4444" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f87171' }}>
            {highCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.4rem' }}>
            Score &ge; 70 or critical rule triggers
          </div>
        </div>

        {/* Card 3: Medium Risk Alerts */}
        <div className="glass-panel" style={{ 
          padding: '1.25rem 1.5rem', 
          borderLeft: '4px solid var(--risk-med)',
          background: 'rgba(245, 158, 11, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fde68a' }}>Medium-Risk Alerts</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
            {medCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fde68a', marginTop: '0.4rem' }}>
            Score 40&ndash;69 (moderate variance)
          </div>
        </div>

        {/* Card 4: Feedback Received */}
        <div className="glass-panel" style={{ 
          padding: '1.25rem 1.5rem', 
          borderLeft: '4px solid #06b6d4',
          background: 'rgba(6, 182, 212, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5f3fc' }}>User Feedback</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} color="#06b6d4" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
            {totalFeedback}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', gap: '0.6rem' }}>
            <span style={{ color: '#34d399' }}>✓ {feedback.recognised || 0}</span>
            <span style={{ color: '#f87171' }}>✗ {feedback.not_recognised || 0}</span>
            <span style={{ color: '#fbbf24' }}>? {feedback.unsure || 0}</span>
          </div>
        </div>

      </div>

      {/* Analytics Charts & Visual Distribution */}
      <AnalyticsCharts metrics={metrics} />

      {/* Recent Demo Activity List */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Demo Activity</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time audit stream of evaluated transactions and reason signals
            </p>
          </div>
          <button 
            onClick={onNavigateToCheck}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            Check New
            <ChevronRight size={14} />
          </button>
        </div>

        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No recent activity recorded yet. Click "Check a Demo Transaction" above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recent.map((tx) => (
              <div 
                key={tx.id}
                onClick={() => onInspectTransaction(tx)}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: tx.risk_level === 'high' ? 'var(--risk-high-bg)' : tx.risk_level === 'medium' ? 'var(--risk-med-bg)' : 'var(--risk-low-bg)',
                    border: `1px solid ${tx.risk_level === 'high' ? 'var(--risk-high-border)' : tx.risk_level === 'medium' ? 'var(--risk-med-border)' : 'var(--risk-low-border)'}`
                  }}>
                    {tx.risk_level === 'high' ? (
                      <Flame size={20} color="#ef4444" />
                    ) : tx.risk_level === 'medium' ? (
                      <AlertTriangle size={20} color="#f59e0b" />
                    ) : (
                      <CheckCircle2 size={20} color="#10b981" />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className={`risk-badge ${tx.risk_level}`}>
                        {tx.risk_level} ({tx.risk_score}/100)
                      </span>
                      {tx.user_feedback && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: tx.user_feedback === 'recognised' ? 'rgba(16, 185, 129, 0.15)' : tx.user_feedback === 'not_recognised' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: tx.user_feedback === 'recognised' ? '#34d399' : tx.user_feedback === 'not_recognised' ? '#f87171' : '#fbbf24',
                          border: '1px solid var(--border-subtle)',
                          textTransform: 'capitalize'
                        }}>
                          Feedback: {tx.user_feedback.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {tx.reason_codes && tx.reason_codes.length > 0 ? (
                        <span>Signals: {tx.reason_codes.join(', ')}</span>
                      ) : (
                        <span>Standard baseline transaction</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAssistant(tx);
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                  >
                    <MessageSquare size={14} color="#818cf8" />
                    Ask Assistant
                  </button>

                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
