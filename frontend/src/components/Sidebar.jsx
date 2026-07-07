import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Users, AlertTriangle, Settings, FileText, UserPlus, HeartPulse, User, Eye, Monitor, Calendar, Pill, TrendingUp, AlertCircle, Bot } from 'lucide-react';
import authService from '../services/authService';

const Sidebar = () => {
  const currentUser = authService.getCurrentUser()?.user;
  const userRole = currentUser?.role || 'Doctor';
  const patientType = currentUser?.patient_type || 'OP';

  const getDashboardLink = () => {
    if (userRole === 'Admin') return '/admin-dashboard';
    if (userRole === 'Patient') return '/patient-dashboard';
    return '/doctor-dashboard';
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.8rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s'
  });

  return (
    <div style={{
      width: '260px',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      background: 'var(--bg-color-secondary)',
      borderRight: '1px solid var(--glass-border)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10,
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem', padding: '0 1rem' }}>
        <Activity color="var(--accent-cyan)" size={32} />
        <h2 style={{ fontSize: '1.2rem' }}>KMCH <span className="text-gradient">AI</span></h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavLink to={getDashboardLink()} style={navLinkStyle}>
          <Users size={20} /> Dashboard
        </NavLink>

        {userRole === 'Admin' && (
          <>
            <NavLink to="/analytics" style={navLinkStyle}>
              <TrendingUp size={20} /> Analytics
            </NavLink>
            <NavLink to="/admin-doctors" style={navLinkStyle}>
              <UserPlus size={20} /> Doctors
            </NavLink>
            <NavLink to="/admin-patients" style={navLinkStyle}>
              <HeartPulse size={20} /> Patients
            </NavLink>
            <NavLink to="/appointments" style={navLinkStyle}>
              <Calendar size={20} /> Appointments
            </NavLink>
          </>
        )}

        {userRole === 'Doctor' && (
          <>
            <NavLink to="/appointments" style={navLinkStyle}>
              <Calendar size={20} /> Appointments
            </NavLink>
            <NavLink to="/doctor-patients" style={navLinkStyle}>
              <HeartPulse size={20} /> My Patients
            </NavLink>
            <NavLink to="/medications" style={navLinkStyle}>
              <Pill size={20} /> Medications
            </NavLink>
            <NavLink to="/live-monitoring" style={navLinkStyle}>
              <Monitor size={20} /> Live Monitoring
            </NavLink>
            <NavLink to="/ecg-analysis" style={navLinkStyle}>
              <Eye size={20} /> ECG Analysis
            </NavLink>
          </>
        )}

        {userRole === 'Patient' && (
          <>
            <NavLink to="/emergency-sos" style={navLinkStyle}>
              <AlertCircle size={20} color="#ef4444" /> Emergency SOS
            </NavLink>
            
            {patientType === 'OP' ? (
              <>
                <NavLink to="/appointments" style={navLinkStyle}>
                  <Calendar size={20} /> Appointments
                </NavLink>
                <NavLink to="/medications" style={navLinkStyle}>
                  <Pill size={20} /> Medications
                </NavLink>
                <NavLink to="/my-health" style={navLinkStyle}>
                  <User size={20} /> My Health
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/live-monitoring" style={navLinkStyle}>
                  <Monitor size={20} /> Live Monitoring
                </NavLink>
                <NavLink to="/ecg-analysis" style={navLinkStyle}>
                  <Activity size={20} /> ECG Report
                </NavLink>
                <NavLink to="/my-health" style={navLinkStyle}>
                  <HeartPulse size={20} /> Vitals
                </NavLink>
                <NavLink to="/medications" style={navLinkStyle}>
                  <Pill size={20} /> Medications
                </NavLink>
              </>
            )}

            <NavLink to="/patient-alerts" style={navLinkStyle}>
              <AlertTriangle size={20} /> Alert History
            </NavLink>
          </>
        )}

        {userRole !== 'Patient' && (
          <NavLink to="/alerts" style={navLinkStyle}>
            <AlertTriangle size={20} /> Alerts
          </NavLink>
        )}

        <NavLink to="/reports" style={navLinkStyle}>
          <FileText size={20} /> Reports
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {userRole === 'Admin' && (
          <NavLink to="/settings" style={navLinkStyle}>
            <Settings size={20} /> Settings
          </NavLink>
        )}
        <NavLink to="/profile" style={navLinkStyle}>
          <User size={20} /> Profile
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
