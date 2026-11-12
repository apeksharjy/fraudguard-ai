import React from 'react';
import { BarChart3, PieChart, ShieldAlert, Cpu } from 'lucide-react';

export default function AnalyticsCharts({ metrics }) {
  const distribution = metrics?.risk_distribution || [
    { range: '0-20 (Safe)', count: 0, band: 'low' },
    { range: '21-40 (Normal)', count: 0, band: 'low' },
    { range: '41-60 (Moderate)', count: 0, band: 'medium' },
    { range: '61-80 (Elevated)', count: 0, band: 'high' },
    { range: '81-100 (Critical)', count: 0, band: 'high' }
  ];

  const total = metrics?.total_checked || 1;
  const high = metrics?.high_risk_count || 0;
  const med = metrics?.medium_risk_count || 0;
  const low = metrics?.low_risk_count || 0;

  const highPct = Math.round((high / total) * 100);
  const medPct = Math.round((med / total) * 100);
  const lowPct = Math.max(0, 100 - highPct - medPct);

  const maxBinCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div className="grid-cols-2">
      
      {/* Chart 1: Risk Score Distribution Histogram */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="#818cf8" />
              Risk Score Distribution
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              N = {total} transactions
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Frequency of evaluated transactions across 5 risk intensity buckets
          </p>
        </div>

        {/* Custom Interactive Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {distribution.map((bin, idx) => {
            const barWidth = Math.max(8, Math.round((bin.count / maxBinCount) * 100));
            const barColor = bin.band === 'high' 
              ? 'linear-gradient(90deg, #ef4444, #f87171)' 
              : bin.band === 'medium'
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #10b981, #34d399)';

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{bin.range}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                    {bin.count} ({Math.round((bin.count / total) * 100)}%)
                  </span>
                </div>
                <div style={{
                  height: '10px',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    background: barColor,
                    borderRadius: '9999px',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Low Risk (0-39)</span>
          <span>Medium Risk (40-69)</span>
          <span>High Risk (70-100)</span>
        </div>
      </div>

      {/* Chart 2: Proportion by Risk Tier & Decision Gateways */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} color="#06b6d4" />
              Risk Band Proportions
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Decision Thresholds</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Policy breakdown separating routine flow from required customer verification
          </p>
        </div>

        {/* Stacked Visual Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            height: '24px',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
          }}>
            <div style={{ width: `${lowPct}%`, background: '#10b981', transition: 'width 0.5s ease' }} title={`Low Risk: ${low} (${lowPct}%)`} />
            <div style={{ width: `${medPct}%`, background: '#f59e0b', transition: 'width 0.5s ease' }} title={`Medium Risk: ${med} (${medPct}%)`} />
            <div style={{ width: `${highPct}%`, background: '#ef4444', transition: 'width 0.5s ease' }} title={`High Risk: ${high} (${highPct}%)`} />
          </div>
        </div>

        {/* Risk Tier Detail Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          
          <div style={{ background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>LOW TIER</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '0.2rem 0' }}>{low}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lowPct}% of volume</div>
          </div>

          <div style={{ background: 'var(--risk-med-bg)', border: '1px solid var(--risk-med-border)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>MEDIUM</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '0.2rem 0' }}>{med}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{medPct}% of volume</div>
          </div>

          <div style={{ background: 'var(--risk-high-bg)', border: '1px solid var(--risk-high-border)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>HIGH RISK</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '0.2rem 0' }}>{high}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{highPct}% of volume</div>
          </div>

        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldAlert size={14} color="#818cf8" />
          <span>Automated safeguards require step-up verification on all High risk payments.</span>
        </div>

      </div>

    </div>
  );
}
