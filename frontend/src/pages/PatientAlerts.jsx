import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const PatientAlerts = () => {
  const user = authService.getCurrentUser()?.user;
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('/api/alerts');
        // Filter alerts to ONLY show those belonging to this specific patient
        // (In a real production app, this filtering MUST happen securely on the backend)
        const myAlerts = response.data.filter(a => a.patient_name === user?.full_name || a.patient === user?.full_name);
        setAlerts(myAlerts);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      }
    };
    if (user?.full_name) {
      fetchAlerts();
    }
  }, [user]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Alert History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Log of AI-detected cardiac events specific to your telemetry</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Time Detected</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Event Type</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Severity</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Medical Response</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => (
              <tr key={alert.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Clock size={16} />
                    {new Date(alert.timestamp || alert.time).toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {alert.arrhythmia_type || alert.type}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                    backgroundColor: alert.severity === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: alert.severity === 'Critical' ? 'var(--accent-red)' : 'var(--accent-orange)'
                  }}>
                    {alert.severity}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {alert.resolved ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)' }}>
                      <CheckCircle size={16} /> Reviewed by Doctor
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-orange)' }}>
                      <AlertTriangle size={16} /> Awaiting Review
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: 'var(--accent-green)' }} />
                  <div>Excellent! You have no recorded cardiac alerts.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientAlerts;
