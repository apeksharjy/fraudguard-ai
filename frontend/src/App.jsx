import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import DashboardSummary from './components/DashboardSummary';
import TransactionForm from './components/TransactionForm';
import RiskResultCard from './components/RiskResultCard';
import SmartAssistantModal from './components/SmartAssistantModal';
import HistoryTable from './components/HistoryTable';
import ModelMetricsModal from './components/ModelMetricsModal';
import DemoScriptGuide from './components/DemoScriptGuide';
import PayPalGateway from './components/PayPalGateway';

import { 
  checkHealth, 
  scoreTransaction, 
  fetchTransactions, 
  fetchMetricsSummary,
  resetDemoData
} from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [assistantTx, setAssistantTx] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Initial Load & Heartbeat
  useEffect(() => {
    loadInitialData();
    const interval = setInterval(verifyConnection, 12000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const verifyConnection = async () => {
    try {
      await checkHealth();
      setBackendStatus(true);
    } catch {
      setBackendStatus(false);
    }
  };

  const loadInitialData = async () => {
    try {
      await checkHealth();
      setBackendStatus(true);
      const [m, t] = await Promise.all([
        fetchMetricsSummary(),
        fetchTransactions()
      ]);
      setMetrics(m);
      setTransactions(t);
    } catch (err) {
      console.warn('Initial backend load issue:', err);
      setBackendStatus(false);
    }
  };

  const refreshData = async () => {
    try {
      const [m, t] = await Promise.all([
        fetchMetricsSummary(),
        fetchTransactions()
      ]);
      setMetrics(m);
      setTransactions(t);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  // Screen B Submit Handler -> leads to Screen C
  const handleScoreTransaction = async (formData) => {
    setIsScoring(true);
    try {
      const result = await scoreTransaction(formData);
      setCurrentResult(result);
      showToast(`Transaction scored: ${result.risk_level.toUpperCase()} Risk (${result.risk_score}/100)`);
      await refreshData();
      setActiveTab('result');
    } catch (err) {
      console.error('Scoring error:', err);
      showToast(`Scoring failed: ${err.message}`);
    } finally {
      setIsScoring(false);
    }
  };

  // Open Assistant Drawer / Modal
  const handleOpenAssistant = (tx) => {
    setAssistantTx(tx);
    setIsAssistantOpen(true);
  };

  // Inspect Transaction from History or Dashboard
  const handleInspectTransaction = (tx) => {
    setCurrentResult(tx);
    setActiveTab('result');
  };

  // Reset & Reseed Demo Data
  const handleResetData = async () => {
    try {
      await resetDemoData();
      await refreshData();
      showToast('Synthetic dataset and baseline demo history reseeded!');
    } catch (err) {
      showToast('Failed to reset demo dataset.');
    }
  };

  // Demo script jumps
  const handleJumpToStep = (target) => {
    if (target === 'dashboard') {
      setActiveTab('dashboard');
    } else if (target === 'check_normal' || target === 'check_suspicious' || target === 'check') {
      setActiveTab('check');
    } else if (target === 'result') {
      if (currentResult) {
        setActiveTab('result');
      } else if (transactions.length > 0) {
        setCurrentResult(transactions[0]);
        setActiveTab('result');
      } else {
        setActiveTab('check');
      }
    } else if (target === 'assistant') {
      const tx = currentResult || (transactions.length > 0 ? transactions[0] : null);
      if (tx) {
        handleOpenAssistant(tx);
      } else {
        setActiveTab('check');
      }
    } else if (target === 'history') {
      setActiveTab('history');
    } else if (target === 'model') {
      setActiveTab('model');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Navbar */}
      <Navbar 
        activeTab={activeTab === 'result' ? 'check' : activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        onResetData={handleResetData}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          color: '#f8fafc',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          zIndex: 100,
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          <span>⚡ {toastMsg}</span>
        </div>
      )}

      {/* App Body Container */}
      <main className="container" style={{ flex: 1, paddingBottom: '3rem' }}>
        
        {/* Screen A: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardSummary
            metrics={metrics}
            onNavigateToCheck={() => setActiveTab('check')}
            onInspectTransaction={handleInspectTransaction}
            onOpenAssistant={handleOpenAssistant}
          />
        )}

        {/* Screen B: Check Transaction */}
        {activeTab === 'check' && (
          <TransactionForm
            onSubmit={handleScoreTransaction}
            isLoading={isScoring}
          />
        )}

        {/* Screen C: Risk Result */}
        {activeTab === 'result' && currentResult && (
          <RiskResultCard
            result={currentResult}
            onBackToForm={() => setActiveTab('check')}
            onOpenAssistant={handleOpenAssistant}
            onFeedbackSaved={async () => {
              await refreshData();
              showToast('Feedback updated in audit log.');
            }}
          />
        )}

        {/* PayPal Gateway Screen */}
        {activeTab === 'paypal' && (
          <PayPalGateway
            onOpenAssistant={handleOpenAssistant}
            onInspectTransaction={handleInspectTransaction}
          />
        )}

        {/* Screen E: History & Feedback */}
        {activeTab === 'history' && (
          <HistoryTable
            transactions={transactions}
            onRefresh={refreshData}
            onSelectTransaction={handleInspectTransaction}
            onOpenAssistant={handleOpenAssistant}
          />
        )}

        {/* ML Model Metrics Tab */}
        {activeTab === 'model' && (
          <ModelMetricsModal onRetrain={refreshData} />
        )}

        {/* Demo Script Walkthrough Tab */}
        {activeTab === 'guide' && (
          <DemoScriptGuide onJumpToStep={handleJumpToStep} />
        )}

      </main>

      {/* Screen D: Smart Payment Assistant Modal */}
      <SmartAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        transaction={assistantTx}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'rgba(10, 14, 23, 0.8)'
      }}>
        FraudGuard AI &bull; AI-Powered Digital Payment Fraud Detection & Safety Assistant &bull; Student / Hackathon Prototype Using Synthetic Data &bull; FastAPI + Scikit-Learn + React
      </footer>

    </div>
  );
}
