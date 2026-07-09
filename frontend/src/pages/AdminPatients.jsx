import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, Edit, Activity, Eye, FileText, HeartPulse, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalNotesModal from '../components/MedicalNotesModal';

const AdminPatients = () => {
  const navigate = useNavigate();
  const [selectedPatientForNotes, setSelectedPatientForNotes] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // Filters and Pagination
  const [filterType, setFilterType] = useState('ICU');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      // Build query string
      let url = '/api/admin/patients?';
      if (filterType !== 'All') url += `type=${filterType}&`;
      if (filterStatus !== 'All') url += `status=${filterStatus}`;

      const [patientsRes, usersRes] = await Promise.all([
        axios.get(url),
        axios.get('/api/users')
      ]);
      setPatients(patientsRes.data);
      setDoctors(usersRes.data.filter(u => u.role === 'Doctor'));
    } catch (error) {
      console.error("Error fetching admin patients:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const socketService = require('../services/socketService').default;
    socketService.connect();
    socketService.on('new_alert', fetchData);
    return () => socketService.off('new_alert', fetchData);
  }, [filterType, filterStatus]);

  const [editPatientId, setEditPatientId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', age: '', gender: 'Male', phone: '', 
    patient_type: 'OP', status: 'Stable', mrn: '',
    room_no: '', bed_no: '', ward: '', assigned_doctor_id: '' 
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient? \n\nWARNING: This will permanently delete the patient, along with all their appointments, medications, reports, and monitoring records.')) {
      try {
        await axios.delete(`/api/admin/patients/${id}`);
        fetchData();
        // Toast notification could go here
      } catch (error) {
        alert('Failed to delete patient');
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/patients', formData);
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to add patient');
    }
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/patients/${id}`, formData);
      setEditPatientId(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to update patient');
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', age: '', gender: 'Male', phone: '', 
      patient_type: 'ICU', status: 'Stable', mrn: '',
      room_no: '', bed_no: '', ward: '', assigned_doctor_id: '' 
    });
  };

  const startEdit = (patient) => {
    setEditPatientId(patient.id);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone || '',
      patient_type: patient.patient_type || 'ICU',
      status: patient.status || 'Stable',
      mrn: patient.mrn || '',
      room_no: patient.room_no || '',
      bed_no: patient.bed_no || '',
      ward: patient.ward || '',
      assigned_doctor_id: patient.assigned_doctor_id || ''
    });
    setShowForm(false);
  };

  const filteredSearch = patients.filter(p => {
    const name = p.name || p.full_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (p.mrn && p.mrn.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Full Patient Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Complete control over ICU patient registries</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditPatientId(null); resetForm(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} /> {showForm ? 'Cancel' : 'Add New Patient'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['ICU'].map(type => (
            <button key={type} onClick={() => setFilterType(type)} className={filterType === type ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '0.4rem 1rem' }}>
              {type} Patients
            </button>
          ))}
          <div style={{ width: '1px', backgroundColor: 'var(--glass-border)', margin: '0 5px' }}></div>
          {['All', 'Critical', 'Stable', 'Recovered'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} className={filterStatus === status ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '0.4rem 1rem' }}>
              {status}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search Name or MRN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '35px', width: '250px' }}
          />
        </div>
      </div>

      {(showForm || editPatientId) && (
        <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editPatientId ? 'Edit Patient Record' : 'Add New Patient'}</h3>
          <form onSubmit={(e) => editPatientId ? handleEditSubmit(e, editPatientId) : handleAddSubmit(e)} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            
            {/* Core Details */}
            <input type="text" placeholder="MRN (e.g. PT-100)" required value={formData.mrn} onChange={e => setFormData({...formData, mrn: e.target.value})} className="input-field" style={{ flex: '1 1 120px' }} />
            <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" style={{ flex: '1 1 200px' }} />
            <input type="number" placeholder="Age" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="input-field" style={{ flex: '1 1 80px' }} />
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="input-field" style={{ flex: '1 1 120px' }}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" style={{ flex: '1 1 150px' }} />
            
            {/* Classification */}
            <select value={formData.patient_type} onChange={e => setFormData({...formData, patient_type: e.target.value})} className="input-field" style={{ flex: '1 1 120px', fontWeight: 'bold' }}>
              <option value="ICU">ICU Patient</option>
            </select>

            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input-field" style={{ flex: '1 1 120px' }}>
              <option value="Stable">Stable</option>
              <option value="Critical">Critical</option>
              <option value="Recovered">Recovered</option>
            </select>

            <select value={formData.assigned_doctor_id} onChange={e => setFormData({...formData, assigned_doctor_id: e.target.value})} className="input-field" style={{ flex: '1 1 200px' }}>
              <option value="">Assign Doctor...</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.full_name}</option>
              ))}
            </select>

            {/* ICU Specific Fields */}
            {formData.patient_type === 'ICU' && (
              <>
                <div style={{ flex: '1 1 100%', padding: '0.5rem 0', color: 'var(--accent-red)', fontWeight: 'bold' }}>ICU Assignment Details</div>
                <input type="text" placeholder="Ward (e.g. Cardiology)" value={formData.ward} onChange={e => setFormData({...formData, ward: e.target.value})} className="input-field" style={{ flex: '1 1 150px' }} />
                <input type="text" placeholder="Room No" value={formData.room_no} onChange={e => setFormData({...formData, room_no: e.target.value})} className="input-field" style={{ flex: '1 1 120px' }} />
                <input type="text" placeholder="Bed No" value={formData.bed_no} onChange={e => setFormData({...formData, bed_no: e.target.value})} className="input-field" style={{ flex: '1 1 120px' }} />
              </>
            )}

            <div style={{ flex: '1 1 100%', display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: '1' }}>{editPatientId ? 'Update Patient Record' : 'Create Patient Record'}</button>
              {editPatientId && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditPatientId(null); resetForm(); }} style={{ flex: '1' }}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'x-auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Patient ID</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>MRN</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Name / Demographics</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Type</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Assigned Doctor</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Location / Next Appt</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSearch.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>PT-{1000 + p.id}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.mrn || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{p.full_name || p.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.age} yrs • {p.gender} • {p.phone}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {p.patient_type === 'ICU' ? (
                    <span className="badge badge-pulse" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>🟥 ICU</span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>🟦 OP</span>
                  )}
                </td>
                <td style={{ padding: '1rem', color: 'var(--accent-cyan)' }}>Dr. {p.doctor_name || 'Unassigned'}</td>
                <td style={{ padding: '1rem' }}>
                  {p.patient_type === 'ICU' ? (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <div><strong>Ward:</strong> {p.ward || '--'}</div>
                      <div><strong>Room:</strong> {p.room_no || '--'} | <strong>Bed:</strong> {p.bed_no || '--'}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {p.next_appointment_date ? (
                        <>
                          <div><strong>Appt:</strong> {new Date(p.next_appointment_date).toLocaleDateString()}</div>
                          <div><strong>Time:</strong> {p.next_appointment_time || '--'}</div>
                        </>
                      ) : 'No Upcoming Appts'}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 500,
                    backgroundColor: p.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : p.status === 'Recovered' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: p.status === 'Critical' ? 'var(--accent-red)' : p.status === 'Recovered' ? 'var(--accent-green)' : 'var(--accent-orange)'
                  }}>
                    {p.status || 'Monitoring'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {p.patient_type === 'ICU' && (
                      <button onClick={() => navigate(`/live-monitoring?patientId=${p.id}`)} title="Live Monitoring" className="action-btn" style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}><Activity size={18} /></button>
                    )}
                    <button onClick={() => navigate(`/medications?patientId=${p.id}`)} title="Medical Records" className="action-btn" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><FileText size={18} /></button>
                    <div style={{ width: '1px', backgroundColor: 'var(--glass-border)', margin: '0 5px' }}></div>
                    <button onClick={() => startEdit(p)} title="Edit Patient" className="action-btn" style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}><Edit size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} title="Delete Patient" className="action-btn" style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSearch.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No patients found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .badge-pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .action-btn { transition: transform 0.2s; }
        .action-btn:hover { transform: scale(1.2); }
      `}} />
    </div>
  );
};

export default AdminPatients;
