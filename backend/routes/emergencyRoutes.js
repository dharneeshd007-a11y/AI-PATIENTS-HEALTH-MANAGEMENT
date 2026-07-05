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

// Trigger Emergency SOS
router.post('/sos', async (req, res) => {
    try {
        const { patient_id, location, message } = req.body;
        // In a real scenario, this would trigger an immediate SMS/Email/Socket event
        // For now, we log it to the audit logs or an SOS table if we had one
        const [result] = await pool.query(
            'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
            [patient_id, 'EMERGENCY_SOS_TRIGGERED', JSON.stringify({ location, message })]
        );

        // Emit socket event for real-time notification
        const io = req.app.get('io');
        if (io) {
            io.emit('emergency_sos', {
                patient_id,
                location,
                message,
                timestamp: new Date().toISOString()
            });
        }

        res.status(201).json({ message: 'Emergency SOS triggered successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger SOS' });
    }
});

// Get emergency contacts for a patient
router.get('/contacts/:patient_id', async (req, res) => {
    try {
        const { patient_id } = req.params;
        const [contacts] = await pool.query('SELECT * FROM emergency_contacts WHERE patient_id = ?', [patient_id]);
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch emergency contacts' });
    }
});

// Add emergency contact
router.post('/contacts', async (req, res) => {
    try {
        const { patient_id, name, phone, relation } = req.body;
        const [result] = await pool.query(
            'INSERT INTO emergency_contacts (patient_id, name, phone, relation) VALUES (?, ?, ?, ?)',
            [patient_id, name, phone, relation]
        );
        res.status(201).json({ message: 'Emergency contact added', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add emergency contact' });
    }
});

module.exports = router;
