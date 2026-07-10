const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, full_name, email, phone, role, badge_id, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get admin metrics
router.get('/admin/metrics', async (req, res) => {
  try {
    const [[{ doctors }]] = await db.query("SELECT COUNT(*) as doctors FROM users WHERE role = 'Doctor'");
    const [[{ patients }]] = await db.query("SELECT COUNT(*) as patients FROM patients");
    const [[{ activeAlerts }]] = await db.query("SELECT COUNT(*) as activeAlerts FROM alerts WHERE resolved = 0");
    const [[{ totalReports }]] = await db.query("SELECT COUNT(*) as totalReports FROM alerts");
    res.json({
      totalDoctors: doctors,
      totalPatients: patients,
      totalAlerts: activeAlerts,
      totalReports: totalReports
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching metrics' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    // Check if the user is a Doctor before deleting
    const [existingUsers] = await db.query('SELECT role, full_name FROM users WHERE id = ?', [req.params.id]);
    
    if (existingUsers.length > 0) {
      const { role, full_name } = existingUsers[0];
      if (role === 'Doctor') {
        // Update patients assigned to this doctor to 'Pending Assignment'
        await db.query("UPDATE patients SET doctor_name = 'Pending Assignment' WHERE doctor_name = ?", [full_name]);
      }
    }

    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  const { full_name, email, phone, badge_id } = req.body;
  try {
    // Fetch the existing user to see if the name changed
    const [existingUsers] = await db.query('SELECT role, full_name FROM users WHERE id = ?', [req.params.id]);
    
    // Update the user
    await db.query(
      'UPDATE users SET full_name = ?, email = ?, phone = ?, badge_id = ? WHERE id = ?',
      [full_name, email, phone, badge_id, req.params.id]
    );

    if (existingUsers.length > 0) {
      const { role, full_name: oldName } = existingUsers[0];
      
      // If it's a doctor and the name changed, propagate the change
      if (role === 'Doctor' && oldName !== full_name) {
        await db.query('UPDATE patients SET doctor_name = ? WHERE doctor_name = ?', [full_name, oldName]);
        await db.query('UPDATE medical_notes SET doctor_name = ? WHERE doctor_name = ?', [full_name, oldName]);
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;
