const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT alerts.*, patients.name as patient_name, patients.room as patient_room 
      FROM alerts 
      JOIN patients ON alerts.patient_id = patients.id 
      ORDER BY alerts.timestamp DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Resolve an alert
router.put('/:id/resolve', async (req, res) => {
  try {
    // First find the alert to get the patient_id
    const [alerts] = await db.query('SELECT patient_id FROM alerts WHERE id = ?', [req.params.id]);
    
    // Mark alert as resolved
    await db.query('UPDATE alerts SET resolved = 1 WHERE id = ?', [req.params.id]);
    
    // Update patient status back to Stable
    if (alerts.length > 0) {
      await db.query('UPDATE patients SET status = ? WHERE id = ?', ['Stable', alerts[0].patient_id]);
    }
    
    res.json({ message: 'Alert resolved and patient marked as Stable successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
