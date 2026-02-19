import db from '../config/database';

export async function cleanupDemoAccounts() {
  const expiredDemos = await db.query(
    `SELECT s.id as sub_id, s.employer_id, e.user_id, u.email
     FROM subscriptions s
     JOIN employers e ON e.id = s.employer_id
     JOIN users u ON u.id = e.user_id
     WHERE s.plan_type = 'DEMO'
       AND s.current_period_end < NOW()`
  );

  if (expiredDemos.rows.length === 0) {
    return { deleted: 0 };
  }

  for (const demo of expiredDemos.rows) {
    await db.query(
      `DELETE FROM job_applications WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = $1)`,
      [demo.employer_id]
    );
    await db.query(
      `DELETE FROM saved_jobs WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = $1)`,
      [demo.employer_id]
    );
    await db.query('DELETE FROM jobs WHERE employer_id = $1', [demo.employer_id]);
    await db.query('DELETE FROM subscriptions WHERE employer_id = $1', [demo.employer_id]);
    await db.query('DELETE FROM contact_reveals WHERE employer_id = $1', [demo.employer_id]);
    await db.query('DELETE FROM employers WHERE id = $1', [demo.employer_id]);
    await db.query('DELETE FROM email_logs WHERE user_id = $1', [demo.user_id]);
    await db.query('DELETE FROM users WHERE id = $1', [demo.user_id]);
  }

  return { deleted: expiredDemos.rows.length };
}
