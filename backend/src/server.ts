import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { autoPauseUnresponsiveJobs, autoExpireJobs } from './modules/jobs/jobs.service';
import { cleanupDemoAccounts } from '../scripts/cleanup-demo-accounts';

const PORT = process.env.PORT || 5000;

// Run auto-pause and auto-expire every hour
const runMaintenanceTasks = async () => {
  try {
    const paused = await autoPauseUnresponsiveJobs();
    if (paused.length > 0) {
      console.log(`[CRON] Auto-paused ${paused.length} job(s) due to unresponsive employers`);
    }
    const expired = await autoExpireJobs();
    if (expired.length > 0) {
      console.log(`[CRON] Auto-expired ${expired.length} job(s) past 28-day limit`);
    }
    // Cleanup expired demo accounts
    const cleanup = await cleanupDemoAccounts();
    if (cleanup.deleted > 0) {
      console.log(`[CRON] Cleaned up ${cleanup.deleted} expired demo account(s)`);
    }
  } catch (err) {
    console.error('[CRON] Maintenance tasks error:', err);
  }
};

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/v1`);

  // Run maintenance tasks every hour (3600000ms)
  setInterval(runMaintenanceTasks, 60 * 60 * 1000);
  // Also run once on startup after a short delay
  setTimeout(runMaintenanceTasks, 10000);
});
