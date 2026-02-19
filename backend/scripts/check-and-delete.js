const { Pool } = require('pg');
const p = new Pool({ user: 'cvhive', host: 'localhost', database: 'cvhive', password: 'cvhive123', port: 5433 });

async function run() {
  const r = await p.query("SELECT email, email_verified FROM users WHERE email LIKE '%outlook%' OR email LIKE '%hotmail%'");
  console.log(r.rows);

  // Delete mohsinkhan.1997@outlook.com
  const email = 'mohsinkhan.1997@outlook.com';
  const userResult = await p.query('SELECT id FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    console.log('User not found:', email);
  } else {
    const id = userResult.rows[0].id;
    await p.query('DELETE FROM email_logs WHERE user_id = $1', [id]);
    await p.query('DELETE FROM candidates WHERE user_id = $1', [id]);
    const del = await p.query('DELETE FROM users WHERE id = $1', [id]);
    console.log('Deleted:', email, '| Rows:', del.rowCount);
  }
  process.exit();
}

run().catch(e => { console.error(e.message); process.exit(1); });
