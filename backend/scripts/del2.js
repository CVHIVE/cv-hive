// Simple delete - connects, deletes, exits immediately
const { Client } = require('pg');

async function main() {
  const c = new Client({ user: 'cvhive', host: 'localhost', database: 'cvhive', password: 'cvhive123', port: 5433 });
  await c.connect();
  
  // List all outlook/hotmail/mohsin users
  const all = await c.query("SELECT email, email_verified FROM users WHERE email LIKE '%outlook%' OR email LIKE '%hotmail%' OR email LIKE '%mohsin%' OR email LIKE '%test@test%'");
  console.log('Users found:', all.rows);

  // Delete mohsinkhan.1997@outlook.com
  const target = 'mohsinkhan.1997@outlook.com';
  const u = await c.query('SELECT id FROM users WHERE email = $1', [target]);
  if (u.rows.length > 0) {
    const id = u.rows[0].id;
    await c.query('DELETE FROM email_logs WHERE user_id = $1', [id]);
    await c.query('DELETE FROM candidates WHERE user_id = $1', [id]);
    await c.query('DELETE FROM users WHERE id = $1', [id]);
    console.log('Deleted:', target);
  } else {
    console.log('Not found:', target);
  }

  // Also delete test@test.com
  const t = await c.query('SELECT id FROM users WHERE email = $1', ['test@test.com']);
  if (t.rows.length > 0) {
    const id = t.rows[0].id;
    await c.query('DELETE FROM email_logs WHERE user_id = $1', [id]);
    await c.query('DELETE FROM candidates WHERE user_id = $1', [id]);
    await c.query('DELETE FROM users WHERE id = $1', [id]);
    console.log('Deleted: test@test.com');
  }

  await c.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
