import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { User, Mail, Phone, Shield, Bell, Moon, Sun, Globe } from 'lucide-react';

const Profile = () => {
  const [user] = useState(authService.getCurrentUser()?.user || {});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    alerts: true
  });

  useEffect(() => {
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Profile & Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your account details and preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Personal Details */}
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem'
          }}>
            <User size={48} color="var(--text-secondary)" />
          </div>

          <h2 style={{ marginBottom: '0.5rem' }}>{user?.full_name}</h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>
            <span style={{ 
              padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600,
              backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Shield size={14} /> {user?.role}
            </span>
          </div>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <Mail size={18} color="var(--text-secondary)" /> {user?.email}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Phone Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <Phone size={18} color="var(--text-secondary)" /> {user?.phone || 'Not Provided'}
              </div>
            </div>
          </div>
          <button className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>Change Password</button>
        </div>

        {/* Preferences */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              <Sun size={20} /> Appearance
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>Theme</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Switch between light and dark mode</div>
              </div>
              <button onClick={toggleTheme} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} 
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>

          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              <Globe size={20} /> Language
            </h3>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px' }}
              >
                <option value="English">English</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>

          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              <Bell size={20} /> Notifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span>Email Notifications</span>
                <input type="checkbox" name="email" checked={notifications.email} onChange={handleNotificationChange} style={{ transform: 'scale(1.2)' }} />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span>SMS Notifications</span>
                <input type="checkbox" name="sms" checked={notifications.sms} onChange={handleNotificationChange} style={{ transform: 'scale(1.2)' }} />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span>Critical Alerts Push</span>
                <input type="checkbox" name="alerts" checked={notifications.alerts} onChange={handleNotificationChange} style={{ transform: 'scale(1.2)' }} />
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
