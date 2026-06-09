const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Adding doctor_name column to patients table...');
    await connection.query(`
      ALTER TABLE patients 
      ADD COLUMN doctor_name VARCHAR(100) DEFAULT NULL;
    `);

    console.log('Migration successful.');
    await connection.end();
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column doctor_name already exists. Skipping.');
    } else {
      console.error('Migration error:', err);
    }
  }
}

migrate();
