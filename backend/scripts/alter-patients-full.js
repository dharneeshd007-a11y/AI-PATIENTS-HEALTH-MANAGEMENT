const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function migratePatients() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log("Starting Full Patients Migration...");

    // 1. Alter Patients table
    try {
      console.log("Adding columns to patients table...");
      await connection.query("ALTER TABLE patients ADD COLUMN patient_type ENUM('ICU', 'OP') DEFAULT 'OP'");
      await connection.query("ALTER TABLE patients ADD COLUMN room_no VARCHAR(20) DEFAULT NULL");
      await connection.query("ALTER TABLE patients ADD COLUMN bed_no VARCHAR(20) DEFAULT NULL");
      await connection.query("ALTER TABLE patients ADD COLUMN ward VARCHAR(50) DEFAULT NULL");
      await connection.query("ALTER TABLE patients ADD COLUMN assigned_doctor_id INT DEFAULT NULL");
      // Add foreign key for assigned_doctor_id
      await connection.query("ALTER TABLE patients ADD CONSTRAINT fk_doctor FOREIGN KEY (assigned_doctor_id) REFERENCES users(id) ON DELETE SET NULL");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log("Columns already exist, continuing...");
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await connection.end();
  }
}

migratePatients();
