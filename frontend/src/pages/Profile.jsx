import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { User, Mail, Phone, Shield, Edit, Save, X } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(authService.getCurrentUser()?.user || {});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || ''
  });

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/${user.id}`, formData);
      
      // Update local storage so auth state persists
      const currentUserData = authService.getCurrentUser();
      const updatedUser = { ...currentUserData.user, ...formData };
      localStorage.setItem('user', JSON.stringify({ ...currentUserData, user: updatedUser }));
      
      setUser(updatedUser);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile", error);
      alert('Failed to update profile');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View your account details and security settings</p>
        </div>
        {!isEditing ? (
          <button className="btn btn-outline" onClick={() => setIsEditing(true)} style={{ display: 'flex', gap: '8px' }}>
            <Edit size={18} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={() => setIsEditing(false)} style={{ display: 'flex', gap: '8px' }}>
              <X size={18} /> Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', gap: '8px' }}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ 
          width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem'
        }}>
          <User size={48} color="var(--text-secondary)" />
        </div>

        {isEditing ? (
          <input 
            className="input-field" 
            style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem', width: '100%' }}
            value={formData.full_name} 
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          />
        ) : (
          <h2 style={{ marginBottom: '0.5rem' }}>{user?.full_name}</h2>
        )}

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
            {isEditing ? (
              <input 
                className="input-field" 
                style={{ width: '100%' }}
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <Mail size={18} color="var(--text-secondary)" /> {user?.email}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Phone Number</label>
            {isEditing ? (
              <input 
                className="input-field" 
                style={{ width: '100%' }}
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <Phone size={18} color="var(--text-secondary)" /> {user?.phone || 'Not Provided'}
              </div>
            )}
          </div>
        </div>

        {!isEditing && <button className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>Change Password</button>}
      </div>
    </div>
  );
};

export default Profile;
