const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function createAdvancedTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log("Creating appointments table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATETIME NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating medications table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100),
        schedule VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating caregivers table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS caregivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        caregiver_user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating emergency_contacts table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        relation VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating health_goals table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS health_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        water_intake_ml INT DEFAULT 0,
        exercise_minutes INT DEFAULT 0,
        sleep_hours DECIMAL(4,2) DEFAULT 0,
        heart_rate_target VARCHAR(50),
        date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating doctor_notes table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctor_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT DEFAULT NULL,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating audit_logs table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Advanced tables created successfully.");

  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await connection.end();
  }
}

createAdvancedTables();
