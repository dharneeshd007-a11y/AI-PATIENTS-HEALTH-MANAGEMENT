const db = require('./config/db');

async function test() {
  try {
    const [users] = await db.query('SELECT * FROM users');
    console.log("USERS:", users);
    
    const [alerts] = await db.query('SELECT alerts.*, patients.name as patient_name FROM alerts JOIN patients ON alerts.patient_id = patients.id');
    console.log("ALERTS:", alerts);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();
