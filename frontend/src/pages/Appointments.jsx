import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser()?.user;
  const isDoctor = user?.role === 'Doctor';

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`/api/appointments/${user?.id}/${user?.role}`);
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    const date = e.target.date.value;
    const reason = e.target.reason.value;
    // Mock doctor ID for now if patient doesn't pick one
    const doctor_id = 2; 

    try {
      await axios.post('/api/appointments/book', {
        patient_id: user?.id,
        doctor_id,
        appointment_date: date,
        reason
      });
      fetchAppointments();
      e.target.reset();
    } catch (error) {
      console.error('Failed to book appointment', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2><Calendar style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Appointments</h2>
      </div>

      {!isDoctor && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3>Book New Appointment</h3>
          <form onSubmit={handleBook} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <input type="datetime-local" name="date" required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="text" name="reason" placeholder="Reason for visit..." required style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <button type="submit" className="btn btn-primary"><Plus size={18} style={{ verticalAlign: 'middle' }} /> Book</button>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h3>{isDoctor ? 'Patient Appointments' : 'My Appointments'}</h3>
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Date & Time</th>
                <th style={{ padding: '1rem' }}>{isDoctor ? 'Patient ID' : 'Doctor ID'}</th>
                <th style={{ padding: '1rem' }}>Reason</th>
                <th style={{ padding: '1rem' }}>Status</th>
                {isDoctor && <th style={{ padding: '1rem' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No appointments found.</td></tr>
              ) : appointments.map(apt => (
                <tr key={apt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{new Date(apt.appointment_date).toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{isDoctor ? apt.patient_id : apt.doctor_id}</td>
                  <td style={{ padding: '1rem' }}>{apt.reason}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem',
                      background: apt.status === 'Approved' ? 'rgba(34, 197, 94, 0.2)' : apt.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: apt.status === 'Approved' ? '#4ade80' : apt.status === 'Pending' ? '#facc15' : '#f87171'
                    }}>
                      {apt.status}
                    </span>
                  </td>
                  {isDoctor && (
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleUpdateStatus(apt.id, 'Approved')} style={{ background: 'transparent', border: 'none', color: '#4ade80', cursor: 'pointer' }}><CheckCircle size={20} /></button>
                      <button onClick={() => handleUpdateStatus(apt.id, 'Rejected')} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}><XCircle size={20} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Appointments;
