const { Client } = require('pg');

async function main() {
  const c = new Client({ user: 'cvhive', host: 'localhost', database: 'cvhive', password: 'cvhive123', port: 5433 });
  await c.connect();

  const emails = ['mohs.1997@outlook.com', 'mohs.1997@hotmail.com', 'mohsinkhan.1997@outlook.com'];
  for (const email of emails) {
    const u = await c.query('SELECT id FROM users WHERE email = $1', [email]);
    if (u.rows.length > 0) {
      const id = u.rows[0].id;
      await c.query('DELETE FROM email_logs WHERE user_id = $1', [id]);
      await c.query('DELETE FROM candidates WHERE user_id = $1', [id]);
      await c.query('DELETE FROM users WHERE id = $1', [id]);
      console.log('Deleted:', email);
    } else {
      console.log('Not found:', email);
    }
  }

  await c.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
