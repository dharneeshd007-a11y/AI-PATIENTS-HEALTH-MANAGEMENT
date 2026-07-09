require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
  });

  try {
    try {
      console.log("Adding mrn to patients table...");
      await connection.query('ALTER TABLE patients ADD COLUMN mrn VARCHAR(50) DEFAULT NULL');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message);
    }

    const columnsToAdd = [
      'ADD COLUMN patient_type VARCHAR(50) DEFAULT "ICU"',
      'ADD COLUMN room_no VARCHAR(50) DEFAULT NULL',
      'ADD COLUMN bed_no VARCHAR(50) DEFAULT NULL',
      'ADD COLUMN ward VARCHAR(100) DEFAULT NULL',
      'ADD COLUMN assigned_doctor_id INT DEFAULT NULL'
    ];
    for (let col of columnsToAdd) {
      try {
        await connection.query(`ALTER TABLE patients ${col}`);
      } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message);
      }
    }

    try {
      console.log("Creating appointments table if missing...");
      await connection.query(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id INT,
          doctor_id INT,
          appointment_date DATE,
          appointment_time TIME,
          status VARCHAR(50) DEFAULT 'Scheduled',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        );
      `);
    } catch (e) {
      console.log("Appointments table error:", e.message);
    }
    
    // Auto-generate some MRNs for existing patients
    const [patients] = await connection.query('SELECT id FROM patients');
    for (let p of patients) {
      await connection.query('UPDATE patients SET mrn = ? WHERE id = ?', [`PT-${1000 + p.id}`, p.id]);
    }
    console.log("Patients updated.");

    try {
      console.log("Adding badge_id to users table...");
      await connection.query('ALTER TABLE users ADD COLUMN badge_id VARCHAR(50) DEFAULT NULL');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log("badge_id column already exists.");
    }
    
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

if (require.main === module) {
  migrate();
}

module.exports = migrate;
