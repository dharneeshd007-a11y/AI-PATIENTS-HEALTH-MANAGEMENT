const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_key';

// Register User
exports.registerUser = async (req, res) => {
  const { full_name, email, phone, password, role } = req.body;
  
  if (!full_name || !email || !phone || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if email exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // If role is Patient, verify they exist in the admin's patient registry
    if (role === 'Patient') {
      const [patientRecords] = await db.query('SELECT * FROM patients WHERE name = ? AND phone = ?', [full_name, phone]);
      if (patientRecords.length === 0) {
        return res.status(400).json({ message: 'Registration denied: You must be added to the hospital registry by an Admin before creating an account. Please verify your Name and Phone Number match your medical record.' });
      }
    }

    // If role is Doctor, verify they were added by admin in approved_doctors
    if (role === 'Doctor') {
      try {
        await db.query(`CREATE TABLE IF NOT EXISTS approved_doctors (id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL UNIQUE, badge_id VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      } catch (err) {
        console.warn('Could not create approved_doctors table:', err.message);
      }
      
      const [doctorRecords] = await db.query('SELECT * FROM approved_doctors WHERE phone = ?', [phone]);
      if (doctorRecords.length === 0) {
        return res.status(400).json({ message: 'Registration denied: You must be added by an Admin before creating a Doctor account. Please verify your Phone Number.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const badge_id = req.body.badge_id || null;
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password, role, badge_id) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, phone, hashedPassword, role, badge_id]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
};

// Unified Phone Login
exports.loginUser = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Please provide phone number and password' });
  }

  try {
    // Developer/Troubleshooting fallback (Dev Admin & Dev Doctor mapped to phone)
    if (phone === '7904138308' && password === 'Dharneesh2007') {
      const token = jwt.sign({ id: 9999, email: 'dharneeshd007@gmail.com', role: 'Admin' }, SECRET_KEY, { expiresIn: '1d' });
      return res.json({
        message: 'Login successful', token,
        user: { id: 9999, full_name: 'DHARNEESH D', email: 'dharneeshd007@gmail.com', phone: '7904138308', role: 'Admin', patient_type: 'OP' }
      });
    }

    const [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    const user = users[0];
    
    // Admin login is ONLY allowed via the hardcoded credentials above
    if (user.role === 'Admin') {
      return res.status(403).json({ message: 'Admin access denied: Only the master admin can login.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    // Auto-detect Patient Type
    let patient_type = 'OP';
    let is_admitted = false;
    let patient_id = null;
    let doctor_id = null;

    if (user.role === 'Patient') {
      try {
        const [patientRecords] = await db.query('SELECT id, patient_type, is_admitted FROM patients WHERE name = ? AND phone = ?', [user.full_name, user.phone]);
        if (patientRecords.length > 0) {
          patient_id = patientRecords[0].id;
          patient_type = patientRecords[0].patient_type || 'OP';
          is_admitted = !!patientRecords[0].is_admitted;
        }
      } catch (err) {
        console.warn('Patient columns missing in DB, falling back to OP:', err.message);
      }
    } else if (user.role === 'Doctor') {
      doctor_id = user.id;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });

    res.json({
      message: 'Login successful', token,
      user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role, patient_type, is_admitted, patient_id, doctor_id }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Google OAuth Callback Handler
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    
    // Auto-detect Patient Type
    let patient_id = null;
    let patient_type = 'OP';
    
    if (user.role === 'Patient') {
      try {
        const [patientRecords] = await db.query('SELECT id, patient_type FROM patients WHERE name = ? AND phone = ?', [user.full_name, user.phone]);
        if (patientRecords.length > 0) {
          patient_id = patientRecords[0].id;
          patient_type = patientRecords[0].patient_type || 'OP';
        }
      } catch (err) {
        console.warn('Patient columns missing in DB for Google Callback, falling back to OP:', err.message);
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    
    // Redirect to the frontend with token and user data in query params, or set a cookie and redirect
    // A simple approach is redirecting with token in URL and letting frontend store it.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const userData = encodeURIComponent(JSON.stringify({
      id: user.id, 
      full_name: user.full_name, 
      email: user.email, 
      phone: user.phone, 
      role: user.role, 
      patient_type, 
      is_admitted: false, 
      patient_id, 
      doctor_id: null
    }));

    res.redirect(`${frontendUrl}/login?token=${token}&user=${userData}`);
  } catch (error) {
    console.error('Google Callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=true`);
  }
};

// Admin Adds Doctor (Pre-registration)
exports.adminAddDoctor = async (req, res) => {
  const { full_name, email, phone, badge_id } = req.body;
  if (!full_name || !email || !phone) {
    return res.status(400).json({ message: 'Please provide full_name, email, and phone' });
  }

  try {
    // Auto-create table if missing
    await db.query(`CREATE TABLE IF NOT EXISTS approved_doctors (id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL UNIQUE, badge_id VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    
    // Check if phone already exists
    const [existing] = await db.query('SELECT * FROM approved_doctors WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Doctor with this phone already exists in approved registry' });
    }

    await db.query(
      'INSERT INTO approved_doctors (full_name, email, phone, badge_id) VALUES (?, ?, ?, ?)',
      [full_name, email, phone, badge_id || null]
    );

    res.status(201).json({ message: 'Doctor successfully added to approved registry' });
  } catch (error) {
    console.error('Admin add doctor error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
