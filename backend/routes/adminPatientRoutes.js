const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/admin/patients - Get all patients with filtering
router.get('/', async (req, res) => {
    try {
        const { type, status } = req.query;
        let query = `
            SELECT p.*, u.full_name as doctor_name 
            FROM patients p 
            LEFT JOIN users u ON p.assigned_doctor_id = u.id
        `;
        const params = [];
        const conditions = [];

        if (type) {
            conditions.push("p.patient_type = ?");
            params.push(type);
        }
        if (status) {
            conditions.push("p.status = ?");
            params.push(status);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY p.id DESC";

        const [patients] = await pool.query(query, params);

        // Fetch upcoming appointment for OP patients
        for (let p of patients) {
            if (p.patient_type === 'OP') {
                const [appts] = await pool.query(
                    'SELECT appointment_date, appointment_time, status FROM appointments WHERE patient_id = ? AND status != "Cancelled" ORDER BY appointment_date ASC LIMIT 1',
                    [p.id]
                );
                if (appts.length > 0) {
                    p.next_appointment_date = appts[0].appointment_date;
                    p.next_appointment_time = appts[0].appointment_time;
                    p.next_appointment_status = appts[0].status;
                }
            }
        }

        res.status(200).json(patients);
    } catch (error) {
        console.error("Admin GET patients error:", error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// POST /api/admin/patients - Add a new patient
router.post('/', async (req, res) => {
    try {
        const { name, age, gender, phone, patient_type, status, room_no, bed_no, ward, assigned_doctor_id } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO patients (name, age, gender, phone, patient_type, status, room_no, bed_no, ward, assigned_doctor_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, age, gender, phone, patient_type || 'OP', status || 'Monitoring', room_no || null, bed_no || null, ward || null, assigned_doctor_id || null]
        );
        
        res.status(201).json({ message: 'Patient created successfully', id: result.insertId });
    } catch (error) {
        console.error("Admin POST patient error:", error);
        res.status(500).json({ error: 'Failed to create patient' });
    }
});

// PUT /api/admin/patients/:id - Edit a patient
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, gender, phone, patient_type, status, room_no, bed_no, ward, assigned_doctor_id } = req.body;

        await pool.query(
            `UPDATE patients SET 
                name = ?, age = ?, gender = ?, phone = ?, patient_type = ?, 
                status = ?, room_no = ?, bed_no = ?, ward = ?, assigned_doctor_id = ?
             WHERE id = ?`,
            [name, age, gender, phone, patient_type, status, room_no, bed_no, ward, assigned_doctor_id, id]
        );

        res.status(200).json({ message: 'Patient updated successfully' });
    } catch (error) {
        console.error("Admin PUT patient error:", error);
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

// DELETE /api/admin/patients/:id - Delete a patient (Cascades to related records)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Ensure cascading deletes if constraints are missing for some reason
        // The foreign keys *should* be ON DELETE CASCADE for vitals, alerts, appointments, medications
        // We will explicitly delete appointments and medications just in case
        await pool.query('DELETE FROM appointments WHERE patient_id = ?', [id]);
        await pool.query('DELETE FROM medications WHERE patient_id = ?', [id]);
        
        // Main delete
        const [result] = await pool.query('DELETE FROM patients WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.status(200).json({ message: 'Patient and all related records deleted successfully' });
    } catch (error) {
        console.error("Admin DELETE patient error:", error);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});

module.exports = router;
