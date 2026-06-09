const db = require('./config/db');
async function clean() {
  await db.query(`DELETE a1 FROM alerts a1 JOIN alerts a2 ON a1.patient_id = a2.patient_id AND a1.id > a2.id AND a1.arrhythmia_type = 'Manual Critical Status Entry'`);
  console.log('Duplicates removed');
  process.exit(0);
}
clean().catch(console.error);
