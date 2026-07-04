import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { Pill, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MedicationReminder = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeReminder, setActiveReminder] = useState(null);
  const user = authService.getCurrentUser()?.user;
  const isPatient = user?.role === 'Patient';

  useEffect(() => {
    if (!isPatient) return;

    // Fetch active prescriptions
    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get(`/api/medications/prescriptions/patient/${user.id}`);
        setPrescriptions(res.data);
      } catch (error) {
        console.error('Failed to fetch prescriptions for reminders', error);
      }
    };

    fetchPrescriptions();
    
    // Check every minute if any prescription matches the current time
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHour}:${currentMinute}`;

      setPrescriptions(prev => {
        const dueMed = prev.find(p => p.reminder_time && p.reminder_time.substring(0, 5) === currentTimeString);
        if (dueMed && (!activeReminder || activeReminder.id !== dueMed.id)) {
          setActiveReminder(dueMed);
        }
        return prev;
      });
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [user, isPatient]);

  const handleLogStatus = async (status) => {
    if (!activeReminder) return;
    try {
      await axios.post('/api/medications/medication-history', {
        prescription_id: activeReminder.id,
        patient_id: user.id,
        status
      });
      setActiveReminder(null);
    } catch (error) {
      console.error('Failed to log reminder status', error);
    }
  };

  if (!isPatient) return null;

  return (
    <AnimatePresence>
      {activeReminder && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9, transition: { duration: 0.2 } }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '350px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: '1px solid var(--glass-border)',
            zIndex: 9999,
            overflow: 'hidden'
          }}
        >
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)' }}>
            <Clock color="#3b82f6" size={24} />
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>Time for your medication!</h3>
          </div>
          
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%' }}>
                <Pill color="var(--accent-cyan)" size={28} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'white' }}>{activeReminder.medicine_name}</h4>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{activeReminder.dosage} • {activeReminder.frequency}</div>
              </div>
            </div>

            {activeReminder.instructions && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '20px' }}>
                <strong>Instructions:</strong> {activeReminder.instructions}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleLogStatus('Taken')} 
                className="btn" 
                style={{ flex: 1, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', justifyContent: 'center', gap: '5px' }}
              >
                <CheckCircle size={18} /> Taken
              </button>
              <button 
                onClick={() => handleLogStatus('Missed')} 
                className="btn" 
                style={{ flex: 1, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', justifyContent: 'center', gap: '5px' }}
              >
                <XCircle size={18} /> Missed
              </button>
            </div>
            
            <button 
              onClick={() => setActiveReminder(null)} 
              style={{ width: '100%', marginTop: '10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px' }}
            >
              Remind me later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MedicationReminder;
