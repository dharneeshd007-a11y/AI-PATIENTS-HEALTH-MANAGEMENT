import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, Edit, Activity, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalNotesModal from '../components/MedicalNotesModal';

const AdminPatients = () => {
  const navigate = useNavigate();
  const [selectedPatientForNotes, setSelectedPatientForNotes] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const fetchData = async () => {
    try {
      const [patientsRes, usersRes] = await Promise.all([
        axios.get('/api/patients'),
        axios.get('/api/users')
      ]);
      setPatients(patientsRes.data);
      setDoctors(usersRes.data.filter(u => u.role === 'Doctor'));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [editPatientId, setEditPatientId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', room: '', phone: '', doctor_name: '', status: 'Stable', mrn: '' });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this patient? All their medical data and alerts will be lost.')) {
      try {
        await axios.delete(`/api/patients/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting patient:", error);
        alert('Failed to delete patient');
      }
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/patients', formData);
      setShowForm(false);
      setFormData({ name: '', age: '', gender: 'Male', room: '', phone: '', doctor_name: '', status: 'Stable', mrn: '' });
      fetchData();
    } catch (error) {
      console.error("Error adding patient:", error);
      alert('Failed to add patient');
    }
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    try {
      await axios.put(`/api/patients/${id}`, formData);
      setEditPatientId(null);
      setFormData({ name: '', age: '', gender: 'Male', room: '', phone: '', doctor_name: '', status: 'Stable', mrn: '' });
      fetchData();
    } catch (error) {
      console.error("Error updating patient:", error);
      alert('Failed to update patient');
    }
  };

  const startEdit = (patient) => {
    setEditPatientId(patient.id);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      room: patient.room,
      phone: patient.phone || '',
      doctor_name: patient.doctor_name || '',
      status: patient.status,
      mrn: patient.mrn || ''
    });
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Patient Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage medical records and telemetry assignment</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditPatientId(null); setFormData({ name: '', age: '', gender: 'Male', room: '', phone: '', doctor_name: '', status: 'Stable', mrn: '' }); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} /> {showForm ? 'Cancel' : 'Add New Patient'}
        </button>
      </div>

      {(showForm || editPatientId) && (
        <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editPatientId ? 'Edit Patient Record' : 'Patient Intake Form'}</h3>
          <form onSubmit={(e) => editPatientId ? handleEditSubmit(e, editPatientId) : handleAddPatient(e)} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input type="text" placeholder="MRN (e.g. PT-100)" required value={formData.mrn} onChange={e => setFormData({...formData, mrn: e.target.value})} className="input-field" style={{ flex: '1 1 100px' }} />
            <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" style={{ flex: '1 1 200px' }} />
            <input type="number" placeholder="Age" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="input-field" style={{ flex: '1 1 100px' }} />
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="input-field" style={{ flex: '1 1 150px' }}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input type="text" placeholder="Room Number" required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="input-field" style={{ flex: '1 1 150px' }} />
            <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" style={{ flex: '1 1 150px' }} />
            <select value={formData.doctor_name} onChange={e => setFormData({...formData, doctor_name: e.target.value})} className="input-field" style={{ flex: '1 1 200px' }}>
              <option value="">Assign Primary Physician...</option>
              {doctors.map(d => (
                <option key={d.id} value={d.full_name}>{d.full_name}</option>
              ))}
            </select>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input-field" style={{ flex: '1 1 150px' }}>
              <option value="Stable">Stable</option>
              <option value="Observation">Observation</option>
              <option value="Critical">Critical</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ flex: '1 1 100%' }}>{editPatientId ? 'Update Patient Record' : 'Save Patient Record'}</button>
            {editPatientId && (
              <button type="button" className="btn btn-outline" onClick={() => { setEditPatientId(null); setFormData({ name: '', age: '', gender: 'Male', room: '', phone: '', doctor_name: '', status: 'Stable', mrn: '' }); }} style={{ flex: '1 1 100%' }}>Cancel Edit</button>
            )}
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>MRN</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Name / Phone</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Age / Gender</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Room</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Doctor</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{p.mrn || `#${p.id}`}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.phone || 'N/A'}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{p.age} / {p.gender}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{p.room}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>{p.doctor_name || 'Unassigned'}</td>
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
                    <button onClick={() => setSelectedPatientForNotes(p)} title="Medical Notes" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><FileText size={18} /></button>
                    <div style={{ width: '1px', backgroundColor: 'var(--glass-border)', margin: '0 5px' }}></div>
                    <button onClick={() => startEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }} title="Edit Patient"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }} title="Remove Patient"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No patients found.</td>
              </tr>
            )}
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

export default AdminPatients;
