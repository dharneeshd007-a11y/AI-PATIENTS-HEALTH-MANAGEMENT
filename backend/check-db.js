const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, ssl: { rejectUnauthorized: false }
  });

  const [patients] = await conn.query('SELECT id, name, status FROM patients');
  console.log("PATIENTS:", patients);

  const [alerts] = await conn.query('SELECT id, patient_id, timestamp FROM alerts ORDER BY id DESC LIMIT 10');
  console.log("ALERTS:", alerts);

  process.exit(0);
}
check();
