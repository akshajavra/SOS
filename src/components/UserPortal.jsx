import React, { useState, useEffect, useRef } from 'react';
import { useSOS } from '../context/SOSContext';
import { 
  ShieldAlert, Eye, EyeOff, Plus, Trash, Phone, User, 
  Mail, Users, Shield, Compass, Battery, Clock, PhoneCall, Volume2, Check
} from 'lucide-react';

export default function UserPortal() {
  const {
    sosStatus, countdown, isCamouflage, userName, setUserName,
    userPhone, setUserPhone, contacts, addContact, removeContact,
    triggerSOS, cancelSOS, toggleCamouflage, isFakeCallActive,
    triggerFakeCall, stopFakeCall, batteryLevel, setBatteryLevel, location,
    responderName, distanceEstimate, activityLogs
  } = useSOS();

  // Local State for Contacts Form
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRelation, setContactRelation] = useState('Friend');

  // Local state for long press
  const [holdProgress, setHoldProgress] = useState(0);
  const pressTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const isPressingRef = useRef(false);

  // Secret tap counter for Camouflage trigger
  const [secretTaps, setSecretTaps] = useState(0);

  // Fake call internal timer
  const [fakeCallStep, setFakeCallStep] = useState('ringing'); // ringing, active, ended

  // Reset secret taps after 4 seconds of inactivity
  useEffect(() => {
    if (secretTaps > 0) {
      const timer = setTimeout(() => setSecretTaps(0), 4000);
      return () => clearTimeout(timer);
    }
  }, [secretTaps]);

  // Handle Camouflage secret tap trigger
  const handleSecretTap = () => {
    setSecretTaps(prev => {
      const next = prev + 1;
      if (next >= 3) {
        triggerSOS();
        return 0;
      }
      return next;
    });
  };

  // SOS button press actions
  const handlePressStart = (e) => {
    e.preventDefault();
    if (sosStatus !== 'idle') return;
    isPressingRef.current = true;
    setHoldProgress(0);

    const holdDuration = 1500; // 1.5 seconds hold
    const updateRate = 30; // ms
    let currentHold = 0;

    progressIntervalRef.current = setInterval(() => {
      currentHold += updateRate;
      const progress = Math.min((currentHold / holdDuration) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(progressIntervalRef.current);
        triggerSOS();
        resetPressState();
      }
    }, updateRate);
  };

  const handlePressEnd = () => {
    resetPressState();
  };

  const resetPressState = () => {
    isPressingRef.current = false;
    setHoldProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
  };

  // Contacts Form submit
  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;
    addContact(contactName, contactPhone, contactEmail || 'no-email@emergency.com', contactRelation);
    setContactName('');
    setContactPhone('');
    setContactEmail('');
  };

  // SVG calculations for long-press circle
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  // --- Fake Weather App Decoy UI ---
  if (isCamouflage) {
    return (
      <div className="camouflage-weather-container fade-in">
        <div className="camouflage-header">
          <span 
            className="camouflage-title"
            onClick={handleSecretTap}
          >
            Global Weather Hub
          </span>
          <button className="tab-btn" onClick={toggleCamouflage}>
            <EyeOff size={14} /> Disable Decoy
          </button>
        </div>

        <div className="weather-main">
          <h2>San Francisco</h2>
          <span 
            className="sun-cloud"
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerLeave={handlePressEnd}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            ☀️☁️
          </span>
          <div className="weather-temp">72°F</div>
          <div className="weather-desc">Partly Cloudy</div>
        </div>

        <div className="weather-details">
          <div className="weather-detail-item">
            <span className="weather-detail-label">Humidity</span>
            <span className="weather-detail-value">42%</span>
          </div>
          <div className="weather-detail-item">
            <span className="weather-detail-label">Wind Speed</span>
            <span className="weather-detail-value">12 mph</span>
          </div>
          <div className="weather-detail-item">
            <span className="weather-detail-label">UV Index</span>
            <span className="weather-detail-value">6 (High)</span>
          </div>
          <div className="weather-detail-item">
            <span className="weather-detail-label">Visibility</span>
            <span className="weather-detail-value">10 mi</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', opacity: 0.6 }}>
          <em>💡 Protip: Tap header title 3 times or Hold Sun Icon to trigger Silent SOS silently.</em>
        </div>

        {/* Secret hold progress indicator */}
        {holdProgress > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            width: `${holdProgress}%`,
            backgroundColor: '#ff5757',
            transition: 'width 0.1s linear'
          }} />
        )}

        {/* SOS Countdown Overlay in decoy screen */}
        {sosStatus === 'countdown' && (
          <div className="countdown-overlay">
            <div className="countdown-number">{countdown}</div>
            <div className="countdown-loader-bar">
              <div className="countdown-loader-fill"></div>
            </div>
            <button className="btn-secondary" onClick={cancelSOS}>
              Cancel Distress Trigger
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- Fake Call Overlay ---
  if (isFakeCallActive) {
    return (
      <div className="countdown-overlay fade-in" style={{ background: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
        {fakeCallStep === 'ringing' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '4rem 2rem' }}>
            <div>
              <p style={{ fontSize: '1.2rem', color: '#94a3b8', letterSpacing: '1px' }}>INCOMING CALL</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '1rem' }}>Mom</h2>
              <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Mobile +1 (555) 012-4400</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginBottom: '2rem' }}>
              <button 
                onClick={stopFakeCall} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Phone size={32} style={{ transform: 'rotate(135deg)' }} />
              </button>
              
              <button 
                onClick={() => setFakeCallStep('active')}
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Phone size={32} />
              </button>
            </div>
          </div>
        )}

        {fakeCallStep === 'active' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '4rem 2rem' }}>
            <div>
              <p style={{ fontSize: '1.2rem', color: '#10b981', fontWeight: '600' }}>CONNECTED</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '1rem' }}>Mom</h2>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>00:14</p>
            </div>

            <div style={{ padding: '1.5rem', background: '#1e293b', borderRadius: '12px', textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}><em>Simulated Dialogue (read aloud to escape):</em></p>
              <p style={{ fontWeight: '500', lineHeight: '1.4' }}>"Hey Mom, yeah I'm just leaving now. I'll meet you in 5 minutes at the main street. I see your car, walking over!"</p>
            </div>
            
            <div>
              <button 
                onClick={() => {
                  setFakeCallStep('ringing');
                  stopFakeCall();
                }} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
              >
                <Phone size={32} style={{ transform: 'rotate(135deg)' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SOS Active HUD or Core SOS Trigger Panel */}
      {sosStatus === 'idle' ? (
        <div className="glass-panel sos-trigger-container fade-in">
          <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
            <button className="tab-btn" onClick={toggleCamouflage}>
              <Eye size={14} /> Enable Camouflage (Decoy UI)
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>Distress Activation</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Hold button to broadcast silent distress alerts to contacts
            </p>
          </div>

          {/* Glowing Circle and Button */}
          <div className="sos-button-wrapper">
            <svg className="svg-loader">
              <circle 
                className="svg-loader-circle" 
                cx="120" 
                cy="120" 
                r={radius}
                style={{ strokeDashoffset }}
              />
            </svg>

            <button 
              className="sos-interactive-btn"
              onPointerDown={handlePressStart}
              onPointerUp={handlePressEnd}
              onPointerLeave={handlePressEnd}
            >
              <ShieldAlert size={64} style={{ marginBottom: '8px' }} />
              <span className="sos-btn-title">SOS</span>
              <span className="sos-btn-subtitle">Press & Hold</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 1.5s Hold Delay</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Compass size={14} /> Silent Dispatch</span>
          </div>
        </div>
      ) : sosStatus === 'countdown' ? (
        <div className="glass-panel sos-trigger-container" style={{ minHeight: '380px' }}>
          <div className="countdown-overlay">
            <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '1px' }}>SENDING SIGNAL IN</div>
            <div className="countdown-number">{countdown}</div>
            <div className="countdown-loader-bar">
              <div className="countdown-loader-fill"></div>
            </div>
            <button className="btn-secondary" onClick={cancelSOS} style={{ borderColor: 'var(--color-danger)', color: '#ff6b6b' }}>
              Cancel Emergency Signal
            </button>
          </div>
        </div>
      ) : (
        /* Emergency Active Dashboard Screen */
        <div className="glass-panel sos-hud-panel fade-in" style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(15, 23, 42, 0.85)' }}>
          <div className="sos-hud-header">
            <div>
              <span className={`status-badge ${sosStatus}`}>
                {sosStatus === 'triggered' ? '🔴 SOS Broadacted' : sosStatus === 'acknowledged' ? '🟠 Dispatch En Route' : '🟢 Resolved'}
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginTop: '8px' }}>
                Silent SOS Transmission Active
              </h3>
            </div>
            <button className="tab-btn" onClick={toggleCamouflage}>
              <Eye size={14} /> Hide Behind Decoy
            </button>
          </div>

          {/* Animated Waveform Visualizer */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)' }}>
            <div className="waveform-container" style={{ flexShrink: 0 }}>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-danger)' }}>Simulating Ambient Sound Recording...</p>
              <p style={{ color: 'var(--text-secondary)' }}>Transmitting background audio coordinates stream to responders.</p>
            </div>
          </div>

          {/* Quick Tools & Rescue Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button className="btn-secondary" onClick={triggerFakeCall} style={{ gap: '0.5rem' }}>
              <PhoneCall size={18} /> Trigger Fake Call
            </button>
            <button 
              className="btn-primary" 
              onClick={cancelSOS}
              style={{ background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', color: '#fff' }}
            >
              Force Cancel Alarm
            </button>
          </div>

          {/* Active Help Details */}
          {sosStatus === 'acknowledged' && (
            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--color-success)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assigned Responder:</p>
              <h4 style={{ fontWeight: 700, margin: '2px 0 6px 0' }}>{responderName}</h4>
              <p style={{ fontSize: '0.8rem', display: 'flex', gap: '1rem' }}>
                <span><strong>Distance:</strong> {distanceEstimate} miles</span>
                <span><strong>Est. Arrival:</strong> ~4 mins</span>
              </p>
            </div>
          )}

          {/* GPS Tracking Telemetry */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Battery size={14} /> Phone Power: {batteryLevel}%</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Compass size={14} /> GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Emergency Profile and Contacts Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <Users size={20} style={{ color: 'var(--color-danger)' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>Trusted Contacts</h3>
        </div>

        {/* User Identity Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>User Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              disabled={sosStatus !== 'idle'}
            />
          </div>
          <div className="form-group">
            <label>Emergency Mobile</label>
            <input 
              type="text" 
              className="form-input" 
              value={userPhone} 
              onChange={(e) => setUserPhone(e.target.value)} 
              disabled={sosStatus !== 'idle'}
            />
          </div>
        </div>

        {/* Add Contact Form */}
        {sosStatus === 'idle' && (
          <form onSubmit={handleAddContactSubmit} style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Add Trusted Contact</h4>
            <div className="form-row">
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contact Name" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Phone Number" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Email Address" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <select 
                  className="form-input" 
                  value={contactRelation} 
                  onChange={(e) => setContactRelation(e.target.value)}
                  style={{ background: '#0a0d16' }}
                >
                  <option value="Friend">Friend</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Colleague">Colleague</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}>
              <Plus size={14} /> Save Emergency Contact
            </button>
          </form>
        )}

        {/* Contacts List */}
        <div className="contacts-grid">
          {contacts.map(contact => (
            <div key={contact.id} className="contact-card">
              <div className="contact-details">
                <h4>{contact.name}</h4>
                <p>{contact.relation} • {contact.phone} • {contact.email}</p>
              </div>
              {sosStatus === 'idle' && (
                <button className="remove-btn" onClick={() => removeContact(contact.id)}>
                  <Trash size={16} />
                </button>
              )}
            </div>
          ))}
          {contacts.length === 0 && (
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem' }}>
              No emergency contacts added yet. Please add at least one to receive alerts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
