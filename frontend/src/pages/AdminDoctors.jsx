import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, Edit } from 'lucide-react';
import authService from '../services/authService';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/users');
      setDoctors(response.data.filter(u => u.role === 'Doctor'));
      
      const pendingResponse = await axios.get('/api/users/admin/approved-doctors');
      setPendingDoctors(pendingResponse.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const [editDoctorId, setEditDoctorId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this doctor?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        fetchDoctors();
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert('Failed to delete doctor');
      }
    }
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${id}`, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        badge_id: formData.badge_id
      });
      setEditDoctorId(null);
      setFormData({ full_name: '', email: '', phone: '', password: '', role: 'Doctor', badge_id: '' });
      fetchDoctors();
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert('Failed to update doctor');
    }
  };

  const startEdit = (doc) => {
    setEditDoctorId(doc.id);
    setFormData({
      full_name: doc.full_name,
      email: doc.email,
      phone: doc.phone,
      password: '',
      role: 'Doctor',
      badge_id: doc.badge_id || ''
    });
    setShowForm(false);
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', password: '', role: 'Doctor', badge_id: '' });

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/admin/add-doctor', formData);
      setShowForm(false);
      setFormData({ full_name: '', email: '', phone: '', password: '', role: 'Doctor', badge_id: '' });
      alert('Doctor added to approved registry successfully. They must now register their account using their phone number.');
      fetchDoctors();
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert(error.response?.data?.message || 'Failed to add doctor');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Doctor Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage hospital staff and doctor accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditDoctorId(null); setFormData({ full_name: '', email: '', phone: '', password: '', role: 'Doctor', badge_id: '' }); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} /> {showForm ? 'Cancel' : 'Add New Doctor'}
        </button>
      </div>

      {(showForm || editDoctorId) && (
        <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editDoctorId ? 'Edit Doctor Record' : 'Doctor Registration Form'}</h3>
          <form onSubmit={(e) => editDoctorId ? handleEditSubmit(e, editDoctorId) : handleAddDoctor(e)} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Badge ID (e.g. MD-100)" required value={formData.badge_id} onChange={e => setFormData({...formData, badge_id: e.target.value})} className="input-field" style={{ flex: '1 1 100px' }} />
            <input type="text" placeholder="Full Name" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="input-field" style={{ flex: '1 1 200px' }} />
            <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" style={{ flex: '1 1 200px' }} />
            <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" style={{ flex: '1 1 150px' }} />

            <button type="submit" className="btn btn-primary" style={{ flex: '1 1 100%' }}>{editDoctorId ? 'Update Doctor Account' : 'Create Doctor Account'}</button>
            {editDoctorId && (
              <button type="button" className="btn btn-outline" onClick={() => { setEditDoctorId(null); setFormData({ full_name: '', email: '', phone: '', password: '', role: 'Doctor', badge_id: '' }); }} style={{ flex: '1 1 100%' }}>Cancel Edit</button>
            )}
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Badge ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Phone</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{d.badge_id || `#${d.id}`}</td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{d.full_name}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{d.email}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{d.phone}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: 'var(--accent-green)'
                  }}>
                    Active
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => startEdit(d)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }} title="Edit Doctor"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }} title="Remove Doctor"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingDoctors.map(d => (
              <tr key={'pending-'+d.id} style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{d.badge_id || `-`}</td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{d.full_name}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{d.email}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{d.phone}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: 'var(--accent-orange)'
                  }}>
                    Pending Registration
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Waiting for user</span>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && pendingDoctors.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No doctors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDoctors;
