import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import { Users, AlertTriangle, FileText, HeartPulse, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser()?.user;
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({ 
    totalPatients: 0, icuPatients: 0, opPatients: 0, 
    criticalPatients: 0, totalDoctors: 0, appointmentsToday: 0 
  });
  const [alerts, setAlerts] = useState([]);
  
  // ICU Management state
  const [admissions, setAdmissions] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedBeds, setSelectedBeds] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, patientsRes, apptsRes, bedsRes, admissionsRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/admin/patients').catch(() => ({ data: [] })),
          axios.get('/api/appointments').catch(() => ({ data: [] })),
          axios.get('/api/icu/beds').catch(() => ({ data: [] })),
          axios.get('/api/icu/admissions').catch(() => ({ data: [] }))
        ]);
        
        const allUsers = usersRes.data;
        const allPatients = patientsRes.data;
        const allAppts = apptsRes.data;

        setUsers(allUsers);
        setBeds(bedsRes.data);
        setAdmissions(admissionsRes.data);

        // Calculate metrics
        const doctorsCount = allUsers.filter(u => u.role === 'Doctor').length;
        const icuCount = allPatients.filter(p => p.patient_type === 'ICU').length;
        const opCount = allPatients.filter(p => p.patient_type === 'OP').length;
        const criticalCount = allPatients.filter(p => p.status === 'Critical').length;
        
        const today = new Date().toISOString().split('T')[0];
        const apptsToday = allAppts.filter(a => a.appointment_date && a.appointment_date.startsWith(today)).length;

        setMetrics({
          totalPatients: allPatients.length,
          icuPatients: icuCount,
          opPatients: opCount,
          criticalPatients: criticalCount,
          totalDoctors: doctorsCount,
          appointmentsToday: apptsToday
        });

      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAssignBed = async (admissionId) => {
    const bedId = selectedBeds[admissionId];
    if (!bedId) {
      alert("Please select a bed to assign.");
      return;
    }
    try {
      await axios.put(`/api/icu/assign-bed/${admissionId}`, { bed_id: bedId });
      alert("Patient successfully admitted to ICU bed.");
      
      // Refresh ICU data
      const [bedsRes, admissionsRes] = await Promise.all([
        axios.get('/api/icu/beds'),
        axios.get('/api/icu/admissions')
      ]);
      setBeds(bedsRes.data);
      setAdmissions(admissionsRes.data);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to assign bed");
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h2>Welcome, Admin {user?.full_name}</h2>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
            <HeartPulse color="var(--accent-blue)" size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-secondary)' }}>Total Patients</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.totalPatients}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
            <Activity color="#f87171" size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-secondary)' }}>ICU Patients</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.icuPatients}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
            <Users color="#60a5fa" size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-secondary)' }}>OP Patients</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.opPatients}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: '50%' }}>
            <AlertTriangle color="var(--accent-red)" size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-secondary)' }}>Critical</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.criticalPatients}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
            <Users color="var(--accent-green)" size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-secondary)' }}>Doctors</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.totalDoctors}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%' }}>
            <FileText color="var(--accent-orange)" size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-secondary)' }}>Appts Today</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.appointmentsToday}</p>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>ICU Management</h3>
      <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Patient</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Doctor</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Bed</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map(adm => (
              <tr key={adm.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{adm.patient_name}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{adm.doctor_name}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                    backgroundColor: adm.status === 'Requested' ? 'rgba(234, 179, 8, 0.2)' : adm.status === 'Admitted' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: adm.status === 'Requested' ? '#facc15' : adm.status === 'Admitted' ? '#60a5fa' : '#34d399'
                  }}>
                    {adm.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {adm.status === 'Requested' ? (
                    <select 
                      style={{ padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                      value={selectedBeds[adm.id] || ''}
                      onChange={(e) => setSelectedBeds({...selectedBeds, [adm.id]: e.target.value})}
                    >
                      <option value="">Select Bed...</option>
                      {beds.filter(b => b.status === 'Available').map(bed => (
                        <option key={bed.id} value={bed.id}>{bed.bed_number}</option>
                      ))}
                    </select>
                  ) : (
                    <span>{adm.bed_number || 'None'}</span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  {adm.status === 'Requested' && (
                    <button onClick={() => handleAssignBed(adm.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Assign Bed</button>
                  )}
                </td>
              </tr>
            ))}
            {admissions.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No ICU admissions to show.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Registered Users</h3>
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Phone</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>{u.full_name}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                    backgroundColor: u.role === 'Admin' ? 'rgba(239, 68, 68, 0.2)' : u.role === 'Doctor' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: u.role === 'Admin' ? 'var(--accent-red)' : u.role === 'Doctor' ? 'var(--accent-blue)' : 'var(--accent-green)'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{u.phone}</td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button 
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to remove ${u.full_name}?`)) {
                        try {
                          await axios.delete(`/api/users/${u.id}`);
                          setUsers(users.filter(user => user.id !== u.id));
                        } catch (error) {
                          console.error("Error deleting user:", error);
                          alert('Failed to delete user');
                        }
                      }
                    }} 
                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '0.5rem' }}
                    title="Remove User"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
