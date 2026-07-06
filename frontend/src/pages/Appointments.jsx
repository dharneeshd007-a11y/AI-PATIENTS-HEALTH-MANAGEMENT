import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null); // { type: 'Approve'|'Reject', id: number }
  const [actionInput, setActionInput] = useState(''); // time or reason

  const user = authService.getCurrentUser()?.user;
  const isDoctor = user?.role === 'Doctor';
  const isAdmin = user?.role === 'Admin';
  const isPatient = user?.role === 'Patient';

  // Admin filters
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      let url = '';
      if (isAdmin) url = '/api/appointments';
      else url = `/api/appointments/${user?.id}/${user?.role}`;
      
      const res = await axios.get(url);
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    const date = e.target.date.value;
    const reason = e.target.reason.value;
    const doctor_id = 2; // Default mock doctor

    if (!user || !user.id) {
      alert("Please login to book an appointment");
      return;
    }

    try {
      await axios.post('/api/appointments/book', {
        patient_id: user.id,
        doctor_id,
        appointment_date: date,
        reason
      });
      alert("Appointment booked successfully!");
      fetchAppointments();
      e.target.reset();
    } catch (error) {
      console.error('Failed to book appointment', error);
      alert(error.response?.data?.error || "Failed to book appointment");
    }
  };

  const submitAction = async () => {
    try {
      if (actionModal.type === 'Approve') {
        await axios.put(`/api/appointments/${actionModal.id}/approve`, { appointment_time: actionInput });
      } else if (actionModal.type === 'Reject') {
        await axios.put(`/api/appointments/${actionModal.id}/reject`, { rejection_reason: actionInput });
      }
      setActionModal(null);
      setActionInput('');
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Approved: { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' },
      Pending: { bg: 'rgba(234, 179, 8, 0.2)', color: '#facc15' },
      Rejected: { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171' },
      Completed: { bg: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' },
      Cancelled: { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' }
    };
    const s = styles[status] || styles.Pending;
    return (
      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', background: s.bg, color: s.color }}>
        {status}
      </span>
    );
  };

  const filteredAppointments = appointments.filter(apt => filter === 'All' || apt.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2><Calendar style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Appointments</h2>
      </div>

      {isPatient && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3>Book New Appointment</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Select a preferred date and provide a reason. The doctor will assign a specific time after reviewing your request.
          </p>
          <form onSubmit={handleBook} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input type="date" name="date" required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="text" name="reason" placeholder="Reason for visit..." required style={{ flex: 1, minWidth: '200px', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <button type="submit" className="btn btn-primary"><Plus size={18} style={{ verticalAlign: 'middle' }} /> Book</button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginRight: '1rem' }}>Filter by Status:</label>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)' }}>
            <option value="All" style={{color:'black'}}>All</option>
            <option value="Pending" style={{color:'black'}}>Pending</option>
            <option value="Approved" style={{color:'black'}}>Approved</option>
            <option value="Rejected" style={{color:'black'}}>Rejected</option>
            <option value="Completed" style={{color:'black'}}>Completed</option>
          </select>
        </div>
      )}

      <div className="glass-card">
        <h3>{isAdmin ? 'All Appointments' : isDoctor ? 'Patient Appointments' : 'My Appointments'}</h3>
        {loading ? <p>Loading...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Assigned Time</th>
                  {(isAdmin || isDoctor) && <th style={{ padding: '1rem' }}>Patient ID</th>}
                  {(isAdmin || isPatient) && <th style={{ padding: '1rem' }}>Doctor ID</th>}
                  <th style={{ padding: '1rem' }}>Reason</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  {isDoctor && <th style={{ padding: '1rem' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '1rem', textAlign: 'center' }}>No appointments found.</td></tr>
                ) : filteredAppointments.map(apt => {
                  let timeDisplay = 'N/A';
                  if (apt.status === 'Pending') timeDisplay = <span style={{color: 'var(--text-secondary)'}}>Waiting for Doctor</span>;
                  else if (apt.appointment_time) timeDisplay = apt.appointment_time;

                  return (
                    <tr key={apt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>{timeDisplay}</td>
                      {(isAdmin || isDoctor) && <td style={{ padding: '1rem' }}>{apt.patient_id}</td>}
                      {(isAdmin || isPatient) && <td style={{ padding: '1rem' }}>{apt.doctor_id}</td>}
                      <td style={{ padding: '1rem' }}>
                        <div>{apt.reason}</div>
                        {apt.rejection_reason && apt.status === 'Rejected' && (
                          <div style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                            Reason: {apt.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>{getStatusBadge(apt.status)}</td>
                      {isDoctor && (
                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                          {apt.status === 'Pending' && (
                            <>
                              <button onClick={() => setActionModal({ type: 'Approve', id: apt.id })} style={{ background: 'transparent', border: 'none', color: '#4ade80', cursor: 'pointer' }} title="Approve & Assign Time"><CheckCircle size={20} /></button>
                              <button onClick={() => setActionModal({ type: 'Reject', id: apt.id })} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }} title="Reject"><XCircle size={20} /></button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '400px', background: 'var(--bg-secondary)' }}>
            <h3>{actionModal.type === 'Approve' ? 'Assign Appointment Time' : 'Reject Appointment'}</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {actionModal.type === 'Approve' ? 'Select a time for this appointment.' : 'Optional: Provide a reason for rejection.'}
            </p>
            
            {actionModal.type === 'Approve' ? (
              <input 
                type="time" 
                value={actionInput} 
                onChange={e => setActionInput(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: '1rem' }} 
              />
            ) : (
              <textarea 
                value={actionInput} 
                onChange={e => setActionInput(e.target.value)} 
                placeholder="Rejection reason..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: '1rem', minHeight: '80px' }} 
              />
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => { setActionModal(null); setActionInput(''); }}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={submitAction}
                disabled={actionModal.type === 'Approve' && !actionInput}
              >
                Confirm {actionModal.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
