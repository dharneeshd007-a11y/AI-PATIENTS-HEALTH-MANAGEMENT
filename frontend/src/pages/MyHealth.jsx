import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { User, Activity, AlertCircle } from 'lucide-react';

const MyHealth = () => {
  const user = authService.getCurrentUser()?.user;
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/me?name=${user?.full_name}`);
        setPatientData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.full_name) {
      fetchMyData();
    }
  }, [user]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading your medical profile...</div>;
  }

  if (!patientData) {
    return (
      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '2rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
        <h3>No Records Found</h3>
        <p>We could not find your hospital admission records.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Health Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your personal medical details and admission status</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={48} color="var(--text-secondary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{patientData.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '0.5rem 0' }}>{patientData.age} years old • {patientData.gender}</p>
            <span style={{ 
              padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 600,
              backgroundColor: patientData.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : patientData.status === 'Stable' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: patientData.status === 'Critical' ? 'var(--accent-red)' : patientData.status === 'Stable' ? 'var(--accent-green)' : 'var(--accent-orange)'
            }}>
              Current Status: {patientData.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Admission Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span>Room Number</span>
                <span style={{ fontWeight: 600 }}>{patientData.room}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span>Admission Date</span>
                <span style={{ fontWeight: 600 }}>May 12, 2026</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span>Primary Physician</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{patientData.primaryPhysician || 'Pending Assignment'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Medical Conditions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ padding: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid var(--accent-red)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                Risk of Arrhythmia
              </div>
              <div style={{ padding: '0.8rem', backgroundColor: 'rgba(255,255,255,0.05)', borderLeft: '3px solid var(--text-secondary)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                Hypertension
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyHealth;
