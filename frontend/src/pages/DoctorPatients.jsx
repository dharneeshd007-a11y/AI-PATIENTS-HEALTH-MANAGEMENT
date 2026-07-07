import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, FileText, Activity, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalNotesModal from '../components/MedicalNotesModal';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientForNotes, setSelectedPatientForNotes] = useState(null);
  const [activeTab, setActiveTab] = useState('OP');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'))?.user;

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
  }, [activeTab]);

  const handleRequestAdmission = async (patientId) => {
    try {
      await axios.post('/api/icu/request-admission', { patient_id: patientId, doctor_id: user?.id });
      alert("ICU Admission requested successfully. Admin must now assign a bed.");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to request admission");
    }
  };

  const handleDischarge = async (patientId) => {
    if(window.confirm("Are you sure you want to discharge this patient from the ICU?")) {
      try {
        await axios.put(`/api/icu/discharge/${patientId}`);
        alert("Patient discharged successfully back to OP.");
        // Refresh patients list
        const response = await axios.get('/api/patients');
        setPatients(response.data);
      } catch (error) {
        alert(error.response?.data?.error || "Failed to discharge patient");
      }
    }
  };

  const filteredPatients = patients.filter(p => (p.patient_type || 'OP') === activeTab);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Patients</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage Outpatient (OP) and Inpatient (ICU) workflows</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
        <button 
          onClick={() => setActiveTab('OP')} 
          style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'OP' ? '2px solid var(--accent-blue)' : '2px solid transparent', color: activeTab === 'OP' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeTab === 'OP' ? 'bold' : 'normal' }}
        >
          OP Patients
        </button>
        <button 
          onClick={() => setActiveTab('ICU')} 
          style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'ICU' ? '2px solid var(--accent-red)' : '2px solid transparent', color: activeTab === 'ICU' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeTab === 'ICU' ? 'bold' : 'normal' }}
        >
          ICU Patients
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Patient ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Patient Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Type</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{activeTab === 'ICU' ? 'Location' : 'Next Appointment'}</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{activeTab === 'ICU' ? 'Vitals' : 'Assigned Doctor'}</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No {activeTab} patients found.</td></tr>
            ) : filteredPatients.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>P{p.id}</td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{p.name} <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.age} yrs | {p.gender}</div></td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {p.patient_type === 'ICU' ? (
                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🟥 ICU</span>
                  ) : (
                    <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🟦 OP</span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  {activeTab === 'ICU' ? (
                    <div>
                      <div>Ward: {p.ward || '--'}</div>
                      <div>Room: {p.room_no || '--'} | Bed: {p.bed_no || '--'}</div>
                    </div>
                  ) : (
                    <div>
                      {p.next_appointment_date ? (
                        <>
                          <div>Date: {new Date(p.next_appointment_date).toLocaleDateString()}</div>
                          <div>Time: {p.next_appointment_time || '--'}</div>
                        </>
                      ) : 'No Upcoming Appts'}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {activeTab === 'ICU' ? (
                    <>
                      <div style={{ fontSize: '0.9rem' }}>HR: {p.hr || '--'} bpm</div>
                      <div style={{ fontSize: '0.9rem' }}>SpO2: {p.spo2 || '--'}%</div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--accent-cyan)' }}>Dr. {p.doctor_name || 'Unassigned'}</div>
                  )}
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
                    {activeTab === 'ICU' && (
                      <>
                        <button onClick={() => navigate(`/live-monitoring?patientId=${p.id}`)} title="Live Monitoring" style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}><Activity size={18} /></button>
                        <button onClick={() => navigate(`/ecg-analysis?patientId=${p.id}`)} title="ECG Analysis" style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}><Eye size={18} /></button>
                        <button onClick={() => handleDischarge(p.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>Discharge</button>
                      </>
                    )}
                    <button onClick={() => navigate(`/medications?patientId=${p.id}`)} title="Prescribe Medication" style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}><Pill size={18} /></button>
                    <button onClick={() => setSelectedPatientForNotes(p)} title="Add Note" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><FileText size={18} /></button>
                    {activeTab === 'OP' && (
                      <button onClick={() => handleRequestAdmission(p.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>Admit to ICU</button>
                    )}
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
