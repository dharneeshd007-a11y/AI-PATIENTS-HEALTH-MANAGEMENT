import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { Activity, HeartPulse } from 'lucide-react';
import ECGChart from '../components/ECGChart';
import socketService from '../services/socketService';

const PatientLiveMonitoring = () => {
  const user = authService.getCurrentUser()?.user;
  const [patientData, setPatientData] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const response = await axios.get(`/api/patients/me?name=${user?.full_name}`);
        setPatientData(response.data);
        
        // Initialize chart with historical vitals or random base
        const baseData = Array.from({ length: 50 }, (_, i) => ({
          time: i,
          value: Math.sin(i * 0.5) * 10 + (Math.random() * 5) + 50
        }));
        setChartData(baseData);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.full_name) {
      fetchMyData();
    }
  }, [user]);

  const patientId = patientData?.id;

  useEffect(() => {
    if (!patientId) return;

    const handleEcgUpdate = (payload) => {
      const updates = payload.data;
      if (updates[patientId]) {
        const myUpdate = updates[patientId];
        setChartData(prev => {
          if (prev.length === 0) return prev;
          return [
            ...prev.slice(1), 
            { time: payload.timestamp, value: myUpdate.ecgValue }
          ];
        });
        
        // Also update local patientData stats
        setPatientData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            hr: myUpdate.heartRate,
            spo2: myUpdate.spo2
          };
        });
      }
    };

    socketService.connect();
    socketService.on('ecg_update', handleEcgUpdate);

    return () => {
      socketService.off('ecg_update', handleEcgUpdate);
    };
  }, [patientId]);

  if (!patientData) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading live stream...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Live Monitoring</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Real-time view of your cardiac telemetry</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>ECG Rhythm</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lead II</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
            <span className="status-indicator critical animate-pulse-critical" style={{ width: '8px', height: '8px' }}></span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>

        <div style={{ marginBottom: '2rem', transform: 'scaleY(1.2)', transformOrigin: 'center' }}>
          <ECGChart data={chartData} color="var(--accent-cyan)" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <HeartPulse color="var(--accent-red)" size={32} style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 600 }}>
              {Math.round(chartData[chartData.length-1]?.value || 70)}
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}> bpm</span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Heart Rate</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Activity color="var(--accent-blue)" size={32} style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 600 }}>
              98
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}> %</span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>SpO2</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLiveMonitoring;
