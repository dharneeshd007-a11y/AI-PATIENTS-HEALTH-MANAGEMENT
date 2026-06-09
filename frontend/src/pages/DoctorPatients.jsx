import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, FileText, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalNotesModal from '../components/MedicalNotesModal';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientForNotes, setSelectedPatientForNotes] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('/api/patients');
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Patients</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View your assigned patients and health data</p>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Patient Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Room</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Vitals</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{p.name} <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.age} yrs | {p.gender}</div></td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{p.room}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontSize: '0.9rem' }}>HR: {p.hr || '--'} bpm</div>
                  <div style={{ fontSize: '0.9rem' }}>SpO2: {p.spo2 || '--'}%</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                    backgroundColor: p.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : p.status === 'Stable' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: p.status === 'Critical' ? 'var(--accent-red)' : p.status === 'Stable' ? 'var(--accent-green)' : 'var(--accent-orange)'
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate(`/live-monitoring?patientId=${p.id}`)} title="Live Monitoring" style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}><Activity size={18} /></button>
                    <button onClick={() => navigate(`/ecg-analysis?patientId=${p.id}`)} title="ECG Analysis" style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}><Eye size={18} /></button>
                    <button onClick={() => setSelectedPatientForNotes(p)} title="Add Note" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><FileText size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPatientForNotes && (
        <MedicalNotesModal 
          patient={selectedPatientForNotes} 
          onClose={() => setSelectedPatientForNotes(null)} 
        />
      )}
    </div>
  );
};

export default DoctorPatients;
