require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined
    });

    const [admins] = await connection.query("SELECT id, email, full_name FROM users WHERE role = 'Admin'");
    
    if (admins.length === 0) {
      console.log("❌ No Admin users found in the database. You need to register one first!");
      await connection.end();
      return;
    }

    const newPassword = 'Dharneesh2007';
    console.log(`Found ${admins.length} Admin(s). Updating passwords to '${newPassword}'...`);

    // Generate hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    for (const admin of admins) {
      await connection.query('UPDATE users SET password = ? WHERE id = ?', [hash, admin.id]);
      console.log(`✅ Password reset for Admin: ${admin.full_name} (${admin.email})`);
    }

    await connection.end();
    console.log("Done.");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
}

resetAdminPassword();
