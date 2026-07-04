require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createDefaultAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
    });

    const fullName = 'DHARNEESH D';
    const email = 'dharneeshd007@gmail.com';
    const phone = '7904138308';
    const password = 'Dharneesh2007';
    const role = 'Admin';

    // Check if the user already exists
    const [existing] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    if (existing.length > 0) {
      console.log(`User ${email} already exists. Updating password, phone, and name...`);
      await connection.query(
        'UPDATE users SET full_name = ?, phone = ?, password = ?, role = ? WHERE email = ?',
        [fullName, phone, hash, role, email]
      );
      console.log('✅ Admin user updated successfully.');
    } else {
      console.log(`Creating new Admin user ${email}...`);
      await connection.query(
        'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        [fullName, email, phone, hash, role]
      );
      console.log('✅ Default Admin user created successfully.');
    }

    await connection.end();
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
}

createDefaultAdmin();
