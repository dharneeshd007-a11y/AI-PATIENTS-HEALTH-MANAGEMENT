const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_key';

// Register User
exports.registerUser = async (req, res) => {
  const { email, phone, password, role } = req.body;
  
  if (!password || !role) {
    return res.status(400).json({ message: 'Please provide password and role' });
  }

  let final_full_name = '';
  let final_email = email;
  let final_phone = phone;
  let badge_id = req.body.badge_id || null;

  try {
    // If role is Patient, verify they exist in the admin's patient registry
    if (role === 'Patient') {
      if (!phone) return res.status(400).json({ message: 'Phone number is required for Patient registration' });
      const [patientRecords] = await db.query('SELECT * FROM patients WHERE phone = ?', [phone]);
      if (patientRecords.length === 0) {
        return res.status(400).json({ message: 'Registration denied: Your phone number is not registered by the hospital. Please contact the Administrator.' });
      }
      final_full_name = patientRecords[0].name;
      // Patient might not have an email in the patients table, or we can just leave it empty/null
      final_email = final_email || null;
    }

    // If role is Doctor, verify they were added by admin in approved_doctors
    if (role === 'Doctor') {
      if (!email) return res.status(400).json({ message: 'Email is required for Doctor registration' });
      try {
        await db.query(`CREATE TABLE IF NOT EXISTS approved_doctors (id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL UNIQUE, department VARCHAR(100), specialization VARCHAR(100), badge_id VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      } catch (err) {
        console.warn('Could not create approved_doctors table:', err.message);
      }
      
      const [doctorRecords] = await db.query('SELECT * FROM approved_doctors WHERE email = ?', [email]);
      if (doctorRecords.length === 0) {
        return res.status(400).json({ message: 'Registration denied: Your email is not registered by the Administrator.' });
      }
      final_full_name = doctorRecords[0].full_name;
      final_phone = doctorRecords[0].phone;
      badge_id = doctorRecords[0].badge_id;
    }

    // Check if user already exists
    if (final_email) {
      const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [final_email]);
      if (existingEmail.length > 0) return res.status(400).json({ message: 'Email already registered' });
    }
    if (final_phone) {
      const [existingPhone] = await db.query('SELECT * FROM users WHERE phone = ?', [final_phone]);
      if (existingPhone.length > 0) return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password, role, badge_id) VALUES (?, ?, ?, ?, ?, ?)',
      [final_full_name, final_email, final_phone, hashedPassword, role, badge_id]
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
    const [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'This phone number is not registered in the Patient List.' });
    }

    const user = users[0];
    
    // Only Patients can login with phone and password
    if (user.role !== 'Patient') {
      return res.status(403).json({ message: 'Access denied: Staff must use Google Login.' });
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
  const { full_name, email, phone, department, specialization, badge_id } = req.body;
  if (!full_name || !email || !phone || !department || !specialization) {
    return res.status(400).json({ message: 'Please provide full_name, email, phone, department, and specialization' });
  }

  try {
    // Auto-create table if missing
    await db.query(`CREATE TABLE IF NOT EXISTS approved_doctors (id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL UNIQUE, department VARCHAR(100), specialization VARCHAR(100), badge_id VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    
    // Check if phone already exists
    const [existing] = await db.query('SELECT * FROM approved_doctors WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Doctor with this email already exists in approved registry' });
    }

    await db.query(
      'INSERT INTO approved_doctors (full_name, email, phone, department, specialization, badge_id) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, phone, department, specialization, badge_id || null]
    );

    res.status(201).json({ message: 'Doctor successfully added to approved registry' });
  } catch (error) {
    console.error('Admin add doctor error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
