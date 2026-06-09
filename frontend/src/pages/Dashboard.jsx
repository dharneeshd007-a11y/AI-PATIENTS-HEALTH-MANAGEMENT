import React, { useState, useEffect } from 'react';
import { Activity, HeartPulse, AlertCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import ECGChart from '../components/ECGChart';

const generateECGData = (base) => {
  return Array.from({ length: 50 }, (_, i) => ({
    time: i,
    value: Math.sin(i * 0.5) * 10 + (Math.random() * 5) + base
  }));
};

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [data, setData] = useState({});
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, alertsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/patients'),
          axios.get('http://localhost:5000/api/alerts')
        ]);
        
        setPatients(patientsRes.data);
        
        // Filter to unresolved critical alerts, take top 3
        const criticalAlerts = alertsRes.data.filter(a => a.severity === 'Critical' && !a.resolved).slice(0, 3);
        setAlerts(criticalAlerts);
        
        // Initialize ECG data
        const initialData = {};
        patientsRes.data.forEach(p => {
          initialData[p.id] = generateECGData(50);
        });
        setData(initialData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(data).length === 0) return;
    
    const interval = setInterval(() => {
      setData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
          if (newData[key]) {
            newData[key] = [...newData[key].slice(1), { time: Date.now(), value: Math.sin(Date.now() * 0.005) * 15 + (Math.random() * 5) + 50 }];
          }
        });
        return newData;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [data]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Patient Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live monitoring of {patients.length} patients</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`status-indicator ${alerts.length > 0 ? 'critical animate-pulse-critical' : 'normal'}`}></div>
            <span>{alerts.length > 0 ? `${alerts.length} Critical Alert(s)` : 'System Normal'}</span>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{ 
              padding: '1rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AlertTriangle color="var(--accent-red)" size={24} />
                <div>
                  <div style={{ color: 'var(--accent-red)', fontWeight: 600, fontSize: '1.1rem' }}>CRITICAL: {alert.arrhythmia_type || alert.type}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Patient: {alert.patient_name || alert.patient} | Room: {alert.patient_room || alert.room} | Time: {new Date(alert.timestamp || alert.time).toLocaleTimeString()}</div>
                </div>
              </div>
              <button className="btn" style={{ backgroundColor: 'var(--accent-red)', color: 'white' }}>Respond</button>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        {patients.map(patient => (
          <div key={patient.id} className="glass-card" style={{ 
            borderColor: patient.status === 'Critical' ? 'rgba(239, 68, 68, 0.5)' : 'var(--glass-border)',
            boxShadow: patient.status === 'Critical' ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{patient.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Room {patient.room}</p>
              </div>
              <div style={{ 
                padding: '0.2rem 0.6rem', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: patient.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: patient.status === 'Critical' ? 'var(--accent-red)' : 'var(--accent-green)'
              }}>
                {patient.status}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <ECGChart data={data[patient.id]} color={patient.status === 'Critical' ? 'var(--accent-red)' : 'var(--accent-green)'} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartPulse color={patient.status === 'Critical' ? 'var(--accent-red)' : 'var(--text-secondary)'} size={18} />
                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: patient.status === 'Critical' ? 'var(--accent-red)' : 'var(--text-primary)' }}>{patient.hr} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>bpm</span></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity color="var(--text-secondary)" size={18} />
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{patient.spo2}%</span>
              </div>
            </div>
            
            {patient.status === 'Critical' && (
              <div style={{ marginTop: '1rem', padding: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle color="var(--accent-red)" size={18} />
                <span style={{ color: 'var(--accent-red)', fontSize: '0.9rem', fontWeight: 500 }}>AI Alert: Atrial Fibrillation Detected</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
