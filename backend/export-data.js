const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function exportData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });

    const [users] = await connection.query('SELECT id, badge_id, full_name, email, role, phone FROM users');
    const [patients] = await connection.query('SELECT id, mrn, name, age, gender, room, status, doctor_name FROM patients');

    let md = `# Database Contents\n\nThis is a live pull of your Aiven Database data!\n\n`;
    
    md += `## 👥 Users Table (App Accounts)\n\n`;
    md += `| ID | Badge | Full Name | Email | Role | Phone |\n`;
    md += `|---|---|---|---|---|---|\n`;
    users.forEach(u => {
      md += `| ${u.id} | ${u.badge_id || 'N/A'} | ${u.full_name} | ${u.email} | **${u.role}** | ${u.phone || 'N/A'} |\n`;
    });

    md += `\n## 🫀 Patients Table\n\n`;
    md += `| ID | MRN | Name | Age | Gender | Room | Status | Doctor |\n`;
    md += `|---|---|---|---|---|---|---|---|\n`;
    patients.forEach(p => {
      md += `| ${p.id} | ${p.mrn || 'N/A'} | ${p.name} | ${p.age} | ${p.gender} | ${p.room} | ${p.status} | ${p.doctor_name || 'Unassigned'} |\n`;
    });

    fs.writeFileSync('C:\\Users\\dharneesh\\.gemini\\antigravity-ide\\brain\\35c77e38-c76f-4d5a-af15-d92cad788a5f\\database_export.md', md);
    console.log("Export complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
exportData();
