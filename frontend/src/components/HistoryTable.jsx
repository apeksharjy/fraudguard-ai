import React, { useState } from 'react';
import { 
  Database, 
  Filter, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  MessageSquare, 
  ExternalLink,
  Smartphone,
  MapPin,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { submitFeedback } from '../api/client';

export default function HistoryTable({ 
  transactions, 
  onRefresh, 
  onSelectTransaction, 
  onOpenAssistant 
}) {
  const [riskFilter, setRiskFilter] = useState('all');
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [submittingId, setSubmittingId] = useState(null);

  const handleRowFeedback = async (id, choice) => {
    setSubmittingId(id);
    try {
      await submitFeedback(id, choice);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  const filtered = transactions.filter(t => {
    if (riskFilter !== 'all' && t.risk_level !== riskFilter) return false;
    if (feedbackFilter !== 'all') {
      if (feedbackFilter === 'pending' && t.user_feedback !== null) return false;
      if (feedbackFilter !== 'pending' && t.user_feedback !== feedbackFilter) return false;
    }
    return true;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and Filter Controls */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={22} color="#818cf8" />
              Demo Transaction History & Feedback
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Screen E &bull; Persistent SQLite audit trail of demo transactions and user feedback review flags
            </p>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', color: '#38bdf8' }}>
            <Info size={14} />
            <span>Feedback is for demonstration and review—not automatic proof of fraud.</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          
          {/* Risk Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={14} />
              Risk Level:
            </span>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: '8px' }}>
              {['all', 'high', 'medium', 'low'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setRiskFilter(lvl)}
                  style={{
                    background: riskFilter === lvl ? 'var(--primary)' : 'transparent',
                    color: riskFilter === lvl ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Feedback Status:
            </span>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: '8px' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'recognised', label: 'Recognised' },
                { id: 'not_recognised', label: 'Not Recognised' },
                { id: 'unsure', label: 'Unsure' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFeedbackFilter(f.id)}
                  style={{
                    background: feedbackFilter === f.id ? 'var(--primary)' : 'transparent',
                    color: feedbackFilter === f.id ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Showing {filtered.length} of {transactions.length} records
          </div>

        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <th style={{ padding: '0.9rem 1rem' }}>TX ID</th>
              <th style={{ padding: '0.9rem 1rem' }}>TIME</th>
              <th style={{ padding: '0.9rem 1rem' }}>AMOUNT</th>
              <th style={{ padding: '0.9rem 1rem' }}>SIGNALS</th>
              <th style={{ padding: '0.9rem 1rem' }}>RISK SCORE</th>
              <th style={{ padding: '0.9rem 1rem' }}>USER FEEDBACK</th>
              <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr 
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  
                  {/* ID */}
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    #{tx.id}
                  </td>

                  {/* Timestamp */}
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem' }}>
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Signals */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {tx.new_device && (
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                          New Device
                        </span>
                      )}
                      {tx.location_change && (
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: '#a5f3fc', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                          New Location
                        </span>
                      )}
                      {tx.transactions_last_10_min >= 4 && (
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          Rapid ({tx.transactions_last_10_min})
                        </span>
                      )}
                      {!tx.new_device && !tx.location_change && tx.transactions_last_10_min < 4 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Normal baseline
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Risk Score */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`risk-badge ${tx.risk_level}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}>
                        {tx.risk_level}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                        {tx.risk_score}/100
                      </span>
                    </div>
                  </td>

                  {/* User Feedback */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleRowFeedback(tx.id, 'recognised')}
                        disabled={submittingId === tx.id}
                        title="Mark as Recognised"
                        style={{
                          background: tx.user_feedback === 'recognised' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: tx.user_feedback === 'recognised' ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                          color: tx.user_feedback === 'recognised' ? '#34d399' : 'var(--text-muted)',
                          padding: '0.3rem 0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        <ThumbsUp size={12} />
                        Recognised
                      </button>

                      <button
                        onClick={() => handleRowFeedback(tx.id, 'not_recognised')}
                        disabled={submittingId === tx.id}
                        title="Mark as Not Recognised"
                        style={{
                          background: tx.user_feedback === 'not_recognised' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: tx.user_feedback === 'not_recognised' ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                          color: tx.user_feedback === 'not_recognised' ? '#f87171' : 'var(--text-muted)',
                          padding: '0.3rem 0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        <ThumbsDown size={12} />
                        Suspicious
                      </button>

                      <button
                        onClick={() => handleRowFeedback(tx.id, 'unsure')}
                        disabled={submittingId === tx.id}
                        title="Mark as Unsure"
                        style={{
                          background: tx.user_feedback === 'unsure' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: tx.user_feedback === 'unsure' ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
                          color: tx.user_feedback === 'unsure' ? '#fbbf24' : 'var(--text-muted)',
                          padding: '0.3rem 0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        <HelpCircle size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => onOpenAssistant(tx)}
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        title="Ask Smart Assistant"
                      >
                        <MessageSquare size={13} color="#818cf8" />
                        Ask AI
                      </button>

                      <button
                        onClick={() => onSelectTransaction(tx)}
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        title="Inspect Score Details"
                      >
                        <ExternalLink size={13} />
                        Inspect
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
