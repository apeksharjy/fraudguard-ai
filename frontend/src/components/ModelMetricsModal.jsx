import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  BarChart, 
  Info,
  RefreshCw
} from 'lucide-react';
import { fetchModelMetrics } from '../api/client';

export default function ModelMetricsModal({ onRetrain }) {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchModelMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching model metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading ML evaluation report and metrics...
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Metrics unavailable. Please ensure model training was executed.
      </div>
    );
  }

  const cm = metrics.confusion_matrix || { true_negative: 0, false_positive: 0, false_negative: 0, true_positive: 0 };
  const totalTest = (cm.true_negative + cm.false_positive + cm.false_negative + cm.true_positive) || 1;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Cpu size={16} />
              <span>OFFICIAL SUBMISSION CHECKLIST ITEM #3 & #16</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Model Evaluation, Performance & Safeguards
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Trained <strong>RandomForestClassifier</strong> evaluating non-linear multi-signal transaction anomalies.
            </p>
          </div>

          <button
            onClick={loadMetrics}
            className="btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} />
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-4">
        
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, marginBottom: '0.4rem' }}>
            ROC-AUC SCORE
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
            {metrics.roc_auc}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Discrimination capability (1.0 = ideal)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.4rem' }}>
            RECALL (SENSITIVITY)
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
            {Math.round(metrics.recall * 100)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Captured {Math.round(metrics.recall * 100)}% of synthetic fraud cases
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #818cf8' }}>
          <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600, marginBottom: '0.4rem' }}>
            PRECISION
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
            {Math.round(metrics.precision * 100)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            True anomalies when alert is triggered
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.4rem' }}>
            F1-SCORE
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
            {metrics.f1_score}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Harmonic balance of recall & precision
          </div>
        </div>

      </div>

      {/* Grid: Confusion Matrix & Feature Importance */}
      <div className="grid-cols-2">
        
        {/* Confusion Matrix */}
        <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#818cf8" />
            Evaluation Confusion Matrix
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Holdout test set validation ({metrics.test_samples} unseen samples)
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>TRUE NEGATIVES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '0.2rem 0' }}>
                {cm.true_negative}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Correctly approved normal tx</div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>FALSE POSITIVES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '0.2rem 0' }}>
                {cm.false_positive}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal tx flagged for review</div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>FALSE NEGATIVES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '0.2rem 0' }}>
                {cm.false_negative}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Missed anomaly signatures</div>
            </div>

            <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>TRUE POSITIVES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '0.2rem 0' }}>
                {cm.true_positive}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Correctly identified fraud alerts</div>
            </div>

          </div>
        </div>

        {/* Feature Importances */}
        <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart size={18} color="#06b6d4" />
            Signal Importance (Gini Impurity)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Relative weighting of transaction dimensions within the Random Forest
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {metrics.feature_importances?.map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>{feat.feature}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                    {Math.round(feat.importance * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round(feat.importance * 100)}%`,
                    background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                    borderRadius: '9999px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Limitations and Safeguards (Mandatory checklist item) */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="#10b981" />
          Documented Limitations & Privacy Safeguards
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={16} />
              SYSTEM LIMITATIONS
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {metrics.limitations?.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} />
              SECURITY & PRIVACY SAFEGUARDS
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {metrics.safeguards?.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
              ))}
              <li style={{ marginBottom: '0.35rem' }}>No credentials, PINs, or bank secrets are stored or queried.</li>
              <li>Explainability is template-grounded to prevent hallucinated bank claims.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
