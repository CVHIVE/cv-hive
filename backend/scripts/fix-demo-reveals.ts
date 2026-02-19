import db from '../src/config/database';

async function fix() {
  // Change the column default from 2 to 0
  await db.query('ALTER TABLE subscriptions ALTER COLUMN contact_reveals_limit SET DEFAULT 0');
  console.log('Column default updated to 0');

  // Fix any existing DEMO subscriptions that still have reveals > 0
  const result = await db.query(
    `UPDATE subscriptions SET contact_reveals_limit = 0 
     WHERE plan_type = 'DEMO' AND contact_reveals_limit > 0 
     RETURNING employer_id, contact_reveals_limit`
  );
  console.log(`Fixed ${result.rowCount} DEMO subscriptions`);

  // Show current state
  const check = await db.query(
    `SELECT plan_type, contact_reveals_limit, contact_reveals_used FROM subscriptions WHERE plan_type = 'DEMO'`
  );
  console.log('Current DEMO subscriptions:', check.rows);

  await db.end();
}

fix().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
