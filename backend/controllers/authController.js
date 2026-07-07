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

// Login User
exports.loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Please provide email, password, and role' });
  }

  try {
    // Developer/Troubleshooting fallback login credentials
    if (
      (email === 'dharneeshd007@gmail.com' && password === 'Dharneesh2007' && role === 'Admin') ||
      (email === 'admin@kmch.com' && role === 'Admin') ||
      (email === 'smith@hospital.com' && role === 'Doctor')
    ) {
      const token = jwt.sign(
        { id: 9999, email: email, role: role }, 
        SECRET_KEY, 
        { expiresIn: '1d' }
      );
      return res.json({
        message: 'Login successful (Dev Fallback)',
        token,
        user: {
          id: 9999,
          full_name: email === 'smith@hospital.com' ? 'Dr. Smith' : 'DHARNEESH D',
          email: email,
          phone: '7904138308',
          role: role
        }
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.role !== role) {
      return res.status(401).json({ message: 'Invalid role for this user.' });
    }

    let patient_type = 'OP';
    let is_admitted = false;

    if (user.role === 'Patient') {
      const [patientRecords] = await db.query('SELECT patient_type, is_admitted FROM patients WHERE name = ? AND phone = ?', [user.full_name, user.phone]);
      if (patientRecords.length > 0) {
        patient_type = patientRecords[0].patient_type || 'OP';
        is_admitted = !!patientRecords[0].is_admitted;
      }
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      SECRET_KEY, 
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patient_type,
        is_admitted
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
