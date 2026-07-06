const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get hospital statistics for analytics dashboard
router.get('/stats', async (req, res) => {
    try {
        // Fetch various counts for the admin dashboard
        const [[{ total_patients }]] = await pool.query("SELECT COUNT(*) AS total_patients FROM patients");
        const [[{ total_doctors }]] = await pool.query("SELECT COUNT(*) AS total_doctors FROM users WHERE role = 'Doctor'");
        const [[{ critical_alerts }]] = await pool.query("SELECT COUNT(*) AS critical_alerts FROM alerts WHERE severity = 'Critical'");
        
        // Mock recovery rate or calculate it if data exists
        const monthly_recovery_rate = 85; 

        res.status(200).json({
            totalPatients: total_patients,
            activeDoctors: total_doctors,
            dailyAlerts: critical_alerts, // Simplified for now
            criticalCases: critical_alerts,
            monthlyRecoveryRate: monthly_recovery_rate
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics statistics' });
    }
});

// Get health goals for a patient
router.get('/goals/:patient_id', async (req, res) => {
    try {
        const { patient_id } = req.params;
        const [goals] = await pool.query('SELECT * FROM health_goals WHERE patient_id = ? ORDER BY date DESC LIMIT 1', [patient_id]);
        res.status(200).json(goals[0] || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health goals' });
    }
});

module.exports = router;
