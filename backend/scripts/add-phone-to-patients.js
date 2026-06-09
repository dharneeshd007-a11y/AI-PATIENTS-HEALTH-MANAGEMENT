const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await connection.query('ALTER TABLE patients ADD COLUMN phone VARCHAR(20)');
    console.log('Added phone column to patients table');
    await connection.end();
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('phone column already exists');
    } else {
      console.error('Error:', err);
    }
  }
}
run();
