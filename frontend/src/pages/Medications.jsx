import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { Pill, Trash2, Plus } from 'lucide-react';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser()?.user;

  useEffect(() => {
    fetchMedications();
  }, [user]);

  const fetchMedications = async () => {
    try {
      const res = await axios.get(`/api/medications/patient/${user?.id}`);
      setMedications(res.data);
    } catch (error) {
      console.error('Failed to fetch medications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const dosage = e.target.dosage.value;
    const schedule = e.target.schedule.value;

    try {
      await axios.post('/api/medications', {
        patient_id: user?.id,
        name,
        dosage,
        schedule
      });
      fetchMedications();
      e.target.reset();
    } catch (error) {
      console.error('Failed to add medication', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/medications/${id}`);
      fetchMedications();
    } catch (error) {
      console.error('Failed to delete medication', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2><Pill style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Medication Reminders</h2>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Medication</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input type="text" name="name" placeholder="Medication Name (e.g. Lisinopril)" required style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          <input type="text" name="dosage" placeholder="Dosage (e.g. 10mg)" required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          <input type="text" name="schedule" placeholder="Schedule (e.g. Morning, Night)" required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          <button type="submit" className="btn btn-primary"><Plus size={18} style={{ verticalAlign: 'middle' }} /> Add</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? <p>Loading...</p> : medications.length === 0 ? <p>No medications found.</p> : medications.map(med => (
          <div key={med.id} className="glass-card" style={{ position: 'relative' }}>
            <button 
              onClick={() => handleDelete(med.id)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
            >
              <Trash2 size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '50%' }}>
                <Pill color="#3b82f6" size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{med.name}</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{med.dosage}</span>
              </div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.95rem' }}>
              <strong>Schedule:</strong> {med.schedule}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Medications;
