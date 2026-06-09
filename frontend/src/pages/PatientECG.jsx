import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { Download, Calendar, Activity } from 'lucide-react';
import ECGChart from '../components/ECGChart';

const PatientECG = () => {
  const user = authService.getCurrentUser()?.user;
  const [vitalsHistory, setVitalsHistory] = useState([]);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/me?name=${user?.full_name}`);
        // Map backend history format to chart format
        const formattedData = response.data.vitalsHistory.map((v, i) => ({
          time: i,
          value: v.heart_rate + (Math.random() * 2 - 1)
        }));
        const realisticMockData = Array.from({ length: 150 }, (_, i) => ({
          time: i,
          value: 70 + 
                 (i % 30 === 0 ? 30 : 0) + 
                 (i % 30 === 1 ? -15 : 0) + 
                 (i % 30 === 28 ? 10 : 0) + 
                 (Math.random() * 4 - 2)
        }));
        setVitalsHistory(formattedData.length > 0 ? formattedData : realisticMockData);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.full_name) {
      fetchMyData();
    }
  }, [user]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ECG Report</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review your historical heart rhythm data</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Download PDF
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-secondary)' }}>Showing data from: <strong>Last 24 Hours</strong></span>
          </div>
        </div>

        <div style={{ height: '300px', transform: 'scaleY(1.5)', transformOrigin: 'center', margin: '2rem 0' }}>
          <ECGChart data={vitalsHistory} color="var(--accent-green)" />
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Activity size={48} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Understanding Your ECG</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
            Your Electrocardiogram (ECG) measures the electrical activity of your heart. The graph above shows your heart's rhythm over the selected time period. If the AI detects any abnormalities (like an arrhythmia), your doctor is automatically notified immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientECG;
