const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get logged-in patient's specific data
router.get('/me', async (req, res) => {
  const { name } = req.query; // Simple matching by name for the prototype
  try {
    if (!name) return res.status(400).json({ message: 'Name query parameter required' });
    
    // Find patient by name
    const [patients] = await db.query('SELECT * FROM patients WHERE name = ?', [name]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient medical record not found' });
    }
    
    const patient = patients[0];
    
    // Get historical vitals
    const [vitals] = await db.query('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 50', [patient.id]);
    
    // Primary physician is now directly on the patient record
    const primaryPhysician = patient.doctor_name || 'Pending Assignment';
    
    res.json({
      ...patient,
      primaryPhysician,
      vitalsHistory: vitals.reverse() // Oldest to newest for charting
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all patients with latest vitals
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT p.*, 
             v.heart_rate as hr, 
             v.spo2, 
             v.blood_pressure as bp
      FROM patients p
      LEFT JOIN (
        SELECT v1.*
        FROM vitals v1
        INNER JOIN (
            SELECT patient_id, MAX(timestamp) as max_time
            FROM vitals
            GROUP BY patient_id
        ) v2 ON v1.patient_id = v2.patient_id AND v1.timestamp = v2.max_time
      ) v ON p.id = v.patient_id
    `;
    const [rows] = await db.query(query);
    
    // Add default values if no vitals exist and fetch next appt for OP
    const patients = [];
    for (let p of rows) {
      const patient = {
        ...p,
        hr: p.hr || Math.floor(Math.random() * (100 - 60) + 60), 
        spo2: p.spo2 || Math.floor(Math.random() * (100 - 95) + 95),
        bp: p.bp || '120/80'
      };

      if (p.patient_type === 'OP') {
        const [appts] = await db.query(
          'SELECT appointment_date, appointment_time, status FROM appointments WHERE patient_id = ? AND status != "Cancelled" ORDER BY appointment_date ASC LIMIT 1',
          [p.id]
        );
        if (appts.length > 0) {
          patient.next_appointment_date = appts[0].appointment_date;
          patient.next_appointment_time = appts[0].appointment_time;
        }
      }
      patients.push(patient);
    }
    
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new patient
router.post('/', async (req, res) => {
  const { name, age, gender, room, status, mrn, phone, doctor_name, assigned_doctor_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO patients (name, age, gender, room, status, mrn, phone, doctor_name, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, age, gender, room, status || 'Stable', mrn, phone || null, doctor_name || null, assigned_doctor_id || null]
    );
    
    if (status === 'Critical') {
      await db.query(
        'INSERT INTO alerts (patient_id, arrhythmia_type, severity) VALUES (?, ?, ?)',
        [result.insertId, 'Manual Critical Status Entry', 'Critical']
      );
    }
    
    res.status(201).json({ id: result.insertId, name, age, gender, room, status, mrn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a patient
router.put('/:id', async (req, res) => {
  const { name, age, gender, room, status, mrn, phone, doctor_name, assigned_doctor_id } = req.body;
  try {
    await db.query(
      'UPDATE patients SET name = ?, age = ?, gender = ?, room = ?, status = ?, mrn = ?, phone = ?, doctor_name = ?, assigned_doctor_id = ? WHERE id = ?',
      [name, age, gender, room, status, mrn, phone || null, doctor_name || null, assigned_doctor_id || null, req.params.id]
    );

    // Automatically sync the phone number update to the user's login account if they have one
    await db.query(
      "UPDATE users SET phone = ? WHERE full_name = ? AND role = 'Patient'",
      [phone || null, name]
    );

    if (status === 'Critical') {
      const [existingAlerts] = await db.query(
        'SELECT * FROM alerts WHERE patient_id = ? AND resolved = 0',
        [req.params.id]
      );
      if (existingAlerts.length === 0) {
        await db.query(
          'INSERT INTO alerts (patient_id, arrhythmia_type, severity) VALUES (?, ?, ?)',
          [req.params.id, 'Manual Critical Status Entry', 'Critical']
        );
      }
    } else if (status === 'Normal' || status === 'Stable') {
      await db.query(
        'DELETE FROM alerts WHERE patient_id = ?',
        [req.params.id]
      );
    }

    res.json({ message: 'Patient updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating patient', error: err.message, stack: err.stack });
  }
});

// Delete a patient
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting patient' });
  }
});

// Get a single patient by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Patient not found' });
    
    const [vitals] = await db.query('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 200', [req.params.id]);
    
    res.json({
      ...rows[0],
      vitalsHistory: vitals.reverse()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest vitals for a patient
router.get('/:id/vitals', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 1', [req.params.id]);
    if (rows.length === 0) return res.json({ heart_rate: 0, spo2: 0, blood_pressure: '0/0' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medical notes for a patient
router.get('/:id/notes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM medical_notes WHERE patient_id = ? ORDER BY timestamp DESC', [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a medical note for a patient
router.post('/:id/notes', async (req, res) => {
  const { doctor_name, note_text } = req.body;
  try {
    if (!note_text) return res.status(400).json({ message: 'Note text is required' });
    
    await db.query(
      'INSERT INTO medical_notes (patient_id, doctor_name, note_text) VALUES (?, ?, ?)',
      [req.params.id, doctor_name || 'Doctor', note_text]
    );
    res.status(201).json({ message: 'Note added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
