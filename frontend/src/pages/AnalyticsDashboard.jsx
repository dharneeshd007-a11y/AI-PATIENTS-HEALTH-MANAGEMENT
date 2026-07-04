import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Users, AlertTriangle, TrendingUp, HeartPulse } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/analytics/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2><TrendingUp style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Hospital Analytics Dashboard</h2>
      </div>

      {loading ? <p>Loading analytics...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <Users color="#3b82f6" size={40} style={{ marginBottom: '1rem' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats?.totalPatients || 0}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Patients</div>
          </div>
          
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <Activity color="#10b981" size={40} style={{ marginBottom: '1rem' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats?.activeDoctors || 0}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Active Doctors</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertTriangle color="#ef4444" size={40} style={{ marginBottom: '1rem' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats?.criticalCases || 0}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Critical Cases</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <HeartPulse color="#f59e0b" size={40} style={{ marginBottom: '1rem' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats?.monthlyRecoveryRate || 0}%</div>
            <div style={{ color: 'var(--text-secondary)' }}>Recovery Rate</div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <p>Interactive Charts will be rendered here (Chart.js integration pending data aggregation).</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
