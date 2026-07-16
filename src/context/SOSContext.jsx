import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SOSContext = createContext();

export const useSOS = () => {
  const context = useContext(SOSContext);
  if (!context) {
    throw new Error('useSOS must be used within an SOSProvider');
  }
  return context;
};

export const SOSProvider = ({ children }) => {
  // --- States ---
  const [sosStatus, setSosStatus] = useState('idle'); // idle, countdown, triggered, acknowledged, resolved
  const [countdown, setCountdown] = useState(3);
  const [isCamouflage, setIsCamouflage] = useState(false);
  const [userName, setUserName] = useState('Jane Doe');
  const [userPhone, setUserPhone] = useState('+1 (555) 019-2834');
  const [batteryLevel, setBatteryLevel] = useState(82);
  const [location, setLocation] = useState({ lat: 37.7749, lng: -122.4194 }); // default: SF
  const [contacts, setContacts] = useState([
    { id: '1', name: 'John Doe', phone: '+1 (555) 019-5829', email: 'john.doe@family.com', relation: 'Spouse' },
    { id: '2', name: 'Sarah Miller', phone: '+1 (555) 014-9988', email: 'sarah.m@parent.org', relation: 'Mother' }
  ]);
  const [responderName, setResponderName] = useState('');
  const [distanceEstimate, setDistanceEstimate] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  
  // Refs
  const countdownIntervalRef = useRef(null);
  const geoWatchIdRef = useRef(null);
  const audioLogIntervalRef = useRef(null);

  // --- Helper: Add Activity Log ---
  const addLog = (text, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityLogs((prev) => [{ id: Date.now().toString(), time, text, type }, ...prev]);
  };

  // --- Helper: Add Simulated SMS/Email Notification ---
  const addNotification = (type, recipient, text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setNotificationLogs((prev) => [
      { id: Date.now().toString(), type, recipient, text, time },
      ...prev
    ]);
  };

  // --- Location Updates ---
  // Start geolocation tracking when SOS triggers
  useEffect(() => {
    if (sosStatus === 'triggered' || sosStatus === 'acknowledged') {
      addLog('Initiating real-time GPS tracking...', 'location');
      
      if (navigator.geolocation) {
        // Get initial high accuracy position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setLocation(newLoc);
            addLog(`GPS coordinates resolved: ${newLoc.lat.toFixed(4)}, ${newLoc.lng.toFixed(4)}`, 'success');
          },
          (error) => {
            addLog(`GPS permission denied/failed: ${error.message}. Falling back to default coordinates.`, 'error');
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );

        // Start watch position
        geoWatchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const updatedLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setLocation(updatedLoc);
            // Throttle logs slightly, or just log occasionally
          },
          (err) => {
            console.error('Watch position error:', err);
          },
          { enableHighAccuracy: true }
        );
      } else {
        addLog('Geolocation is not supported by this browser. Using simulated GPS.', 'error');
      }
    } else {
      // Clear watch when idle or resolved
      if (geoWatchIdRef.current) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
    }

    return () => {
      if (geoWatchIdRef.current) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, [sosStatus]);

  // --- Countdown Handler ---
  useEffect(() => {
    if (sosStatus === 'countdown') {
      setCountdown(3);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            activateSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
    return () => clearInterval(countdownIntervalRef.current);
  }, [sosStatus]);

  // --- Simulated Audio recording logger ---
  useEffect(() => {
    if (sosStatus === 'triggered' || sosStatus === 'acknowledged') {
      const mockTranscripts = [
        "Heavy footsteps approaching...",
        "User is keeping silent, breathing heavily.",
        "Ambient traffic noises and wind detected.",
        "User moving at approximately 3 mph.",
        "Sound of doors opening/closing."
      ];
      let transcriptIndex = 0;

      audioLogIntervalRef.current = setInterval(() => {
        if (transcriptIndex < mockTranscripts.length) {
          addLog(`[AUDIO TRANSCRIBER]: ${mockTranscripts[transcriptIndex]}`, 'audio');
          transcriptIndex++;
        }
      }, 15000);
    } else {
      if (audioLogIntervalRef.current) {
        clearInterval(audioLogIntervalRef.current);
      }
    }
    return () => clearInterval(audioLogIntervalRef.current);
  }, [sosStatus]);

  // --- Actions ---

  const triggerSOS = () => {
    setSosStatus('countdown');
    addLog('SOS trigger requested. 3-second safety cancellation window active.', 'warning');
  };

  const cancelSOS = () => {
    setSosStatus('idle');
    setCountdown(3);
    addLog('SOS trigger cancelled by user.', 'info');
  };

  const activateSOS = () => {
    setSosStatus('triggered');
    addLog('EMERGENCY SOS SIGNAL BROADCASTED!', 'danger');
    
    // Broadcast notifications to all emergency contacts
    contacts.forEach(contact => {
      // SMS
      const smsText = `ALERT: ${userName} has triggered a SILENT SOS. They are in distress. Track their live GPS location here: http://localhost:5173/?view=responder&alertId=${Date.now()}`;
      addNotification('SMS', contact.phone, smsText);
      
      // Email
      const emailText = `Dear ${contact.name},\n\nThis is an automated emergency message. ${userName} (${userPhone}) has activated their Silent SOS portal. Please check the Responder Dashboard to view their live GPS tracker and battery details.\n\nLive Link: http://localhost:5173/?view=responder\n\nStay Safe,\nSilent SOS Platform.`;
      addNotification('Email', contact.email, emailText);
    });

    addLog(`Emergency alerts dispatched to ${contacts.length} trusted contacts.`, 'success');
  };

  const acknowledgeSOS = (responder = 'Officer Jenkins (Emergency Services)') => {
    setSosStatus('acknowledged');
    setResponderName(responder);
    setDistanceEstimate(0.8);
    addLog(`Alert ACKNOWLEDGED by responder: ${responder}`, 'success');
    addLog('Responder dispatched. Est. arrival: 4 mins (0.8 miles).', 'info');
    
    // Notify contacts that someone is responding
    contacts.forEach(contact => {
      const smsText = `UPDATE: ${userName}'s distress alert has been acknowledged by ${responder}. Help is on the way.`;
      addNotification('SMS', contact.phone, smsText);
    });
  };

  const resolveSOS = () => {
    setSosStatus('resolved');
    addLog('SOS Alert marked as RESOLVED. Archiving event log.', 'success');
    
    // Notify contacts of resolution
    contacts.forEach(contact => {
      const smsText = `UPDATE: ${userName} is now safe. The emergency event has been marked as resolved.`;
      addNotification('SMS', contact.phone, smsText);
    });

    // Reset status after a delay
    setTimeout(() => {
      setSosStatus('idle');
      setResponderName('');
      setDistanceEstimate(0);
      addLog('System returned to STANDBY monitoring mode.', 'info');
    }, 4000);
  };

  const addContact = (name, phone, email, relation) => {
    const newContact = { id: Date.now().toString(), name, phone, email, relation };
    setContacts(prev => [...prev, newContact]);
    addLog(`Added emergency contact: ${name} (${relation})`, 'info');
  };

  const removeContact = (id) => {
    const contactToRemove = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    if (contactToRemove) {
      addLog(`Removed emergency contact: ${contactToRemove.name}`, 'info');
    }
  };

  const toggleCamouflage = () => {
    setIsCamouflage(prev => !prev);
    addLog(`Camouflage mode toggled to: ${!isCamouflage ? 'ON (Decoy weather app)' : 'OFF'}`, 'info');
  };

  const triggerFakeCall = () => {
    setIsFakeCallActive(true);
    addLog('Simulated fake call screen triggered to assist exit strategy.', 'info');
  };

  const stopFakeCall = () => {
    setIsFakeCallActive(false);
    addLog('Simulated fake call terminated.', 'info');
  };

  const updateCoordinates = (lat, lng) => {
    const newLoc = { lat: parseFloat(lat), lng: parseFloat(lng) };
    setLocation(newLoc);
    addLog(`Coordinates manually overridden in debug: ${newLoc.lat.toFixed(4)}, ${newLoc.lng.toFixed(4)}`, 'info');
  };

  return (
    <SOSContext.Provider value={{
      sosStatus,
      countdown,
      isCamouflage,
      userName,
      setUserName,
      userPhone,
      setUserPhone,
      batteryLevel,
      setBatteryLevel,
      location,
      setLocation,
      contacts,
      responderName,
      distanceEstimate,
      activityLogs,
      notificationLogs,
      isFakeCallActive,
      triggerSOS,
      cancelSOS,
      activateSOS,
      acknowledgeSOS,
      resolveSOS,
      addContact,
      removeContact,
      toggleCamouflage,
      triggerFakeCall,
      stopFakeCall,
      updateCoordinates,
      addLog
    }}>
      {children}
    </SOSContext.Provider>
  );
};
