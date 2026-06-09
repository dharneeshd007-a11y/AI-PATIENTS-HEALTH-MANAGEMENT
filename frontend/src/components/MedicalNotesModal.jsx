import React, { useState, useEffect } from 'react';
import { X, Send, Clock, User } from 'lucide-react';
import axios from 'axios';
import authService from '../services/authService';

const MedicalNotesModal = ({ patient, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser()?.user;

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`/api/patients/${patient.id}/notes`);
        setNotes(response.data);
      } catch (err) {
        console.error("Error fetching notes:", err);
      } finally {
        setLoading(false);
      }
    };
    if (patient?.id) fetchNotes();
  }, [patient]);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    try {
      await axios.post(`/api/patients/${patient.id}/notes`, {
        doctor_name: currentUser?.full_name || 'Attending Doctor',
        note_text: newNote.trim()
      });
      setNewNote('');
      // Refresh notes
      const response = await axios.get(`/api/patients/${patient.id}/notes`);
      setNotes(response.data);
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  if (!patient) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-card" style={{
        width: '90%', maxWidth: '600px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Medical Notes</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Patient: {patient.name} (Room {patient.room})</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Loading notes...</div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No medical notes recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notes.map(note => (
                <div key={note.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <User size={14} /> <strong>{note.doctor_name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} /> {new Date(note.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {note.note_text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', gap: '10px' }}>
          <textarea 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new observation or clinical note..."
            style={{ 
              flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', 
              color: 'white', padding: '0.8rem', borderRadius: 'var(--radius-sm)',
              resize: 'none', height: '60px', fontFamily: 'inherit'
            }}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleSaveNote}
            disabled={!newNote.trim()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.5rem', opacity: newNote.trim() ? 1 : 0.5 }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalNotesModal;
