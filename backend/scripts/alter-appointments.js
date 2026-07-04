const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function alterAppointmentsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log("Altering appointments table...");
    
    // Step 1: Add new columns if they don't exist, change appointment_date to DATE
    // Note: We use try/catch blocks because IF NOT EXISTS isn't standard for ADD COLUMN in older MySQL versions
    try {
      await connection.query(`ALTER TABLE appointments ADD COLUMN appointment_time TIME NULL AFTER appointment_date`);
      console.log("Added appointment_time column.");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    try {
      await connection.query(`ALTER TABLE appointments ADD COLUMN rejection_reason TEXT NULL AFTER reason`);
      console.log("Added rejection_reason column.");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    try {
      await connection.query(`ALTER TABLE appointments MODIFY COLUMN appointment_date DATE NOT NULL`);
      console.log("Modified appointment_date to DATE.");
    } catch (e) {
      throw e;
    }

    try {
      await connection.query(`ALTER TABLE appointments MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled') DEFAULT 'Pending'`);
      console.log("Updated status ENUM.");
    } catch (e) {
      throw e;
    }

    console.log("Appointments table altered successfully.");

  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    await connection.end();
  }
}

alterAppointmentsTable();
