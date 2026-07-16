import React from 'react';
import { useSOS } from '../context/SOSContext';
import { MessageSquare, Mail, Settings, Compass, Battery, AlertCircle } from 'lucide-react';

export default function SimulatedNotifications() {
  const {
    notificationLogs,
    location,
    updateCoordinates,
    batteryLevel,
    setBatteryLevel,
    sosStatus
  } = useSOS();

  // Presets to simulate walking around campus/city
  const locationPresets = [
    { name: 'Default (San Francisco)', lat: 37.7749, lng: -122.4194 },
    { name: 'Campus Library', lat: 37.7760, lng: -122.4180 },
    { name: 'Student Union Quad', lat: 37.7735, lng: -122.4210 },
    { name: 'North Residence Hall', lat: 37.7785, lng: -122.4200 },
    { name: 'Main Parking Lot B', lat: 37.7712, lng: -122.4175 }
  ];

  const handleLocationPresetClick = (lat, lng) => {
    updateCoordinates(lat, lng);
  };

  const handleBatteryChange = (e) => {
    setBatteryLevel(parseInt(e.target.value));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Simulation & Debugger Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Settings size={18} style={{ color: 'var(--color-info)' }} />
          Simulation Controls & Debugger
        </h3>
        
        {/* Battery Tweak */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Battery size={14} /> Simulate Battery Drain</span>
            <strong>{batteryLevel}%</strong>
          </div>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={batteryLevel} 
            onChange={handleBatteryChange}
            style={{ width: '100%', accentColor: 'var(--color-danger)', cursor: 'pointer', marginTop: '6px' }}
          />
        </div>

        {/* GPS Coordinates Overrides */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}><Compass size={14} /> GPS Location Simulator</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Simulate the user moving in real-time. The responder's map will update instantly:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {locationPresets.map((preset, index) => (
              <button 
                key={index} 
                className="tab-btn" 
                onClick={() => handleLocationPresetClick(preset.lat, preset.lng)}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dispatch Outgoing Notification Messages Box */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <MessageSquare size={18} style={{ color: 'var(--color-danger)' }} />
            Simulated Notification Gateway
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
            Outgoing notifications dispatched to emergency contacts via SMS and Email:
          </p>
        </div>

        <div className="notifications-panel" style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notificationLogs.map((log) => (
            <div key={log.id} className={`simulated-message-card ${log.type.toLowerCase()}`}>
              <div className="simulated-message-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  {log.type === 'SMS' ? <MessageSquare size={12} /> : <Mail size={12} />}
                  {log.type} Dispatched
                </span>
                <span>{log.time}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '4px' }}>
                <strong>To:</strong> {log.recipient}
              </p>
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '4px', borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
                {log.text}
              </div>
            </div>
          ))}

          {notificationLogs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <AlertCircle size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem auto' }} />
              <p>Gateway Idle. No notifications sent.</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Dispatches will appear here immediately when SOS triggers.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
