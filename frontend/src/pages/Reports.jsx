import React, { useState, useEffect } from 'react';
import { FileText, Download, Activity, Clock, User, ShieldAlert, HeartPulse } from 'lucide-react';
import axios from 'axios';
import authService from '../services/authService';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' or 'patients'
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentUser = authService.getCurrentUser()?.user;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, patientsRes] = await Promise.all([
          axios.get('/api/alerts'),
          axios.get('/api/patients')
        ]);
        
        let fetchedReports = alertsRes.data;
        let fetchedPatients = patientsRes.data;

        // If the logged in user is a patient, only show their own reports
        if (currentUser?.role === 'Patient') {
          fetchedReports = fetchedReports.filter(r => (r.patient_name || r.patient) === currentUser.full_name);
          fetchedPatients = fetchedPatients.filter(p => p.name === currentUser.full_name);
        }

        setReports(fetchedReports);
        setPatients(fetchedPatients);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const downloadCSV = () => {
    let headers, rows, filename;

    if (activeTab === 'audit') {
      headers = ['Report ID,Patient,Severity,Event Type,Timestamp,Status'];
      rows = reports.map(r => 
        `REP-${10000 + r.id},${r.patient_name || r.patient},${r.severity},${r.arrhythmia_type || r.type},${new Date(r.timestamp || r.time).toLocaleString()},${r.resolved ? 'Resolved' : 'Active'}`
      );
      filename = `telemetry_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['MRN,Name,Age,Gender,Room,Status'];
      rows = patients.map(p => 
        `${p.mrn || `PT-${1000 + p.id}`},${p.name},${p.age},${p.gender},${p.room},${p.status}`
      );
      filename = `patient_registry_report_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System Reports</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Complete historical log of all telemetry events and patient registries</p>
        </div>
        <button className="btn btn-outline" onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: 'fit-content' }}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('audit')} 
          style={{ 
            padding: '0.8rem 1.5rem', 
            background: activeTab === 'audit' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', 
            color: activeTab === 'audit' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            border: activeTab === 'audit' ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' 
          }}>
          Telemetry Audit Log
        </button>
        <button 
          onClick={() => setActiveTab('patients')} 
          style={{ 
            padding: '0.8rem 1.5rem', 
            background: activeTab === 'patients' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', 
            color: activeTab === 'patients' ? 'var(--accent-green)' : 'var(--text-secondary)',
            border: activeTab === 'patients' ? '1px solid var(--accent-green)' : '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' 
          }}>
          Patient Summaries
        </button>
      </div>

      {activeTab === 'audit' && (
        <div className="dashboard-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
              <FileText color="var(--accent-blue)" size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Total Records</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{reports.length}</p>
            </div>
          </div>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
              <ShieldAlert color="var(--accent-red)" size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Critical Events</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{reports.filter(r => r.severity === 'Critical').length}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="dashboard-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
              <HeartPulse color="var(--accent-green)" size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Total Registered Patients</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{patients.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            {activeTab === 'audit' ? (
              <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Report ID</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Severity</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Patient</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Event Type</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Timestamp</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            ) : (
              <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>MRN</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Age / Gender</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Room</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reports...</td>
              </tr>
            ) : activeTab === 'audit' ? (
              reports.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No historical data found.</td>
                </tr>
              ) : reports.map(report => (
                <tr key={report.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>REP-{10000 + report.id}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                      backgroundColor: report.severity === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: report.severity === 'Critical' ? 'var(--accent-red)' : 'var(--accent-orange)'
                    }}>
                      {report.severity}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} color="var(--text-secondary)" /> {report.patient_name || report.patient}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={14} color="var(--accent-cyan)" /> {report.arrhythmia_type || report.type}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} /> {new Date(report.timestamp || report.time).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: report.resolved ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                    {report.resolved ? 'Resolved' : 'Active'}
                  </td>
                </tr>
              ))
            ) : (
              patients.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No patients found.</td>
                </tr>
              ) : patients.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{p.mrn || `#${p.id}`}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{p.age} / {p.gender}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{p.room}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                      backgroundColor: p.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : p.status === 'Stable' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: p.status === 'Critical' ? 'var(--accent-red)' : p.status === 'Stable' ? 'var(--accent-green)' : 'var(--accent-orange)'
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
