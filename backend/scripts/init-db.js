const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load env from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDB() {
  try {
    console.log('Connecting to database:', process.env.DB_NAME);
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
    });

    // Create DB if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`Database ${process.env.DB_NAME} created or already exists.`);

    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    // Create Patients table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        gender VARCHAR(10),
        room VARCHAR(20),
        phone VARCHAR(20),
        doctor_name VARCHAR(100) DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'Monitoring'
      );
    `);
    console.log('Table "patients" created or already exists.');

    // Create Vitals table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vitals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        heart_rate INT,
        spo2 INT,
        blood_pressure VARCHAR(20),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "vitals" created or already exists.');

    // Create Alerts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        arrhythmia_type VARCHAR(100),
        severity VARCHAR(50),
        resolved BOOLEAN DEFAULT FALSE,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "alerts" created or already exists.');

    // Insert dummy data
    await connection.query(`
      INSERT IGNORE INTO patients (id, name, age, gender, room, status) VALUES
      (1, 'John Doe', 65, 'Male', 'ICU-101', 'Critical'),
      (2, 'Jane Smith', 72, 'Female', 'ICU-102', 'Stable'),
      (3, 'Robert Johnson', 58, 'Male', 'Ward-3A', 'Monitoring');
    `);

    await connection.query(`
      INSERT INTO alerts (patient_id, arrhythmia_type, severity) VALUES
      (1, 'Atrial Fibrillation', 'Critical'),
      (2, 'Bradycardia', 'Warning');
    `);

    console.log('Dummy data inserted.');

    await connection.end();
    console.log('Database initialization complete!');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDB();
