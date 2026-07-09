import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import socketService from '../services/socketService';
import { Users, AlertTriangle, Activity, AlertCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser()?.user;
  const [metrics, setMetrics] = useState({ assignedPatients: 0, activeAlerts: 0, todaysMonitoring: 0 });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, alertsRes] = await Promise.all([
          axios.get('/api/patients'),
          axios.get('/api/alerts')
        ]);
        
        const criticalAlerts = alertsRes.data.filter(a => a.severity === 'Critical' && !a.resolved);
        setAlerts(criticalAlerts.slice(0, 3));
        
        setMetrics({
          assignedPatients: patientsRes.data.length, // Assume all for demo, real app would filter by doctor_id
          activeAlerts: criticalAlerts.length,
          todaysMonitoring: patientsRes.data.length // Assume all active nodes today
        });
      } catch (error) {
        console.error("Error fetching doctor metrics:", error);
      }
    };
    fetchData();

    socketService.connect();
    socketService.on('new_alert', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev].slice(0, 3));
      setMetrics(prev => ({
        ...prev,
        activeAlerts: prev.activeAlerts + 1
      }));
    });

    const interval = setInterval(fetchData, 10000); // Auto-reload every 10 seconds

    return () => {
      socketService.off('new_alert');
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h2>Welcome, {user?.full_name?.toLowerCase().startsWith('dr') ? user.full_name : `Dr. ${user?.full_name || 'Doctor'}`}</h2>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{ 
              padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AlertTriangle color="var(--accent-red)" size={24} />
                <div>
                  <div style={{ color: 'var(--accent-red)', fontWeight: 600, fontSize: '1.1rem' }}>CRITICAL: {alert.arrhythmia_type || alert.type}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Patient: {alert.patient_name || alert.patient} | Room: {alert.patient_room || alert.room} | Time: {new Date(alert.timestamp || alert.time).toLocaleTimeString()}</div>
                </div>
              </div>
              <button className="btn" onClick={() => navigate('/alerts')} style={{ backgroundColor: 'var(--accent-red)', color: 'white' }}>Respond</button>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
            <Users color="var(--accent-blue)" size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Assigned Patients</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.assignedPatients}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
            <AlertCircle color="var(--accent-red)" size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Active Alerts</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.activeAlerts}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
            <Activity color="var(--accent-green)" size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Today's Monitoring</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.todaysMonitoring}</p>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary" onClick={() => navigate('/live-monitoring')} style={{ flex: 1, padding: '1.5rem', fontSize: '1.1rem' }}>Enter Live Monitoring</button>
        <button className="btn btn-outline" onClick={() => navigate('/doctor-patients')} style={{ flex: 1, padding: '1.5rem', fontSize: '1.1rem' }}>View Patient List</button>
      </div>
    </div>
  );
};

export default DoctorDashboard;
