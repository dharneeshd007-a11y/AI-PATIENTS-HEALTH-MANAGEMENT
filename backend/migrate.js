require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log("Adding mrn to patients table...");
    await connection.query('ALTER TABLE patients ADD COLUMN mrn VARCHAR(50) DEFAULT NULL');
    
    // Auto-generate some MRNs for existing patients
    const [patients] = await connection.query('SELECT id FROM patients');
    for (let p of patients) {
      await connection.query('UPDATE patients SET mrn = ? WHERE id = ?', [`PT-${1000 + p.id}`, p.id]);
    }
    console.log("Patients updated.");

    console.log("Adding badge_id to users table...");
    await connection.query('ALTER TABLE users ADD COLUMN badge_id VARCHAR(50) DEFAULT NULL');
    
    // Auto-generate some Badge IDs for existing users
    const [users] = await connection.query('SELECT id, role FROM users');
    for (let u of users) {
      const prefix = u.role === 'Admin' ? 'ADM' : (u.role === 'Doctor' ? 'MD' : 'PT');
      await connection.query('UPDATE users SET badge_id = ? WHERE id = ?', [`${prefix}-${1000 + u.id}`, u.id]);
    }
    console.log("Users updated.");

  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    await connection.end();
  }
}

migrate();
