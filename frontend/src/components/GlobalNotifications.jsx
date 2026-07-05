import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Pill, X } from 'lucide-react';
import socketService from '../services/socketService';
import authService from '../services/authService';

const GlobalNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const user = authService.getCurrentUser()?.user;

  useEffect(() => {
    // Only connect and listen if the user is logged in
    if (!user) return;
    
    socketService.connect();

    const handleNewPrescription = (data) => {
      // Only show to the specific patient
      if (user.role === 'Patient' && parseInt(data.patient_id) === user.id) {
        addNotification({
          id: Date.now(),
          type: 'prescription',
          message: `Your doctor just prescribed a new medication: ${data.medicine_name}`,
          autoDismiss: true
        });
      }
    };

    const handleEmergencySOS = (data) => {
      // Show SOS to Doctors and Admins
      if (user.role === 'Doctor' || user.role === 'Admin') {
        addNotification({
          id: Date.now(),
          type: 'sos',
          message: `🚨 EMERGENCY SOS triggered by Patient #${data.patient_id} at ${data.location}!`,
          autoDismiss: false // Critical alerts must be manually dismissed
        });
        
        // Optional: Play a sound
        try {
          const audio = new Audio('/alarm.mp3'); // Assuming an alarm.mp3 exists in public folder
          audio.play().catch(e => console.log('Audio autoplay blocked', e));
        } catch(e) {}
      }
    };

    socketService.on('new_prescription', handleNewPrescription);
    socketService.on('emergency_sos', handleEmergencySOS);

    return () => {
      socketService.off('new_prescription', handleNewPrescription);
      socketService.off('emergency_sos', handleEmergencySOS);
    };
  }, [user]);

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
    
    if (notification.autoDismiss) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none' // Let clicks pass through the container
    }}>
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            style={{
              pointerEvents: 'auto', // Enable clicks on the actual notification
              background: notif.type === 'sos' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(34, 197, 94, 0.95)',
              border: `1px solid ${notif.type === 'sos' ? '#f87171' : '#4ade80'}`,
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '300px',
              maxWidth: '450px'
            }}
          >
            {notif.type === 'sos' ? (
              <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                <AlertCircle size={28} />
              </motion.div>
            ) : (
              <Pill size={24} />
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {notif.type === 'sos' ? 'CRITICAL ALERT' : 'New Notification'}
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                {notif.message}
              </div>
            </div>
            
            <button 
              onClick={() => removeNotification(notif.id)}
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GlobalNotifications;
