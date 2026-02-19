const { Pool } = require('pg');
const p = new Pool({ user: 'cvhive', host: 'localhost', database: 'cvhive', password: 'cvhive123', port: 5433 });

async function run() {
  const email = 'mohsinkhan.1997@outlook.com';
  const userResult = await p.query('SELECT id, role FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    console.log('User not found');
    process.exit();
  }
  const id = userResult.rows[0].id;
  const role = userResult.rows[0].role;
  console.log(`Found user: ${email} | Role: ${role}`);

  if (role === 'EMPLOYER') {
    // Get employer record
    const empResult = await p.query('SELECT id FROM employers WHERE user_id = $1', [id]);
    if (empResult.rows.length > 0) {
      const empId = empResult.rows[0].id;
      // Delete job-related data
      await p.query('DELETE FROM job_applications WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = $1)', [empId]);
      await p.query('DELETE FROM saved_jobs WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = $1)', [empId]);
      await p.query('DELETE FROM jobs WHERE employer_id = $1', [empId]);
      // Delete subscription, contact reveals, employer
      await p.query('DELETE FROM subscriptions WHERE employer_id = $1', [empId]);
      await p.query('DELETE FROM contact_reveals WHERE employer_id = $1', [empId]);
      await p.query('DELETE FROM employers WHERE id = $1', [empId]);
    }
  } else if (role === 'CANDIDATE') {
    await p.query('DELETE FROM candidates WHERE user_id = $1', [id]);
  }

  await p.query('DELETE FROM email_logs WHERE user_id = $1', [id]);
  const r = await p.query('DELETE FROM users WHERE id = $1', [id]);
  console.log('Deleted user:', email, '| Rows:', r.rowCount);
  process.exit();
}

run().catch(e => { console.error(e.message); process.exit(1); });
