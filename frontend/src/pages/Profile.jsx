import React, { useState } from 'react';
import authService from '../services/authService';
import { User, Mail, Phone, Shield } from 'lucide-react';

const Profile = () => {
  const [user] = useState(authService.getCurrentUser()?.user || {});

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View your account details and security settings</p>
        </div>
      </div>

      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
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
    </div>
  );
};

export default Profile;
