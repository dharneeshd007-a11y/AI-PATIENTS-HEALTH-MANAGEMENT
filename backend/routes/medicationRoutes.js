const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
});

// --- PRESCRIPTIONS ---

// Add a new prescription (Doctor)
router.post('/prescriptions', async (req, res) => {
    try {
        let { patient_id, doctor_id, medicine_name, dosage, frequency, reminder_time, start_date, end_date, instructions } = req.body;
        
        start_date = start_date || null;
        end_date = end_date || null;

        const [result] = await pool.query(
            'INSERT INTO prescriptions (patient_id, doctor_id, medicine_name, dosage, frequency, reminder_time, start_date, end_date, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [patient_id, doctor_id, medicine_name, dosage, frequency, reminder_time, start_date, end_date, instructions]
        );
        res.status(201).json({ message: 'Prescription added successfully', id: result.insertId });
    } catch (error) {
        console.error('Failed to add prescription', error);
        res.status(500).json({ error: 'Failed to add prescription' });
    }
});

// Get prescriptions for a patient (Patient/Admin)
router.get('/prescriptions/patient/:patient_id', async (req, res) => {
    try {
        const { patient_id } = req.params;
        const [prescriptions] = await pool.query('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY id DESC', [patient_id]);
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
});

// Get prescriptions by doctor (Doctor)
router.get('/prescriptions/doctor/:doctor_id', async (req, res) => {
    try {
        const { doctor_id } = req.params;
        const [prescriptions] = await pool.query('SELECT * FROM prescriptions WHERE doctor_id = ? ORDER BY id DESC', [doctor_id]);
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
});

// Get all prescriptions (Admin)
router.get('/prescriptions', async (req, res) => {
    try {
        const [prescriptions] = await pool.query('SELECT * FROM prescriptions ORDER BY id DESC');
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all prescriptions' });
    }
});

// Delete a prescription (Doctor)
router.delete('/prescriptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM prescriptions WHERE id = ?', [id]);
        res.status(200).json({ message: 'Prescription deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete prescription' });
    }
});

// --- MEDICATION HISTORY ---

// Mark medication as Taken or Missed (Patient)
router.post('/medication-history', async (req, res) => {
    try {
        const { prescription_id, patient_id, status } = req.body;
        const taken_time = status === 'Taken' ? new Date() : null;
        
        const [result] = await pool.query(
            'INSERT INTO medication_history (prescription_id, patient_id, status, taken_time) VALUES (?, ?, ?, ?)',
            [prescription_id, patient_id, status, taken_time]
        );
        res.status(201).json({ message: 'History logged successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log history' });
    }
});

// Get medication history for a patient
router.get('/medication-history/:patient_id', async (req, res) => {
    try {
        const { patient_id } = req.params;
        const [history] = await pool.query(`
            SELECT mh.*, p.medicine_name, p.dosage 
            FROM medication_history mh
            JOIN prescriptions p ON mh.prescription_id = p.id
            WHERE mh.patient_id = ?
            ORDER BY mh.created_at DESC
        `, [patient_id]);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
