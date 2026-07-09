import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import { Users, AlertTriangle, FileText, HeartPulse } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser()?.user;
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({ totalDoctors: 0, totalPatients: 0, totalAlerts: 0, totalReports: 0 });

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, metricsRes, alertsRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/users/admin/metrics'),
          axios.get('/api/alerts')
        ]);
        // Filter out Patient roles from the Registered Users list
        setUsers(usersRes.data.filter(u => u.role !== 'Patient'));
        setMetrics(metricsRes.data);
        setAlerts(alertsRes.data.slice(0, 5)); // Show latest 5 alerts
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchData();
  }, []);

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

      <div className="dashboard-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
            <Users color="var(--accent-blue)" size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Total Doctors</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.totalDoctors}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
            <HeartPulse color="var(--accent-green)" size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Total Patients</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.totalPatients}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
            <AlertTriangle color="var(--accent-red)" size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Total Alerts</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.totalAlerts}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%' }}>
            <FileText color="var(--accent-orange)" size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Total Reports</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.totalReports}</p>
          </div>
        </div>
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
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  {u.phone?.startsWith('G-') ? <span style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>Linked via Google</span> : u.phone}
                </td>
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
