const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all ICU beds (Admin)
router.get('/beds', async (req, res) => {
    try {
        const [beds] = await pool.query('SELECT * FROM icu_beds ORDER BY bed_number ASC');
        res.status(200).json(beds);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ICU beds' });
    }
});

// Get all ICU admissions (Admin)
router.get('/admissions', async (req, res) => {
    try {
        const [admissions] = await pool.query(`
            SELECT a.*, p.name AS patient_name, d.full_name AS doctor_name, b.bed_number
            FROM icu_admissions a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN users d ON a.doctor_id = d.id
            LEFT JOIN icu_beds b ON a.bed_id = b.id
            ORDER BY a.admission_date DESC
        `);
        res.status(200).json(admissions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ICU admissions' });
    }
});

// Request ICU Admission (Doctor)
router.post('/request-admission', async (req, res) => {
    try {
        const { patient_id, doctor_id } = req.body;
        
        // Check if already requested or admitted
        const [existing] = await pool.query('SELECT id FROM icu_admissions WHERE patient_id = ? AND status IN ("Requested", "Admitted")', [patient_id]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Patient already has an active ICU admission or request.' });
        }

        await pool.query(
            'INSERT INTO icu_admissions (patient_id, doctor_id, status) VALUES (?, ?, "Requested")',
            [patient_id, doctor_id]
        );
        res.status(201).json({ message: 'ICU admission requested successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to request ICU admission.' });
    }
});

// Assign Bed and Finalize Admission (Admin)
router.put('/assign-bed/:admissionId', async (req, res) => {
    try {
        const { admissionId } = req.params;
        const { bed_id } = req.body;

        // Verify bed is available
        const [beds] = await pool.query('SELECT status FROM icu_beds WHERE id = ?', [bed_id]);
        if (beds.length === 0 || beds[0].status !== 'Available') {
            return res.status(400).json({ error: 'Selected bed is not available.' });
        }

        // Get patient_id from admission
        const [admissions] = await pool.query('SELECT patient_id FROM icu_admissions WHERE id = ?', [admissionId]);
        if (admissions.length === 0) return res.status(404).json({ error: 'Admission request not found.' });
        const patient_id = admissions[0].patient_id;

        // Update bed status to Occupied
        await pool.query('UPDATE icu_beds SET status = "Occupied" WHERE id = ?', [bed_id]);

        // Update admission status
        await pool.query(
            'UPDATE icu_admissions SET bed_id = ?, status = "Admitted", admission_date = CURRENT_TIMESTAMP WHERE id = ?',
            [bed_id, admissionId]
        );

        // Update patient type to ICU
        await pool.query('UPDATE patients SET patient_type = "ICU", is_admitted = true WHERE id = ?', [patient_id]);

        res.status(200).json({ message: 'Patient admitted and bed assigned successfully.' });
    } catch (error) {
        console.error("Assign bed error:", error);
        res.status(500).json({ error: 'Failed to assign bed and admit patient.' });
    }
});

// Discharge Patient (Doctor)
router.put('/discharge/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;

        // Find active admission
        const [admissions] = await pool.query('SELECT id, bed_id FROM icu_admissions WHERE patient_id = ? AND status = "Admitted"', [patientId]);
        if (admissions.length === 0) return res.status(404).json({ error: 'No active ICU admission found for this patient.' });
        
        const admission = admissions[0];

        // Free the bed
        if (admission.bed_id) {
            await pool.query('UPDATE icu_beds SET status = "Available" WHERE id = ?', [admission.bed_id]);
        }

        // Mark admission as Discharged
        await pool.query('UPDATE icu_admissions SET status = "Discharged", discharge_date = CURRENT_TIMESTAMP WHERE id = ?', [admission.id]);

        // Change patient back to OP
        await pool.query('UPDATE patients SET patient_type = "OP", is_admitted = false WHERE id = ?', [patientId]);

        res.status(200).json({ message: 'Patient discharged successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to discharge patient.' });
    }
});

module.exports = router;
