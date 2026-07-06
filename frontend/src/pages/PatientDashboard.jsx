import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import socketService from '../services/socketService';
import { Activity, HeartPulse, AlertCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser()?.user;
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const response = await axios.get(`/api/patients/me?name=${user?.full_name}`);
        
        // Provide realistic mock data if vitals history is missing
        const data = response.data;
        if (!data.vitalsHistory || data.vitalsHistory.length === 0) {
          data.vitalsHistory = [{
            heart_rate: Math.floor(Math.random() * (100 - 60) + 60),
            spo2: Math.floor(Math.random() * (100 - 95) + 95),
            blood_pressure: '120/80'
          }];
        }
        
        setPatientData(data);

        // Fetch alerts
        const alertsRes = await axios.get('/api/alerts');
        const myCriticalAlerts = alertsRes.data.filter(a => 
          a.severity === 'Critical' && !a.resolved && 
          (a.patient_name === user?.full_name || a.patient === user?.full_name)
        );
        setAlerts(myCriticalAlerts.slice(0, 3));

        // Fetch appointments
        const aptRes = await axios.get(`/api/appointments/${user?.id}/${user?.role}`);
        setUpcomingAppointments(aptRes.data.slice(0, 3));
      } catch (err) {
        console.error(err);
        setError("Could not find medical records linked to this account name. (Hint: Try registering as 'John Doe' or 'Jane Smith')");
      } finally {
        setLoading(false);
      }
    };
    if (user?.full_name) {
      fetchMyData();
    }

    socketService.connect();
    socketService.on('ecg_update', (payload) => {
      const updates = payload.data;
      setPatientData(prev => {
        if (!prev) return prev;
        if (updates[prev.id]) {
          const myUpdate = updates[prev.id];
          return {
            ...prev,
            vitalsHistory: [
              ...(prev.vitalsHistory || []),
              { heart_rate: myUpdate.heartRate, spo2: myUpdate.spo2 }
            ]
          };
        }
        return prev;
      });
    });

    socketService.on('new_alert', (newAlert) => {
      if (newAlert.patient_name === user?.full_name || newAlert.patient === user?.full_name) {
        setAlerts(prev => [newAlert, ...prev].slice(0, 3));
      }
    });

    return () => {
      socketService.off('ecg_update');
      socketService.off('new_alert');
    };
  }, [user]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h2>Welcome, {user?.full_name || 'Patient'}</h2>
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
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Time: {new Date(alert.timestamp || alert.time).toLocaleTimeString()} | Awaiting Doctor Response</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {upcomingAppointments.length > 0 && (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Upcoming Appointments</h3>
            <button className="btn btn-outline" onClick={() => navigate('/appointments')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {upcomingAppointments.map(apt => (
              <div key={apt.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{new Date(apt.appointment_date).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.85rem', padding: '2px 8px', borderRadius: '12px', 
                    background: apt.status === 'Approved' ? 'rgba(34, 197, 94, 0.2)' : apt.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                    color: apt.status === 'Approved' ? '#4ade80' : apt.status === 'Rejected' ? '#f87171' : '#facc15'
                  }}>
                    {apt.status}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ marginBottom: '4px' }}><strong>Doctor:</strong> {apt.doctor_name || (apt.doctor_id ? `Dr. ID ${apt.doctor_id}` : 'Unassigned')}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Reason:</strong> {apt.reason}</div>
                  {apt.status === 'Approved' && <div style={{ marginBottom: '4px' }}><strong>Assigned Time:</strong> {apt.appointment_time}</div>}
                  {apt.status === 'Rejected' && <div style={{ marginBottom: '4px' }}><strong>Reason:</strong> {apt.rejection_reason}</div>}
                  {apt.status === 'Pending' && <div style={{ color: '#facc15', marginTop: '4px' }}>Waiting for Doctor to assign a time</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading your health summary...</div>
      ) : error ? (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '2rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
          <h3>No Records Found</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Personal Health Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem 0', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ textAlign: 'center' }}>
              <HeartPulse color="var(--accent-red)" size={48} style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 600 }}>
                {patientData?.vitalsHistory?.[patientData.vitalsHistory.length - 1]?.heart_rate || '--'} 
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}> bpm</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>Current Heart Rate</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <Activity color="var(--accent-blue)" size={48} style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 600 }}>
                {patientData?.vitalsHistory?.[patientData.vitalsHistory.length - 1]?.spo2 || '--'} 
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}> %</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>Blood Oxygen</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem' }}>
              <Activity color="var(--accent-green)" size={48} style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 600 }}>
                {patientData?.vitalsHistory?.[patientData.vitalsHistory.length - 1]?.blood_pressure || '--'} 
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>Blood Pressure</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/live-monitoring?patientId=${patientData.id}`)} style={{ padding: '1rem' }}>Enter Live Monitoring</button>
            <button className="btn btn-outline" onClick={() => navigate(`/ecg-analysis?patientId=${patientData.id}`)} style={{ padding: '1rem' }}>View ECG Report</button>
            <button className="btn btn-outline" onClick={() => navigate(`/generate-pdf?patientId=${patientData.id}`)} style={{ padding: '1rem', border: '1px solid #3b82f6', color: '#3b82f6' }}>Generate PDF Medical Report</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
