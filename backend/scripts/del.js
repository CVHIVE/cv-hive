const { Pool } = require('pg');
const p = new Pool({ user: 'cvhive', host: 'localhost', database: 'cvhive', password: 'cvhive123', port: 5433 });

p.query("SELECT email, email_verified FROM users WHERE email LIKE '%mohsin%'")
  .then(r => {
    console.log('Found:', r.rows);
    if (r.rows.length === 0) { console.log('No mohsin users'); return process.exit(); }
    const email = 'mohsinkhan.1997@outlook.com';
    return p.query("SELECT id FROM users WHERE email = $1", [email]).then(u => {
      if (u.rows.length === 0) { console.log('Not found:', email); return process.exit(); }
      const id = u.rows[0].id;
      return p.query('DELETE FROM email_logs WHERE user_id = $1', [id])
        .then(() => p.query('DELETE FROM candidates WHERE user_id = $1', [id]))
        .then(() => p.query('DELETE FROM users WHERE id = $1', [id]))
        .then(d => { console.log('Deleted:', email, d.rowCount); process.exit(); });
    });
  })
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
