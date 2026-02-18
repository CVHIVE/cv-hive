import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const trackEvent = async (
  eventType: string,
  options: { employerId?: string; jobId?: string; candidateId?: string; metadata?: any }
) => {
  await db.query(
    `INSERT INTO analytics_events (id, employer_id, job_id, event_type, candidate_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [uuidv4(), options.employerId || null, options.jobId || null, eventType,
     options.candidateId || null, options.metadata ? JSON.stringify(options.metadata) : null]
  );
};

export const getEmployerDashboardAnalytics = async (employerId: string) => {
  // Total jobs
  const jobsResult = await db.query(
    'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'ACTIVE\') as active FROM jobs WHERE employer_id = $1',
    [employerId]
  );

  // Total applications
  const appsResult = await db.query(
    `SELECT COUNT(*) as total,
            COUNT(*) FILTER (WHERE ja.status = 'PENDING') as pending,
            COUNT(*) FILTER (WHERE ja.status = 'SHORTLISTED') as shortlisted,
            COUNT(*) FILTER (WHERE ja.status = 'HIRED') as hired
     FROM job_applications ja
     JOIN jobs j ON j.id = ja.job_id
     WHERE j.employer_id = $1`,
    [employerId]
  );

  // Total views
  const viewsResult = await db.query(
    'SELECT COALESCE(SUM(views_count), 0) as total_views FROM jobs WHERE employer_id = $1',
    [employerId]
  );

  // Applications per day (last 30 days)
  const dailyApps = await db.query(
    `SELECT DATE(ja.applied_at) as date, COUNT(*) as count
     FROM job_applications ja
     JOIN jobs j ON j.id = ja.job_id
     WHERE j.employer_id = $1 AND ja.applied_at >= NOW() - INTERVAL '30 days'
     GROUP BY DATE(ja.applied_at)
     ORDER BY date`,
    [employerId]
  );

  // Top jobs by applications
  const topJobs = await db.query(
    `SELECT j.id, j.title, j.applications_count, j.views_count
     FROM jobs j WHERE j.employer_id = $1
     ORDER BY j.applications_count DESC LIMIT 5`,
    [employerId]
  );

  return {
    jobs: jobsResult.rows[0],
    applications: appsResult.rows[0],
    totalViews: parseInt(viewsResult.rows[0].total_views),
    dailyApplications: dailyApps.rows,
    topJobs: topJobs.rows,
  };
};

export const getJobAnalytics = async (jobId: string, employerId: string) => {
  // Verify ownership
  const job = await db.query('SELECT id, title, views_count, applications_count FROM jobs WHERE id = $1 AND employer_id = $2', [jobId, employerId]);
  if (job.rows.length === 0) throw new Error('Job not found');

  const statusBreakdown = await db.query(
    `SELECT status, COUNT(*) as count FROM job_applications WHERE job_id = $1 GROUP BY status`,
    [jobId]
  );

  const dailyApps = await db.query(
    `SELECT DATE(applied_at) as date, COUNT(*) as count
     FROM job_applications WHERE job_id = $1 AND applied_at >= NOW() - INTERVAL '30 days'
     GROUP BY DATE(applied_at) ORDER BY date`,
    [jobId]
  );

  return {
    job: job.rows[0],
    statusBreakdown: statusBreakdown.rows,
    dailyApplications: dailyApps.rows,
  };
};
