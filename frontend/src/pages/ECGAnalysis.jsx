import React, { useState, useEffect } from 'react';
import { Activity, Download, Calendar, Users } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ECGChart from '../components/ECGChart';
import authService from '../services/authService';

const ECGAnalysis = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser()?.user;
  
  const [activePatientId, setActivePatientId] = useState(searchParams.get('patientId'));
  const [chartData, setChartData] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [allPatients, setAllPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let currentPatientId = activePatientId;
        
        if (!currentPatientId) {
          if (user?.role === 'Patient') {
            // Auto-detect patient ID for the logged in patient
            const meRes = await axios.get(`/api/patients/me?name=${user?.full_name}`);
            if (meRes.data && meRes.data.id) {
              currentPatientId = meRes.data.id.toString();
              setActivePatientId(currentPatientId);
              // Now we can continue to fetch this specific patient's ECG
            } else {
              navigate('/patient-dashboard');
              return;
            }
          } else {
            // Admin/Doctor accessed from sidebar -> show list of patients
            const res = await axios.get('/api/patients');
            setAllPatients(res.data);
            return;
          }
        }
        
        const response = await axios.get(`/api/patients/${currentPatientId}`);
        setPatientData(response.data);
        
        if (response.data.vitalsHistory && response.data.vitalsHistory.length > 0) {
          const formattedData = response.data.vitalsHistory.map((v, i) => ({
            time: i,
            value: v.heart_rate + (Math.random() * 2 - 1)
          }));
          setChartData(formattedData);
        } else {
          // If no history in DB, create a realistic mock ECG specific to this patient
          const isCritical = response.data.status === 'Critical';
          const baseHR = isCritical ? 135 : 72;
          const noise = isCritical ? 12 : 3;
          const frequency = isCritical ? 0.25 : 0.1;
          
          const mockData = Array.from({ length: 200 }, (_, i) => {
            const phase = parseInt(currentPatientId) || 0;
            return {
              time: i,
              value: Math.sin((i + phase) * frequency) * 15 + (Math.random() * noise) + baseHR
            };
          });
          setChartData(mockData);
        }
      } catch (err) {
        console.error("Error fetching ECG analysis data:", err);
      }
    };
    fetchData();
  }, [activePatientId, user, navigate]);

  if (!activePatientId) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Select Patient</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Choose a patient to review their historical ECG telemetry.</p>
        </div>
        
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {allPatients.map(p => (
            <div 
              key={p.id} 
              className="glass-card" 
              style={{ cursor: 'pointer', border: '1px solid var(--glass-border)' }}
              onClick={() => navigate(`/ecg-analysis?patientId=${p.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>{p.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room {p.room} | {p.age}y {p.gender.charAt(0)}</div>
                  </div>
                </div>
                <span style={{ 
                  padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600,
                  backgroundColor: p.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : p.status === 'Stable' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: p.status === 'Critical' ? 'var(--accent-red)' : p.status === 'Stable' ? 'var(--accent-green)' : 'var(--accent-orange)'
                }}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
          {allPatients.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading patients...</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <button onClick={() => navigate('/ecg-analysis')} className="btn btn-outline" style={{ marginBottom: '1rem', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>&larr; Back to Patient List</button>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ECG Analysis {patientData ? `- ${patientData.name}` : ''}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Deep dive historical telemetry review</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Calendar size={18} /> 
            <input type="date" style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }} />
          </label>
          <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="print-area">
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Historical Rhythm {patientData ? `- ${patientData.name}` : ''}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Showing data from last 24 hours</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg HR</div>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{chartData.length > 0 ? Math.round(chartData.reduce((acc, curr) => acc + curr.value, 0) / chartData.length) : '--'} bpm</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Events</div>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-red)' }}>0 Detected</div>
              </div>
            </div>
          </div>

          <div style={{ height: '400px' }}>
            {/* We reuse ECGChart but wrap it to allow it to be larger */}
            <div style={{ transform: 'scaleY(2)', transformOrigin: 'top' }}>
               {chartData.length > 0 && <ECGChart data={chartData} color="var(--accent-cyan)" />}
            </div>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2>AI Analysis Engine Coming Soon</h2>
          <p>The system will automatically highlight annotated P-QRS-T complexes and detected anomalies.</p>
        </div>
      </div>
    </div>
  );
};

export default ECGAnalysis;
