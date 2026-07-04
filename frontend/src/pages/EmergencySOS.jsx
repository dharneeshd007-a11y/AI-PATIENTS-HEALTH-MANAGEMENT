import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { AlertCircle, Phone, HeartPulse, MapPin } from 'lucide-react';

const EmergencySOS = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosStatus, setSosStatus] = useState('');
  const user = authService.getCurrentUser()?.user;

  useEffect(() => {
    if (user?.id) fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`/api/emergency/contacts/${user?.id}`);
      setContacts(res.data);
    } catch (error) {
      console.error('Failed to fetch emergency contacts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = async () => {
    try {
      setSosStatus('Triggering SOS...');
      await axios.post('/api/emergency/sos', {
        patient_id: user?.id,
        location: 'Home', // In a real app, use Geolocation API
        message: 'Patient triggered Emergency SOS button.'
      });
      setSosStatus('SOS Triggered! Emergency Contacts Notified.');
      setTimeout(() => setSosStatus(''), 5000);
    } catch (error) {
      setSosStatus('Failed to trigger SOS.');
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const phone = e.target.phone.value;
    const relation = e.target.relation.value;

    try {
      await axios.post('/api/emergency/contacts', {
        patient_id: user?.id,
        name, phone, relation
      });
      fetchContacts();
      e.target.reset();
    } catch (error) {
      console.error('Failed to add contact', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: '#ef4444' }}><AlertCircle style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Emergency SOS</h2>
      
      <div className="glass-card" style={{ padding: '3rem', border: '2px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)', marginBottom: '3rem' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Press the button below in case of a medical emergency. This will notify your doctor and emergency contacts immediately.</p>
        <button 
          onClick={handleSOS} 
          style={{ 
            background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', 
            width: '150px', height: '150px', fontSize: '2rem', fontWeight: 'bold', 
            cursor: 'pointer', boxShadow: '0 0 20px rgba(239,68,68,0.6)'
          }}
        >
          SOS
        </button>
        {sosStatus && <div style={{ marginTop: '1.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: sosStatus.includes('Failed') ? 'white' : '#4ade80' }}>{sosStatus}</div>}
      </div>

      <div className="glass-card" style={{ textAlign: 'left' }}>
        <h3>Emergency Contacts</h3>
        <form onSubmit={handleAddContact} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '2rem' }}>
          <input type="text" name="name" placeholder="Contact Name" required style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          <input type="tel" name="phone" placeholder="Phone Number" required style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          <input type="text" name="relation" placeholder="Relation (e.g. Spouse)" required style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? <p>Loading contacts...</p> : contacts.length === 0 ? <p>No emergency contacts added yet.</p> : contacts.map(contact => (
            <div key={contact.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '50%' }}><Phone color="#3b82f6" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{contact.name} ({contact.relation})</div>
                <div style={{ color: 'var(--text-secondary)' }}>{contact.phone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;
