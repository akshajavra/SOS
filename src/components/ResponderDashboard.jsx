import React, { useEffect, useState } from 'react';
import { useSOS } from '../context/SOSContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldAlert, User, Shield, Battery, MapPin, 
  CheckCircle, Radio, Clock, AlertTriangle, Play, FileText
} from 'lucide-react';

// Custom SVG Pulsing Marker Icon for Leaflet
const createPulsingMarkerIcon = (status) => {
  const color = status === 'triggered' ? '#ef4444' : status === 'acknowledged' ? '#f59e0b' : '#10b981';
  const shadowColor = status === 'triggered' ? 'rgba(239, 68, 68, 0.6)' : status === 'acknowledged' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.4)';
  
  return L.divIcon({
    className: 'custom-sos-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${shadowColor};
          animation: pulse-ring 1.5s infinite;
        "></div>
        <div style="
          position: relative;
          width: 14px;
          height: 14px;
          background: ${color};
          border: 2.5px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5);
          z-index: 10;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Component to dynamically pan/center map when coordinates change
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      map.setView([coords.lat, coords.lng], 16);
    }
  }, [coords, map]);
  return null;
}

export default function ResponderDashboard() {
  const {
    sosStatus, location, userName, userPhone, batteryLevel,
    contacts, responderName, distanceEstimate, activityLogs,
    acknowledgeSOS, resolveSOS
  } = useSOS();

  const [responderInput, setResponderInput] = useState('Officer Dave Jenkins (Campus Security)');

  // Filter logs for cleaner viewing on dashboard
  const activeAlertLogs = activityLogs.filter(log => log.type !== 'info');

  const handleAcknowledge = () => {
    acknowledgeSOS(responderInput);
  };

  const handleResolve = () => {
    resolveSOS();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Alert Header Status Board */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={24} style={{ color: sosStatus !== 'idle' ? 'var(--color-danger)' : 'var(--text-secondary)', animation: sosStatus !== 'idle' ? 'pulse-border 1s infinite' : 'none', borderRadius: '50%' }} />
            Distress Response Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Real-time emergency monitoring & dispatcher routing logs
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
          <span className={`status-badge ${sosStatus}`}>
            {sosStatus === 'idle' ? '🟢 Standby' : sosStatus === 'countdown' ? '🟡 Pending Trigger' : sosStatus === 'triggered' ? '🔴 Incoming Alert' : sosStatus === 'acknowledged' ? '🟠 Dispatch En Route' : '🟢 Resolved'}
          </span>
        </div>
      </div>

      {/* Main Grid: Map & Controls */}
      <div className="workspace-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
        
        {/* Left Column: Interactive Map */}
        <div className="glass-panel map-container-wrapper" style={{ minHeight: '450px', height: '100%' }}>
          {location ? (
            <MapContainer 
              center={[location.lat, location.lng]} 
              zoom={15} 
              scrollWheelZoom={true}
              zoomControl={true}
            >
              {/* Sleek Dark Mode Map Tiles from CartoDB */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                className="dark-leaflet-tiles"
              />
              
              {/* Pulse Marker representing Distress Location */}
              {sosStatus !== 'idle' && (
                <Marker 
                  position={[location.lat, location.lng]} 
                  icon={createPulsingMarkerIcon(sosStatus)}
                >
                  <Popup>
                    <div style={{ color: '#000', fontSize: '0.85rem' }}>
                      <strong>{userName}</strong><br />
                      Distress Beacon Active<br />
                      Coordinates: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </div>
                  </Popup>
                </Marker>
              )}
              
              <RecenterMap coords={location} />
            </MapContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Waiting for GPS beacon...
            </div>
          )}

          {/* Coordinate Watermark Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            zIndex: 1000,
            background: 'rgba(7, 9, 19, 0.85)',
            border: '1px solid var(--border-color)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'monospace'
          }}>
            <MapPin size={12} style={{ color: 'var(--color-danger)', marginRight: '4px', verticalAlign: 'middle' }} />
            GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </div>
        </div>

        {/* Right Column: Responder Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Dispatch Actions Dashboard */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Dispatcher Actions
            </h3>

            {sosStatus === 'idle' ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <CheckCircle size={36} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                <p>System is in standby mode.</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>No active emergency signals detected.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Victim Details Header */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{userName}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{userPhone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Battery: {batteryLevel}%</span>
                    <span>Distance: {sosStatus === 'acknowledged' ? `${distanceEstimate} mi` : 'Calculating...'}</span>
                  </div>
                </div>

                {sosStatus === 'triggered' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.8rem' }}>Assign Responder Unit</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={responderInput} 
                        onChange={(e) => setResponderInput(e.target.value)}
                        placeholder="Responder Name/Unit"
                      />
                    </div>
                    <button className="btn-primary" onClick={handleAcknowledge} style={{ background: 'linear-gradient(135deg, var(--color-warning) 0%, #b45309 100%)' }}>
                      <Shield size={18} /> Acknowledge Alert & Dispatch
                    </button>
                  </div>
                )}

                {sosStatus === 'acknowledged' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <p><strong>Status:</strong> Dispatched</p>
                      <p style={{ marginTop: '2px' }}><strong>Unit:</strong> {responderName}</p>
                    </div>
                    <button className="btn-primary" onClick={handleResolve} style={{ background: 'linear-gradient(135deg, var(--color-success) 0%, #047857 100%)' }}>
                      <CheckCircle size={18} /> Mark Emergency Resolved
                    </button>
                  </div>
                )}

                {sosStatus === 'resolved' && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <CheckCircle size={28} style={{ color: 'var(--color-success)', margin: '0 auto 0.5rem auto' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Distress Event Resolved</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Archiving logs. Resetting systems.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Logs / Chronological Feed */}
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, maxHeight: '350px', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <FileText size={18} /> Live Audit logs
            </h3>

            <div className="timeline">
              {activityLogs.map((log) => (
                <div key={log.id} className={`timeline-item ${log.type === 'danger' ? 'active' : ''}`}>
                  <div className="timeline-icon" style={{
                    color: log.type === 'danger' ? 'var(--color-danger)' : log.type === 'success' ? 'var(--color-success)' : log.type === 'warning' ? 'var(--color-warning)' : 'var(--text-secondary)'
                  }}>
                    {log.type === 'danger' ? <AlertTriangle size={14} /> : log.type === 'success' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-time">{log.time}</div>
                    <div className="timeline-text">{log.text}</div>
                  </div>
                </div>
              ))}

              {activityLogs.length === 0 && (
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '1rem' }}>
                  No log entries yet. Waiting for alert telemetry...
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
