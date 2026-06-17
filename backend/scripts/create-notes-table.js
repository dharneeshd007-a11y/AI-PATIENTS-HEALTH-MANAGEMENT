const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
    });

    await connection.query(`
      CREATE TABLE IF NOT EXISTS medical_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        doctor_name VARCHAR(100),
        note_text TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "medical_notes" created successfully.');
    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
