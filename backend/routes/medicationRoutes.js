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

// Add a new medication
router.post('/', async (req, res) => {
    try {
        const { patient_id, name, dosage, schedule } = req.body;
        const [result] = await pool.query(
            'INSERT INTO medications (patient_id, name, dosage, schedule) VALUES (?, ?, ?, ?)',
            [patient_id, name, dosage, schedule]
        );
        res.status(201).json({ message: 'Medication added successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add medication' });
    }
});

// Get medications for a patient
router.get('/patient/:patient_id', async (req, res) => {
    try {
        const { patient_id } = req.params;
        const [medications] = await pool.query('SELECT * FROM medications WHERE patient_id = ?', [patient_id]);
        res.status(200).json(medications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch medications' });
    }
});

// Delete a medication
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM medications WHERE id = ?', [id]);
        res.status(200).json({ message: 'Medication deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete medication' });
    }
});

module.exports = router;
