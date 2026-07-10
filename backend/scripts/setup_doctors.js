const pool = require('../config/db');

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS approved_doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        badge_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('approved_doctors table created or already exists.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setup();
