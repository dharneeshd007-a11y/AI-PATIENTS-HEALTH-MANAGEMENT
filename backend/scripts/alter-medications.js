const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function createMedicationTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log("Creating prescriptions table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        medicine_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        reminder_time TIME,
        start_date DATE,
        end_date DATE,
        instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating medication_history table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS medication_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prescription_id INT NOT NULL,
        patient_id INT NOT NULL,
        status ENUM('Taken', 'Missed', 'Pending') DEFAULT 'Pending',
        taken_time TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
      )
    `);

    console.log("Advanced medication tables created successfully.");

  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await connection.end();
  }
}

createMedicationTables();
