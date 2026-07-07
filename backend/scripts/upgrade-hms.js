const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function migrateHMS() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log("Starting HMS Migration...");

    // 1. Update Patients table
    try {
      console.log("Adding patient_type and is_admitted to patients table...");
      await connection.query("ALTER TABLE patients ADD COLUMN patient_type ENUM('OP', 'ICU') DEFAULT 'OP'");
      await connection.query("ALTER TABLE patients ADD COLUMN is_admitted BOOLEAN DEFAULT false");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log("patient_type columns already exist.");
    }

    // Existing dummy data in DB like John Doe (ICU-101) might need to be marked as ICU
    await connection.query("UPDATE patients SET patient_type = 'ICU', is_admitted = true WHERE room LIKE 'ICU%'");

    // 2. Create ICU Beds table
    console.log("Creating icu_beds table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS icu_beds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bed_number VARCHAR(20) NOT NULL UNIQUE,
        status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Pre-populate dummy ICU beds if empty
    const [beds] = await connection.query("SELECT COUNT(*) as count FROM icu_beds");
    if (beds[0].count === 0) {
      console.log("Populating initial ICU beds...");
      const insertBeds = [];
      for (let i = 1; i <= 10; i++) {
        insertBeds.push(`('ICU-10${i === 10 ? 0 : i}')`);
      }
      await connection.query(`INSERT INTO icu_beds (bed_number) VALUES ${insertBeds.join(',')}`);
    }

    // 3. Create ICU Admissions table
    console.log("Creating icu_admissions table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS icu_admissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        bed_id INT,
        admission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        discharge_date DATETIME DEFAULT NULL,
        status ENUM('Requested', 'Admitted', 'Discharged') DEFAULT 'Requested',
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (bed_id) REFERENCES icu_beds(id) ON DELETE SET NULL
      );
    `);

    console.log("HMS Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await connection.end();
  }
}

migrateHMS();
