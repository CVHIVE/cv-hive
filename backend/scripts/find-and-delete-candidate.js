const { Pool } = require('pg');

const pool = new Pool({
  user: 'cvhive',
  host: 'localhost',
  database: 'cvhive',
  password: 'cvhive123',
  port: 5433,
});

async function main() {
  const res = await pool.query(
    "SELECT c.id, c.user_id, c.full_name, u.email FROM candidates c JOIN users u ON u.id = c.user_id WHERE LOWER(c.full_name) LIKE '%pussy%'"
  );
  
  if (res.rows.length === 0) {
    console.log('No candidate found with that name.');
    await pool.end();
    return;
  }

  console.log('Found:', JSON.stringify(res.rows, null, 2));

  for (const row of res.rows) {
    console.log(`Deleting user ${row.email} (${row.full_name})...`);
    
    const cleanups = [
      ['email_logs', 'user_id', row.user_id],
      ['application_status_history', 'application_id IN (SELECT id FROM job_applications WHERE candidate_id = $1)', row.id],
      ['job_applications', 'candidate_id', row.id],
      ['saved_jobs', 'candidate_id', row.id],
      ['job_alerts', 'candidate_id', row.id],
      ['analytics_events', 'candidate_id', row.id],
      ['contact_reveals', 'candidate_id', row.id],
      ['bookmarked_candidates', 'candidate_id', row.id],
      ['candidates', 'id', row.id],
      ['users', 'id', row.user_id],
    ];

    for (const [table, condition, value] of cleanups) {
      try {
        const where = condition.includes('$1') ? condition : `${condition} = $1`;
        await pool.query(`DELETE FROM ${table} WHERE ${where}`, [value]);
      } catch (e) {
        console.log(`  Skipped ${table}: ${e.message}`);
      }
    }
    console.log('Deleted successfully.');
  }

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
