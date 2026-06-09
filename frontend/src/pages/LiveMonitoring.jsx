import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Activity, HeartPulse, AlertCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import ECGChart from '../components/ECGChart';
import socketService from '../services/socketService';
import authService from '../services/authService';

const generateECGData = (base) => {
  return Array.from({ length: 50 }, (_, i) => ({
    time: i,
    value: Math.sin(i * 0.5) * 10 + (Math.random() * 5) + base
  }));
};

const LiveMonitoring = () => {
  const [searchParams] = useSearchParams();
  const [activePatientId, setActivePatientId] = useState(searchParams.get('patientId'));
  const navigate = useNavigate();
  const user = authService.getCurrentUser()?.user;

  const [patients, setPatients] = useState([]);
  const [data, setData] = useState({});
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let currentPatientId = activePatientId;
        
        if (!currentPatientId && user?.role === 'Patient') {
          // Auto-detect patient ID for the logged in patient
          const meRes = await axios.get(`/api/patients/me?name=${user?.full_name}`);
          if (meRes.data && meRes.data.id) {
            currentPatientId = meRes.data.id.toString();
            setActivePatientId(currentPatientId);
          } else {
            navigate('/patient-dashboard');
            return;
          }
        }

        const [patientsRes, alertsRes] = await Promise.all([
          axios.get('/api/patients'),
          axios.get('/api/alerts')
        ]);
        
        let fetchedPatients = patientsRes.data;
        if (currentPatientId) {
          fetchedPatients = fetchedPatients.filter(p => p.id.toString() === currentPatientId);
        }
        
        setPatients(fetchedPatients);
        
        // Filter to unresolved critical alerts, take top 3
        let criticalAlerts = alertsRes.data.filter(a => a.severity === 'Critical' && !a.resolved);
        if (user?.role === 'Patient') {
          criticalAlerts = criticalAlerts.filter(a => a.patient_name === user?.full_name || a.patient === user?.full_name);
        }
        setAlerts(criticalAlerts.slice(0, 3));
        
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
  }, [activePatientId, user, navigate]);

  useEffect(() => {
    const handleEcgUpdate = (payload) => {
      const updates = payload.data;
      
      setData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
          if (newData[key] && updates[key]) {
            newData[key] = [
              ...newData[key].slice(1), 
              { time: payload.timestamp, value: updates[key].ecgValue }
            ];
          }
        });
        return newData;
      });

      // Update patients state (hr, spo2, status) outside of setData
      setPatients(prevPatients => {
        let changed = false;
        const newPatients = prevPatients.map(p => {
          const patientUpdate = updates[p.id];
          if (patientUpdate) {
            const newStatus = patientUpdate.status || p.status;
            if (p.hr !== patientUpdate.heartRate || p.spo2 !== patientUpdate.spo2 || p.status !== newStatus) {
              changed = true;
              return { 
                ...p, 
                hr: patientUpdate.heartRate, 
                spo2: patientUpdate.spo2,
                status: newStatus 
              };
            }
          }
          return p;
        });
        return changed ? newPatients : prevPatients;
      });
    };

    const handleNewAlert = (newAlert) => {
      if (user?.role === 'Patient' && newAlert.patient_name !== user?.full_name && newAlert.patient !== user?.full_name) {
        return; // Ignore alerts for other patients
      }
      setAlerts(prev => [newAlert, ...prev].slice(0, 3)); // keep top 3
      // Also mark patient as critical in the grid
      setPatients(prevPatients => prevPatients.map(p => 
        p.id === newAlert.patient_id ? { ...p, status: 'Critical' } : p
      ));
    };

    socketService.connect();
    socketService.on('ecg_update', handleEcgUpdate);
    socketService.on('new_alert', handleNewAlert);

    return () => {
      socketService.off('ecg_update', handleEcgUpdate);
      socketService.off('new_alert', handleNewAlert);
    };
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {activePatientId && user?.role !== 'Patient' && (
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem' }}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {activePatientId ? 'Patient Live Monitoring' : 'Live Monitoring'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {activePatientId ? 'Single patient telemetry view' : 'Multi-patient telemetry grid'}
            </p>
          </div>
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
              {user?.role !== 'Patient' && (
                <button className="btn" onClick={() => window.alert('Acknowledged Alert. Initiating response protocol...')} style={{ backgroundColor: 'var(--accent-red)', color: 'white' }}>Respond</button>
              )}
            </div>
          ))}
        </div>
      )}

      {!activePatientId ? (
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
            </div>
          ))}
        </div>
      ) : (
        patients.map(patient => (
          <div key={patient.id} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `4px solid ${patient.status === 'Critical' ? 'var(--accent-red)' : 'var(--accent-green)'}` }}>
                <div style={{ padding: '1rem', backgroundColor: patient.status === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                  <Activity color={patient.status === 'Critical' ? 'var(--accent-red)' : 'var(--accent-green)'} size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-secondary)' }}>Current Status</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: patient.status === 'Critical' ? 'var(--accent-red)' : 'var(--text-primary)', margin: 0 }}>{patient.status}</p>
                </div>
              </div>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
                  <HeartPulse color="var(--accent-red)" size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-secondary)' }}>Heart Rate</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{patient.hr} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>bpm</span></p>
                </div>
              </div>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
                  <Activity color="var(--accent-blue)" size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-secondary)' }}>SpO2</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{patient.spo2} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>%</span></p>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Live Real-Time Telemetry</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="status-indicator critical animate-pulse-critical" style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-red)' }}></div>
                  <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>LIVE RECORDING</span>
                </div>
              </div>
              <div style={{ transform: 'scaleY(1.3)', transformOrigin: 'center', minHeight: '300px', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <ECGChart data={data[patient.id]} color={patient.status === 'Critical' ? 'var(--accent-red)' : 'var(--accent-cyan)'} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LiveMonitoring;
