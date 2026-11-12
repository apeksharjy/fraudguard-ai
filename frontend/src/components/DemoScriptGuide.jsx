import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  PlayCircle, 
  Sparkles, 
  ShieldAlert, 
  MessageSquare, 
  ThumbsDown, 
  Cpu,
  HelpCircle
} from 'lucide-react';

export default function DemoScriptGuide({ onJumpToStep }) {
  const steps = [
    {
      step: 1,
      title: "Open Dashboard & Note Synthetic Data",
      description: "Open the home dashboard. Point out the summary cards and prominent banner stating all transactions and signals are synthetic demo data.",
      actionLabel: "View Dashboard (Screen A)",
      target: "dashboard",
      icon: <Sparkles size={18} color="#818cf8" />
    },
    {
      step: 2,
      title: "Submit a Normal Mock Transaction",
      description: "Navigate to Check Transaction. Submit a normal daily transaction (e.g. $45 daytime grocery). Show the low risk score and safe explanation without claiming guaranteed safety.",
      actionLabel: "Try Normal Scenario",
      target: "check_normal",
      icon: <CheckCircle2 size={18} color="#10b981" />
    },
    {
      step: 3,
      title: "Submit Suspicious Scenario (PDF Spec)",
      description: "Submit $18,500 at 2 AM with a new device, location change, and 5 rapid attempts. Observe the high risk score (>85) and immediate warning state.",
      actionLabel: "Load Suspicious Scenario",
      target: "check_suspicious",
      icon: <ShieldAlert size={18} color="#ef4444" />
    },
    {
      step: 4,
      title: "Inspect Risk Level, Reasons & Safe Advice",
      description: "Examine the transparent reason codes (UNUSUAL_AMOUNT, NEW_DEVICE, RAPID_ATTEMPTS) and the recommended safe action: 'Pause and verify through your official payment app.'",
      actionLabel: "Inspect Result Card",
      target: "result",
      icon: <ShieldAlert size={18} color="#f59e0b" />
    },
    {
      step: 5,
      title: "Ask Smart Assistant 'Why was this flagged?'",
      description: "Open the grounded Smart Assistant. Click the suggested prompt 'Why was this flagged?' and observe the template-grounded explanation citing the exact reason codes without hallucinations.",
      actionLabel: "Open Assistant (Screen D)",
      target: "assistant",
      icon: <MessageSquare size={18} color="#06b6d4" />
    },
    {
      step: 6,
      title: "Mark Feedback as 'Not Recognised'",
      description: "Click 'Not Recognised' to record user feedback. Show that the feedback updates in the SQLite database and displays in History (Screen E).",
      actionLabel: "View History & Feedback",
      target: "history",
      icon: <ThumbsDown size={18} color="#f87171" />
    },
    {
      step: 7,
      title: "Explain ML Metrics, Safeguards & Limitations",
      description: "Finish by showing the ML Model Metrics tab: ROC-AUC score, Precision, Recall, confusion matrix, feature importance, and documented privacy safeguards.",
      actionLabel: "View ML Evaluation",
      target: "model",
      icon: <Cpu size={18} color="#a855f7" />
    }
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
          <PlayCircle size={16} />
          <span>SECTION 15 COMPLIANCE: 7-STEP HACKATHON DEMO WALKTHROUGH</span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          Interactive Demo Script & Presentation Guide
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '780px' }}>
          Follow these structured 7 steps to present the entire end-to-end architecture during judging or project evaluation. Click any step to immediately jump to the relevant screen or pre-loaded state.
        </p>
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {steps.map((s) => (
          <div 
            key={s.step} 
            className="glass-panel" 
            style={{ 
              padding: '1.25rem 1.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              gap: '1.25rem' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  {s.step}
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{s.title}</h3>
                  {s.icon}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '640px' }}>
                  {s.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => onJumpToStep(s.target)}
              className="btn-secondary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', borderColor: 'rgba(99, 102, 241, 0.35)' }}
            >
              <span>{s.actionLabel}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
