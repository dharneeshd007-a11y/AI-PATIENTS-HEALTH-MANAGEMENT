import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import { Pill, Trash2, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

const Medications = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';
  const [patientName, setPatientName] = useState('');
  
  const user = authService.getCurrentUser()?.user;
  const isDoctor = user?.role === 'Doctor';
  const isAdmin = user?.role === 'Admin';
  const isPatient = user?.role === 'Patient';

  useEffect(() => {
    fetchData();
    if (isPatient) {
      fetchHistory();
    }
    if (initialPatientId && isDoctor) {
      axios.get('/api/patients').then(res => {
        const p = res.data.find(x => x.id == initialPatientId);
        if (p) setPatientName(p.name);
      }).catch(err => console.error(err));
    }
  }, [user, initialPatientId]);

  const fetchData = async () => {
    try {
      let url = '/api/medications/prescriptions';
      if (isPatient) url = `/api/medications/prescriptions/patient/${user?.id}`;
      if (isDoctor) url = `/api/medications/prescriptions/doctor/${user?.id}`;
      
      const res = await axios.get(url);
      setPrescriptions(res.data);
    } catch (error) {
      console.error('Failed to fetch prescriptions', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`/api/medications/medication-history/${user?.id}`);
      setHistory(res.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    
    try {
      await axios.post('/api/medications/prescriptions', {
        doctor_id: user?.id,
        patient_id: data.patient_id,
        medicine_name: data.medicine_name,
        dosage: data.dosage,
        frequency: data.frequency,
        reminder_time: data.reminder_time,
        start_date: data.start_date,
        end_date: data.end_date,
        instructions: data.instructions
      });
      fetchData();
      e.target.reset();
    } catch (error) {
      console.error('Failed to add prescription', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/medications/prescriptions/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete prescription', error);
    }
  };

  const handleLogStatus = async (prescription_id, status) => {
    try {
      await axios.post('/api/medications/medication-history', {
        prescription_id,
        patient_id: user?.id,
        status
      });
      fetchHistory();
    } catch (error) {
      console.error('Failed to log history', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2><Pill style={{ verticalAlign: 'middle', marginRight: '10px' }} /> {isDoctor ? 'Prescription Management' : 'Medication Reminders'}</h2>
      </div>

      {isDoctor && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3>Create New Prescription</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="number" name="patient_id" placeholder="Patient ID" defaultValue={initialPatientId} readOnly={!!initialPatientId} required style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: initialPatientId ? 'var(--text-secondary)' : 'white' }} />
              {patientName && <span style={{ color: 'var(--accent-green)', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>✓ {patientName}</span>}
            </div>
            <input type="text" name="medicine_name" placeholder="Medicine Name (e.g. Lisinopril)" required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="text" name="dosage" placeholder="Dosage (e.g. 10mg)" required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="text" name="frequency" placeholder="Frequency (e.g. Once Daily)" required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="time" name="reminder_time" required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="text" name="instructions" placeholder="Instructions (e.g. After food)" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="date" name="start_date" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="date" name="end_date" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            
            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}><Plus size={18} style={{ verticalAlign: 'middle' }} /> Prescribe Medication</button>
          </form>
        </div>
      )}

      <h3>Active Prescriptions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {loading ? <p>Loading...</p> : prescriptions.length === 0 ? <p>No prescriptions found.</p> : prescriptions.map(med => (
          <div key={med.id} className="glass-card" style={{ position: 'relative' }}>
            {isDoctor && (
              <button 
                onClick={() => handleDelete(med.id)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '50%' }}>
                <Pill color="#3b82f6" size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, paddingRight: '20px' }}>{med.medicine_name}</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{med.dosage} • {med.frequency}</span>
              </div>
            </div>
            
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div><strong><Clock size={14} style={{verticalAlign: 'middle'}}/> Reminder Time:</strong> {med.reminder_time}</div>
              {med.instructions && <div><strong>Instructions:</strong> {med.instructions}</div>}
              {(isAdmin || isDoctor) && <div><strong>Patient ID:</strong> {med.patient_id}</div>}
            </div>

            {isPatient && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => handleLogStatus(med.id, 'Taken')} className="btn" style={{ flex: 1, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}><CheckCircle size={16} style={{verticalAlign: 'middle'}}/> Mark Taken</button>
                <button onClick={() => handleLogStatus(med.id, 'Missed')} className="btn" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}><XCircle size={16} style={{verticalAlign: 'middle'}}/> Missed</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isPatient && (
        <>
          <h3>Medication History (Last 30 days)</h3>
          <div className="glass-card">
            {history.length === 0 ? <p>No history logged yet.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Date & Time</th>
                    <th style={{ padding: '1rem' }}>Medicine</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(h.created_at).toLocaleString()}</td>
                      <td style={{ padding: '1rem' }}>{h.medicine_name} ({h.dosage})</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem',
                          background: h.status === 'Taken' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: h.status === 'Taken' ? '#4ade80' : '#f87171'
                        }}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Medications;
