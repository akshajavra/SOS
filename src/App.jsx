import React, { useState } from 'react';
import { SOSProvider } from './context/SOSContext';
import UserPortal from './components/UserPortal';
import ResponderDashboard from './components/ResponderDashboard';
import SimulatedNotifications from './components/SimulatedNotifications';
import { ShieldAlert, Smartphone, Shield, Layers, HelpCircle } from 'lucide-react';
import './App.css';

function MainApp() {
  const [activeTab, setActiveTab] = useState('combined'); // combined, user, responder

  return (
    <div className="app-container">
      
      {/* Sleek Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <ShieldAlert size={26} />
          <span>SILENT SOS</span>
        </div>
        
        {/* Navigation Action Tabs */}
        <div className="nav-actions">
          <button 
            className={`tab-btn ${activeTab === 'combined' ? 'active' : ''}`}
            onClick={() => setActiveTab('combined')}
          >
            <Layers size={16} />
            <span className="desktop-only">Combined Simulator</span>
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            <Smartphone size={16} />
            <span>User SOS Portal</span>
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'responder' ? 'active' : ''}`}
            onClick={() => setActiveTab('responder')}
          >
            <Shield size={16} />
            <span>Responder Monitor</span>
          </button>
        </div>
      </nav>

      {/* Main Sandbox Workspace Layout */}
      <main className="main-content">
        {activeTab === 'combined' && (
          <div className="workspace-grid">
            
            {/* Left side: User SOS Portal & Map tracking */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <UserPortal />
            </div>

            {/* Right side: Responder Dashboard & Notification logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <ResponderDashboard />
              <SimulatedNotifications />
            </div>

          </div>
        )}

        {activeTab === 'user' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <UserPortal />
          </div>
        )}

        {activeTab === 'responder' && (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
              <ResponderDashboard />
              <SimulatedNotifications />
            </div>
          </div>
        )}
      </main>

      {/* Sleek Footer Credits */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem 1.5rem', 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto',
        background: 'rgba(7, 9, 19, 0.5)'
      }}>
        <p>© 2026 Silent SOS Dispatch Gateway. Designed for covert emergency assistance.</p>
        <p style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <HelpCircle size={12} /> Protip: Open in side-by-side tabs on your desktop to simulate User-Responder alerts in real-time.
        </p>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <SOSProvider>
      <MainApp />
    </SOSProvider>
  );
}
