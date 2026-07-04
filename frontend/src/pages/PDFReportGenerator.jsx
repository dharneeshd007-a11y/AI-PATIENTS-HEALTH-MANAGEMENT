import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FileText, Download, Printer } from 'lucide-react';
import authService from '../services/authService';

const PDFReportGenerator = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser()?.user;

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Mock data fetch for the report
        const res = await axios.get('/api/patients');
        let pt = res.data.find(p => p.id === parseInt(patientId));
        if (!pt && user?.role === 'Patient') {
            pt = res.data.find(p => p.name === user.full_name);
        }
        
        if (pt) {
            setPatientData({
                ...pt,
                vitals: { hr: 75, spo2: 98, bp: '120/80', temp: 37.2 },
                aiPrediction: 'Low Risk - Normal Sinus Rhythm',
                doctorNotes: 'Patient is stable. Continue current medication regimen.'
            });
        }
      } catch (error) {
        console.error('Failed to fetch patient data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId, user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Report Data...</div>;
  if (!patientData) return <div style={{ padding: '2rem', textAlign: 'center' }}>Patient not found.</div>;

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2><FileText style={{ verticalAlign: 'middle' }} /> Medical Report Generator</h2>
        <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Printer size={18} /> Print / Save as PDF
        </button>
      </div>

      {/* Printable Area */}
      <div className="printable-report" style={{ background: 'white', color: 'black', padding: '3rem', borderRadius: '8px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ color: '#1e3a8a', margin: 0 }}>KMCH Medical Center</h1>
            <p style={{ margin: 0, color: '#4b5563' }}>AI-Powered Telemetry & Arrhythmia Report</p>
          </div>
          <div style={{ textAlign: 'right', color: '#4b5563' }}>
            <p style={{ margin: 0 }}>Date: {new Date().toLocaleDateString()}</p>
            <p style={{ margin: 0 }}>Report ID: REP-{10000 + patientData.id}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', color: '#1e3a8a' }}>Patient Information</h3>
            <p><strong>Name:</strong> {patientData.name}</p>
            <p><strong>MRN:</strong> {patientData.mrn || `PT-${1000 + patientData.id}`}</p>
            <p><strong>Age/Gender:</strong> {patientData.age} / {patientData.gender}</p>
            <p><strong>Room:</strong> {patientData.room}</p>
          </div>
          <div>
            <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', color: '#1e3a8a' }}>Vital Signs</h3>
            <p><strong>Heart Rate:</strong> {patientData.vitals.hr} bpm</p>
            <p><strong>SpO2:</strong> {patientData.vitals.spo2}%</p>
            <p><strong>Blood Pressure:</strong> {patientData.vitals.bp}</p>
            <p><strong>Temperature:</strong> {patientData.vitals.temp} °C</p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', color: '#1e3a8a' }}>AI ECG Analysis & Prediction</h3>
          <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '4px', borderLeft: '4px solid #3b82f6' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>AI Classification:</p>
            <p style={{ margin: '0.5rem 0 0 0' }}>{patientData.aiPrediction}</p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', color: '#1e3a8a' }}>Doctor Notes</h3>
          <p>{patientData.doctorNotes}</p>
        </div>

        <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ borderTop: '1px solid black', width: '250px', paddingTop: '0.5rem', textAlign: 'center' }}>
            Physician Signature
          </div>
          <div style={{ borderTop: '1px solid black', width: '250px', paddingTop: '0.5rem', textAlign: 'center' }}>
            Patient / Guardian Signature
          </div>
        </div>

      </div>

      {/* Print CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-report, .printable-report * {
            visibility: visible;
          }
          .printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .app-container, .main-content {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PDFReportGenerator;
