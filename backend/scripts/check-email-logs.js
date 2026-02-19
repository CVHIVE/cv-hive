const { Pool } = require('pg');
const p = new Pool({ user: 'cvhive', host: 'localhost', database: 'cvhive', password: 'cvhive123', port: 5433 });

async function run() {
  // Get columns first
  const cols = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'email_logs'");
  console.log('Columns:', cols.rows.map(x => x.column_name).join(', '));

  const r = await p.query("SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10");
  console.log('\nRecent email logs:');
  r.rows.forEach(row => {
    console.log(JSON.stringify(row, null, 2));
  });
  process.exit();
}

run().catch(e => { console.error(e.message); process.exit(1); });
