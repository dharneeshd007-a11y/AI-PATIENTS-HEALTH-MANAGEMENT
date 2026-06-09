import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, Activity } from 'lucide-react';
import axios from 'axios';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('/api/alerts');
        setAlerts(response.data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await axios.put(`/api/alerts/${id}/resolve`);
      setAlerts(alerts.map(a => a.id === id ? { ...a, resolved: 1 } : a));
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Arrhythmia Alerts</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Log of all system-detected cardiac events</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Patient</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Arrhythmia Type</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Time</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => (
              <tr key={alert.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s', backgroundColor: alert.severity === 'Critical' ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                    backgroundColor: alert.severity === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : alert.severity === 'Warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                    color: alert.severity === 'Critical' ? 'var(--accent-red)' : alert.severity === 'Warning' ? 'var(--accent-orange)' : 'var(--text-secondary)'
                  }}>
                    {alert.severity === 'Critical' && <AlertTriangle size={14} />}
                    {alert.severity}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={18} color="var(--text-secondary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{alert.patient_name || alert.patient}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Room {alert.patient_room || alert.room}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 500 }}>{alert.arrhythmia_type || alert.type}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {new Date(alert.timestamp || alert.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {!alert.resolved ? (
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No alerts found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alerts;
