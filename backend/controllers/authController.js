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
        message: 'Login successful (Dev Fallback)', token,
        user: { id: 9999, full_name: 'DHARNEESH D', email: 'dharneeshd007@gmail.com', phone: '7904138308', role: 'Admin', patient_type: 'OP' }
      });
    }

    const [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    const user = users[0];
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

// Mock Google Login API
exports.googleLogin = async (req, res) => {
  const { email, full_name } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Google Authentication failed' });
  }

  try {
    let user;
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      user = existingUsers[0];
      // Prevent Google Login for Admins, Doctors, or ICU Patients
      if (user.role !== 'Patient') {
        return res.status(403).json({ message: 'Google Login is restricted to OP Patients only.' });
      }
      
      const [patientRecords] = await db.query('SELECT patient_type FROM patients WHERE name = ? AND phone = ?', [user.full_name, user.phone]);
      if (patientRecords.length > 0 && patientRecords[0].patient_type === 'ICU') {
        return res.status(403).json({ message: 'ICU Patients must login using Phone Number.' });
      }
    } else {
      // Auto-register new OP patient via Google
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      const tempPhone = 'G-' + Math.floor(Math.random() * 10000000);
      
      const [result] = await db.query(
        'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        [full_name || email.split('@')[0], email, tempPhone, hashedPassword, 'Patient']
      );
      
      const [newUsers] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newUsers[0];
    }

    let patient_id = null;
    let patient_type = 'OP';
    
    if (user.role === 'Patient') {
      const [patientRecords] = await db.query('SELECT id, patient_type FROM patients WHERE name = ? AND phone = ?', [user.full_name, user.phone]);
      if (patientRecords.length > 0) {
        patient_id = patientRecords[0].id;
        patient_type = patientRecords[0].patient_type || 'OP';
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    
    res.json({
      message: 'Google Login successful', token,
      user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role, patient_type, is_admitted: false, patient_id, doctor_id: null }
    });
  } catch (error) {
    console.error('Google Login error:', error);
    res.status(500).json({ message: 'Server error during Google Login' });
  }
};
