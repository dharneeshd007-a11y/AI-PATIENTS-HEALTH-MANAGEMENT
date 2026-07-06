const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Book an appointment (Patient)
router.post('/book', async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, reason } = req.body;
        const [result] = await pool.query(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason) VALUES (?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, reason]
        );
        res.status(201).json({ message: 'Appointment booked successfully', id: result.insertId });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// Get all appointments (Admin)
router.get('/', async (req, res) => {
    try {
        const [appointments] = await pool.query('SELECT * FROM appointments');
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Get appointments for a specific user (Doctor or Patient)
router.get('/:userId/:role', async (req, res) => {
    try {
        const { userId, role } = req.params;
        let query = '';
        if (role === 'Doctor') query = 'SELECT * FROM appointments WHERE doctor_id = ?';
        else if (role === 'Patient') query = 'SELECT * FROM appointments WHERE patient_id = ?';
        else return res.status(403).json({ error: 'Invalid role' });

        const [appointments] = await pool.query(query, [userId]);
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// PUT /api/appointments/:id/approve
router.put('/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { appointment_time } = req.body;
        await pool.query('UPDATE appointments SET status = ?, appointment_time = ? WHERE id = ?', ['Approved', appointment_time, id]);
        res.status(200).json({ message: 'Appointment approved' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve' });
    }
});

// PUT /api/appointments/:id/reject
router.put('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;
        await pool.query('UPDATE appointments SET status = ?, rejection_reason = ? WHERE id = ?', ['Rejected', rejection_reason, id]);
        res.status(200).json({ message: 'Appointment rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject' });
    }
});

// Update appointment status (General, for Admin or others)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Appointment status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
