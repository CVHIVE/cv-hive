/**
 * Cleanup Demo Accounts
 * 
 * Deletes employer accounts that are on the DEMO plan and have been active
 * for more than 24 hours. Run this as a cron job or manually.
 * 
 * Usage: npx ts-node scripts/cleanup-demo-accounts.ts
 */

import db from '../src/config/database';

async function cleanupDemoAccounts() {
  console.log('🧹 Starting demo account cleanup...');

  try {
    // Find expired demo subscriptions (older than 24 hours)
    const expiredDemos = await db.query(
      `SELECT s.id as sub_id, s.employer_id, e.user_id, u.email
       FROM subscriptions s
       JOIN employers e ON e.id = s.employer_id
       JOIN users u ON u.id = e.user_id
       WHERE s.plan_type = 'DEMO'
         AND s.current_period_end < NOW()`
    );

    if (expiredDemos.rows.length === 0) {
      console.log('✅ No expired demo accounts found.');
      return { deleted: 0 };
    }

    console.log(`Found ${expiredDemos.rows.length} expired demo account(s)`);

    for (const demo of expiredDemos.rows) {
      console.log(`  Deleting: ${demo.email} (user: ${demo.user_id})`);

      // Delete in proper order due to foreign key constraints
      // Jobs and related data
      await db.query(
        `DELETE FROM job_applications WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = $1)`,
        [demo.employer_id]
      );
      await db.query(
        `DELETE FROM saved_jobs WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = $1)`,
        [demo.employer_id]
      );
      await db.query('DELETE FROM jobs WHERE employer_id = $1', [demo.employer_id]);

      // Subscription
      await db.query('DELETE FROM subscriptions WHERE employer_id = $1', [demo.employer_id]);

      // Contact reveals
      await db.query('DELETE FROM contact_reveals WHERE employer_id = $1', [demo.employer_id]);

      // Employer
      await db.query('DELETE FROM employers WHERE id = $1', [demo.employer_id]);

      // Email logs
      await db.query('DELETE FROM email_logs WHERE user_id = $1', [demo.user_id]);

      // User
      await db.query('DELETE FROM users WHERE id = $1', [demo.user_id]);

      console.log(`  ✅ Deleted ${demo.email}`);
    }

    console.log(`\n🧹 Cleanup complete. Deleted ${expiredDemos.rows.length} demo account(s).`);
    return { deleted: expiredDemos.rows.length };
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

// Allow running directly or importing
if (require.main === module) {
  cleanupDemoAccounts()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { cleanupDemoAccounts };
