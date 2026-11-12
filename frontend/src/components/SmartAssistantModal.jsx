import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { askAssistant } from '../api/client';

export default function SmartAssistantModal({ isOpen, onClose, transaction }) {
  const [messages, setMessages] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize conversation when opened
  useEffect(() => {
    if (isOpen && transaction) {
      const initialSummary = transaction.assistant_explanation || 
        "Hello! I am your Smart Payment Safety Assistant. I analyze configured security signals and recommend safe verification protocols.";
      
      setMessages([
        {
          sender: 'assistant',
          text: initialSummary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          signals: transaction.reason_codes || []
        }
      ]);
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

  const handlePromptClick = async (promptKey, promptText) => {
    // Add user message
    const userMsg = {
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askAssistant({
        prompt_key: promptKey,
        custom_query: promptText,
        reason_codes: transaction.reason_codes || [],
        risk_level: transaction.risk_level || 'low'
      });

      const assistantMsg = {
        sender: 'assistant',
        text: response.answer,
        checklist: response.action_checklist || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        disclaimer: response.safety_disclaimer
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Assistant error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "I encountered an issue connecting to the safety server. Please ensure you never share your PIN or OTP.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const query = customInput.trim();
    setCustomInput('');
    await handlePromptClick(null, query);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 16, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(17, 24, 39, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
            }}>
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Smart Payment Assistant</h3>
                <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                  Grounded Mode
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Screen D &bull; Answering strictly from evaluated security signals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Transaction Context Bar */}
        <div style={{
          padding: '0.65rem 1.5rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            Referenced Transaction: <strong style={{ color: '#fff' }}>${transaction.amount?.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className={`risk-badge ${transaction.risk_level}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
              {transaction.risk_level} ({transaction.risk_score}/100)
            </span>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'rgba(10, 14, 23, 0.5)'
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {msg.sender === 'assistant' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} color="#818cf8" />
                </div>
              )}

              <div style={{
                background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(30, 41, 59, 0.7)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                padding: '0.9rem 1.15rem',
                borderRadius: '14px',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
                lineHeight: '1.5'
              }}>
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                {/* Optional Checklist */}
                {msg.checklist && msg.checklist.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem' }}>
                      SAFEGUARD CHECKLIST:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {msg.checklist.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem', fontSize: '0.65rem', color: msg.sender === 'user' ? '#c7d2fe' : 'var(--text-muted)' }}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={18} color="#fff" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#818cf8" />
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.75rem 1rem', borderRadius: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Consulting grounded reason codes...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts Pills (PDF Page 3 requirement) */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
            SUGGESTED:
          </span>
          <button
            onClick={() => handlePromptClick('why_flagged', 'Why was this flagged?')}
            disabled={isLoading}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#c7d2fe',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Why was this flagged?
          </button>

          <button
            onClick={() => handlePromptClick('what_to_check', 'What should I check?')}
            disabled={isLoading}
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#a5f3fc',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            What should I check?
          </button>

          <button
            onClick={() => handlePromptClick('how_to_report', 'How do I report a suspicious payment safely?')}
            disabled={isLoading}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            How do I report safely?
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '0.75rem',
          background: 'rgba(17, 24, 39, 0.95)'
        }}>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Ask a question about this transaction..."
            className="input-field"
            style={{ padding: '0.65rem 1rem', fontSize: '0.9rem' }}
          />
          <button
            type="submit"
            disabled={isLoading || !customInput.trim()}
            className="btn-primary"
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
