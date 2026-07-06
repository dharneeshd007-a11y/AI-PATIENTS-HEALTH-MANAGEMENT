import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Users, AlertTriangle, TrendingUp, HeartPulse } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

      {stats && (
        <div className="glass-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', color: 'white', marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '1.5rem', marginLeft: '1rem' }}>Hospital Trends (Last 6 Months)</h3>
          <div style={{ flex: 1, width: '100%', minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { month: 'Jan', Patients: 120, Alerts: 15 },
                  { month: 'Feb', Patients: 135, Alerts: 20 },
                  { month: 'Mar', Patients: 125, Alerts: 10 },
                  { month: 'Apr', Patients: 145, Alerts: 25 },
                  { month: 'May', Patients: 160, Alerts: 18 },
                  { month: 'Jun', Patients: stats.totalPatients || 170, Alerts: stats.criticalCases || 12 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line yAxisId="left" type="monotone" dataKey="Patients" stroke="#3b82f6" activeDot={{ r: 8 }} strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="Alerts" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
