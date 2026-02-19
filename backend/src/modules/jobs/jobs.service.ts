import db from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { sendApplicationNotification, sendStatusChangeNotification } from '../../services/email.service';
import stripe from '../../config/stripe';

interface CreateJobData {
  title: string;
  description: string;
  industry: string;
  jobType: string;
  emirate: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryHidden?: boolean;
  experienceMin?: number;
  experienceMax?: number;
  skills?: string;
  status?: string;
}

export const createJob = async (employerId: string, data: CreateJobData) => {
  // Block DEMO plan employers from posting jobs
  const subCheck = await db.query('SELECT plan_type FROM subscriptions WHERE employer_id = $1', [employerId]);
  if (subCheck.rows.length > 0 && subCheck.rows[0].plan_type === 'DEMO') {
    throw new Error('Demo accounts cannot post jobs. Please upgrade your plan to start posting.');
  }

  const id = uuidv4();
  const result = await db.query(
    `INSERT INTO jobs (id, employer_id, title, description, industry, job_type, emirate,
      salary_min, salary_max, salary_hidden, experience_min, experience_max, skills, status, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW() + INTERVAL '28 days')
     RETURNING *`,
    [id, employerId, data.title, data.description, data.industry, data.jobType, data.emirate,
     data.salaryMin || null, data.salaryMax || null, data.salaryHidden || false,
     data.experienceMin || null, data.experienceMax || null, data.skills || null,
     'DRAFT']
  );
  return result.rows[0];
};

export const updateJob = async (jobId: string, employerId: string, data: Partial<CreateJobData>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const map: Record<string, string> = {
    title: 'title', description: 'description', industry: 'industry',
    jobType: 'job_type', emirate: 'emirate', salaryMin: 'salary_min',
    salaryMax: 'salary_max', salaryHidden: 'salary_hidden',
    experienceMin: 'experience_min', experienceMax: 'experience_max',
    skills: 'skills', status: 'status',
  };

  for (const [key, col] of Object.entries(map)) {
    if ((data as any)[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      values.push((data as any)[key]);
    }
  }

  if (fields.length === 0) throw new Error('No fields to update');

  fields.push(`updated_at = NOW()`);
  values.push(jobId, employerId);

  const result = await db.query(
    `UPDATE jobs SET ${fields.join(', ')} WHERE id = $${idx++} AND employer_id = $${idx} RETURNING *`,
    values
  );

  if (result.rows.length === 0) throw new Error('Job not found or not authorized');
  return result.rows[0];
};

export const getJobById = async (jobId: string) => {
  const result = await db.query(
    `SELECT j.*, e.company_name, e.industry as company_industry, u.email as employer_email,
            e.response_rate, e.reputation_score, e.company_slug
     FROM jobs j
     JOIN employers e ON e.id = j.employer_id
     JOIN users u ON u.id = e.user_id
     WHERE j.id = $1`,
    [jobId]
  );
  if (result.rows.length === 0) throw new Error('Job not found');

  // Increment views
  await db.query('UPDATE jobs SET views_count = views_count + 1 WHERE id = $1', [jobId]);

  return result.rows[0];
};

export const searchJobs = async (filters: any) => {
  const conditions: string[] = ["j.status = 'ACTIVE'"];
  const values: any[] = [];
  let idx = 1;

  if (filters.title) {
    conditions.push(`(j.title ILIKE $${idx} OR j.description ILIKE $${idx})`);
    values.push(`%${filters.title}%`);
    idx++;
  }
  if (filters.industry) {
    conditions.push(`j.industry = $${idx++}`);
    values.push(filters.industry);
  }
  if (filters.emirate) {
    conditions.push(`j.emirate = $${idx++}`);
    values.push(filters.emirate);
  }
  if (filters.jobType) {
    conditions.push(`j.job_type = $${idx++}`);
    values.push(filters.jobType);
  }
  if (filters.salaryMin) {
    conditions.push(`j.salary_max >= $${idx++}`);
    values.push(filters.salaryMin);
  }
  if (filters.experienceMax != null) {
    conditions.push(`(j.experience_min IS NULL OR j.experience_min <= $${idx++})`);
    values.push(filters.experienceMax);
  }
  if (filters.postedWithin) {
    const days: Record<string, number> = { today: 1, '3days': 3, week: 7, month: 30 };
    const d = days[filters.postedWithin];
    if (d) {
      conditions.push(`j.created_at >= NOW() - INTERVAL '${d} days'`);
    }
  }

  const where = conditions.join(' AND ');
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const offset = (page - 1) * limit;

  const countResult = await db.query(
    `SELECT COUNT(*) FROM jobs j WHERE ${where}`, values
  );
  const total = parseInt(countResult.rows[0].count);

  // Build ORDER BY based on sort parameter
  let orderBy = 'j.created_at DESC';
  if (filters.sort === 'salary_desc') orderBy = 'j.salary_max DESC NULLS LAST';
  else if (filters.sort === 'salary_asc') orderBy = 'j.salary_min ASC NULLS LAST';

  const result = await db.query(
    `SELECT j.id, j.title, j.industry, j.job_type, j.emirate, j.salary_min, j.salary_max,
            j.salary_hidden, j.experience_min, j.experience_max, j.skills, j.created_at,
            j.views_count, j.applications_count, e.company_name
     FROM jobs j
     JOIN employers e ON e.id = j.employer_id
     WHERE ${where}
     ORDER BY ${orderBy}
     LIMIT $${idx++} OFFSET $${idx}`,
    [...values, limit, offset]
  );

  return {
    jobs: result.rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getEmployerJobs = async (employerId: string) => {
  const result = await db.query(
    `SELECT * FROM jobs WHERE employer_id = $1 ORDER BY created_at DESC`,
    [employerId]
  );
  return result.rows;
};

export const closeJob = async (jobId: string, employerId: string) => {
  const result = await db.query(
    `UPDATE jobs SET status = 'CLOSED', updated_at = NOW() WHERE id = $1 AND employer_id = $2 RETURNING *`,
    [jobId, employerId]
  );
  if (result.rows.length === 0) throw new Error('Job not found or not authorized');
  return result.rows[0];
};

export const applyToJob = async (jobId: string, candidateId: string, coverLetter?: string) => {
  // Check not already applied
  const existing = await db.query(
    'SELECT id FROM job_applications WHERE job_id = $1 AND candidate_id = $2',
    [jobId, candidateId]
  );
  if (existing.rows.length > 0) throw new Error('Already applied to this job');

  // Check job is active
  const job = await db.query(
    `SELECT j.status, j.title, u.email as employer_email
     FROM jobs j
     JOIN employers e ON e.id = j.employer_id
     JOIN users u ON u.id = e.user_id
     WHERE j.id = $1`,
    [jobId]
  );
  if (job.rows.length === 0) throw new Error('Job not found');
  if (job.rows[0].status !== 'ACTIVE') throw new Error('Job is no longer accepting applications');

  const id = uuidv4();
  const result = await db.query(
    `INSERT INTO job_applications (id, job_id, candidate_id, cover_letter, response_deadline)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days') RETURNING *`,
    [id, jobId, candidateId, coverLetter || null]
  );

  // Increment applications count
  await db.query('UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1', [jobId]);

  // Increment total_applications_received on employer
  await db.query(
    `UPDATE employers SET total_applications_received = total_applications_received + 1
     WHERE id = (SELECT employer_id FROM jobs WHERE id = $1)`,
    [jobId]
  );

  // Send notification email to employer (non-blocking)
  const candidate = await db.query('SELECT full_name FROM candidates WHERE id = $1', [candidateId]);
  const candidateName = candidate.rows[0]?.full_name || 'A candidate';
  sendApplicationNotification(job.rows[0].employer_email, candidateName, job.rows[0].title).catch((err) =>
    console.error('Failed to send application notification:', err.message)
  );

  return result.rows[0];
};

export const getApplicationsForJob = async (jobId: string, employerId: string) => {
  // Verify ownership
  const job = await db.query('SELECT id FROM jobs WHERE id = $1 AND employer_id = $2', [jobId, employerId]);
  if (job.rows.length === 0) throw new Error('Job not found or not authorized');

  const result = await db.query(
    `SELECT ja.*, c.full_name, c.job_title, c.cv_url, c.total_experience_years,
            c.current_emirate, c.visa_status, c.phone, u.email
     FROM job_applications ja
     JOIN candidates c ON c.id = ja.candidate_id
     JOIN users u ON u.id = c.user_id
     WHERE ja.job_id = $1
     ORDER BY ja.applied_at DESC`,
    [jobId]
  );
  return result.rows;
};

export const getCandidateApplications = async (candidateId: string) => {
  const result = await db.query(
    `SELECT ja.*, j.title as job_title, j.emirate, j.job_type, j.status as job_status,
            e.company_name, e.response_rate as employer_response_rate,
            e.reputation_score as employer_reputation_score
     FROM job_applications ja
     JOIN jobs j ON j.id = ja.job_id
     JOIN employers e ON e.id = j.employer_id
     WHERE ja.candidate_id = $1
     ORDER BY ja.applied_at DESC`,
    [candidateId]
  );
  return result.rows;
};

export const withdrawApplication = async (applicationId: string, candidateId: string) => {
  const app = await db.query(
    'SELECT id, status, job_id FROM job_applications WHERE id = $1 AND candidate_id = $2',
    [applicationId, candidateId]
  );
  if (app.rows.length === 0) throw new Error('Application not found');
  if (app.rows[0].status === 'WITHDRAWN') throw new Error('Application already withdrawn');
  if (app.rows[0].status === 'HIRED') throw new Error('Cannot withdraw a hired application');

  await db.query(
    "UPDATE job_applications SET status = 'WITHDRAWN', updated_at = NOW() WHERE id = $1",
    [applicationId]
  );

  // Decrement applications count on job
  await db.query(
    'UPDATE jobs SET applications_count = GREATEST(0, applications_count - 1) WHERE id = $1',
    [app.rows[0].job_id]
  );

  return { id: applicationId, status: 'WITHDRAWN' };
};

export const saveJob = async (jobId: string, candidateId: string) => {
  const existing = await db.query(
    'SELECT id FROM saved_jobs WHERE job_id = $1 AND candidate_id = $2',
    [jobId, candidateId]
  );
  if (existing.rows.length > 0) throw new Error('Job already saved');

  const id = uuidv4();
  await db.query(
    'INSERT INTO saved_jobs (id, job_id, candidate_id) VALUES ($1, $2, $3)',
    [id, jobId, candidateId]
  );
  return { saved: true };
};

export const unsaveJob = async (jobId: string, candidateId: string) => {
  await db.query(
    'DELETE FROM saved_jobs WHERE job_id = $1 AND candidate_id = $2',
    [jobId, candidateId]
  );
  return { saved: false };
};

export const getSavedJobs = async (candidateId: string) => {
  const result = await db.query(
    `SELECT sj.saved_at, j.id, j.title, j.industry, j.job_type, j.emirate,
            j.salary_min, j.salary_max, j.salary_hidden, j.status, j.created_at,
            e.company_name
     FROM saved_jobs sj
     JOIN jobs j ON j.id = sj.job_id
     JOIN employers e ON e.id = j.employer_id
     WHERE sj.candidate_id = $1
     ORDER BY sj.saved_at DESC`,
    [candidateId]
  );
  return result.rows;
};

export const updateApplicationStatus = async (
  applicationId: string, employerId: string, newStatus: string, notes?: string
) => {
  // Verify employer owns the job this application belongs to
  const app = await db.query(
    `SELECT ja.id, ja.status, ja.job_id, ja.candidate_id, j.employer_id
     FROM job_applications ja
     JOIN jobs j ON j.id = ja.job_id
     WHERE ja.id = $1`,
    [applicationId]
  );
  if (app.rows.length === 0) throw new Error('Application not found');
  if (app.rows[0].employer_id !== employerId) throw new Error('Not authorized');

  const oldStatus = app.rows[0].status;
  if (oldStatus === newStatus) throw new Error('Status is already ' + newStatus);

  // Get the user id of the employer for the history record
  const employer = await db.query('SELECT user_id FROM employers WHERE id = $1', [employerId]);
  const changedBy = employer.rows[0]?.user_id;

  // Update application status
  await db.query(
    'UPDATE job_applications SET status = $1, responded_at = CASE WHEN responded_at IS NULL THEN NOW() ELSE responded_at END WHERE id = $2',
    [newStatus, applicationId]
  );

  // Update employer response metrics if this is the first response
  if (oldStatus === 'PENDING') {
    // Recalculate from actual data to ensure correctness
    const empId = app.rows[0].employer_id;
    const totalReceived = await db.query(
      `SELECT COUNT(*) as count FROM job_applications ja JOIN jobs j ON j.id = ja.job_id WHERE j.employer_id = $1`,
      [empId]
    );
    const totalResponded = await db.query(
      `SELECT COUNT(*) as count FROM job_applications ja JOIN jobs j ON j.id = ja.job_id WHERE j.employer_id = $1 AND ja.status != 'PENDING'`,
      [empId]
    );
    const received = parseInt(totalReceived.rows[0].count) || 0;
    const responded = parseInt(totalResponded.rows[0].count) || 0;
    const rate = received > 0 ? (responded / received) * 100 : 0;

    let reputationBoost = 0.5;
    if (newStatus === 'REVIEWED' || newStatus === 'SHORTLISTED' || newStatus === 'HIRED') reputationBoost = 2;
    else if (newStatus === 'REJECTED') reputationBoost = 1;

    await db.query(
      `UPDATE employers SET
        total_applications_received = $1,
        total_applications_responded = $2,
        response_rate = $3,
        reputation_score = LEAST(100, reputation_score + $4)
       WHERE id = $5`,
      [received, responded, rate, reputationBoost, empId]
    );
  }

  // Insert status history
  const historyId = uuidv4();
  await db.query(
    `INSERT INTO application_status_history (id, application_id, old_status, new_status, changed_by, notes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [historyId, applicationId, oldStatus, newStatus, changedBy, notes || null]
  );

  // Send status change email to candidate (non-blocking)
  const candidateInfo = await db.query(
    `SELECT u.email, u.id as user_id, j.title as job_title, e.company_name
     FROM candidates c
     JOIN users u ON u.id = c.user_id
     JOIN job_applications ja ON ja.candidate_id = c.id
     JOIN jobs j ON j.id = ja.job_id
     JOIN employers e ON e.id = j.employer_id
     WHERE ja.id = $1`,
    [applicationId]
  );
  if (candidateInfo.rows.length > 0) {
    const ci = candidateInfo.rows[0];
    sendStatusChangeNotification(ci.email, ci.job_title, ci.company_name, newStatus, ci.user_id).catch((err) =>
      console.error('Failed to send status change notification:', err.message)
    );
  }

  return { id: applicationId, oldStatus, newStatus, notes };
};

export const getApplicationStatusHistory = async (applicationId: string, employerId: string) => {
  // Verify employer owns the job
  const app = await db.query(
    `SELECT ja.id FROM job_applications ja
     JOIN jobs j ON j.id = ja.job_id
     WHERE ja.id = $1 AND j.employer_id = $2`,
    [applicationId, employerId]
  );
  if (app.rows.length === 0) throw new Error('Application not found or not authorized');

  const result = await db.query(
    `SELECT ash.*, u.email as changed_by_email
     FROM application_status_history ash
     LEFT JOIN users u ON u.id = ash.changed_by
     WHERE ash.application_id = $1
     ORDER BY ash.created_at DESC`,
    [applicationId]
  );
  return result.rows;
};

export const getRecentJobs = async (limit: number = 6) => {
  const result = await db.query(
    `SELECT j.id, j.title, j.industry, j.job_type, j.emirate, j.salary_min, j.salary_max,
            j.salary_hidden, j.created_at, e.company_name
     FROM jobs j
     JOIN employers e ON e.id = j.employer_id
     WHERE j.status = 'ACTIVE'
     ORDER BY j.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

export const getPlatformStats = async () => {
  const [jobs, candidates, employers, industries] = await Promise.all([
    db.query(`SELECT COUNT(*) as count FROM jobs WHERE status = 'ACTIVE'`),
    db.query(`SELECT COUNT(*) as count FROM candidates WHERE profile_visible = TRUE`),
    db.query(`SELECT COUNT(*) as count FROM employers`),
    db.query(
      `SELECT industry, COUNT(*) as count FROM jobs WHERE status = 'ACTIVE' AND industry IS NOT NULL
       GROUP BY industry ORDER BY count DESC LIMIT 12`
    ),
  ]);
  return {
    activeJobs: parseInt(jobs.rows[0].count),
    candidates: parseInt(candidates.rows[0].count),
    employers: parseInt(employers.rows[0].count),
    industries: industries.rows.map((r: any) => ({ name: r.industry, count: parseInt(r.count) })),
  };
};

export const getSalaryGuide = async () => {
  const [byIndustry, byEmirate, overall] = await Promise.all([
    db.query(
      `SELECT industry,
              COUNT(*) as job_count,
              ROUND(AVG(salary_min)) as avg_min,
              ROUND(AVG(salary_max)) as avg_max,
              ROUND(AVG((COALESCE(salary_min,0) + COALESCE(salary_max,0)) / 2)) as avg_salary,
              MIN(salary_min) as lowest,
              MAX(salary_max) as highest
       FROM jobs
       WHERE salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_min > 0
       GROUP BY industry
       ORDER BY avg_salary DESC`
    ),
    db.query(
      `SELECT emirate,
              COUNT(*) as job_count,
              ROUND(AVG(salary_min)) as avg_min,
              ROUND(AVG(salary_max)) as avg_max,
              ROUND(AVG((COALESCE(salary_min,0) + COALESCE(salary_max,0)) / 2)) as avg_salary
       FROM jobs
       WHERE salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_min > 0
       GROUP BY emirate
       ORDER BY avg_salary DESC`
    ),
    db.query(
      `SELECT COUNT(*) as total_jobs,
              ROUND(AVG(salary_min)) as avg_min,
              ROUND(AVG(salary_max)) as avg_max,
              ROUND(AVG((COALESCE(salary_min,0) + COALESCE(salary_max,0)) / 2)) as avg_salary
       FROM jobs
       WHERE salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_min > 0`
    ),
  ]);
  return {
    byIndustry: byIndustry.rows,
    byEmirate: byEmirate.rows,
    overall: overall.rows[0],
  };
};

export const getFeaturedEmployers = async () => {
  const result = await db.query(
    `SELECT e.company_name, e.company_slug, e.industry, e.company_logo_url,
            COUNT(j.id) as job_count
     FROM employers e
     LEFT JOIN jobs j ON j.employer_id = e.id AND j.status = 'ACTIVE'
     GROUP BY e.id
     ORDER BY job_count DESC, e.created_at ASC
     LIMIT 12`
  );
  return result.rows;
};

export const payForJob = async (jobId: string, employerId: string) => {
  // Verify ownership and DRAFT status
  const job = await db.query(
    'SELECT j.id, j.title, j.status FROM jobs j WHERE j.id = $1 AND j.employer_id = $2',
    [jobId, employerId]
  );
  if (job.rows.length === 0) throw new Error('Job not found or not authorized');
  if (job.rows[0].status !== 'DRAFT') throw new Error('Job is already paid for');

  // Get employer info for Stripe customer
  const employer = await db.query(
    `SELECT e.id, e.company_name, u.email, u.id as user_id
     FROM employers e JOIN users u ON u.id = e.user_id WHERE e.id = $1`,
    [employerId]
  );
  if (employer.rows.length === 0) throw new Error('Employer not found');
  const emp = employer.rows[0];

  // Create or get Stripe customer
  const sub = await db.query('SELECT stripe_customer_id FROM subscriptions WHERE employer_id = $1', [employerId]);
  let customerId = sub.rows[0]?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: emp.email,
      metadata: { employer_id: employerId, user_id: emp.user_id },
    });
    customerId = customer.id;
    // Store customer ID
    if (sub.rows.length > 0) {
      await db.query('UPDATE subscriptions SET stripe_customer_id = $1 WHERE employer_id = $2', [customerId, employerId]);
    }
  }

  // Create Stripe Checkout session for one-time AED 100 payment
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'aed',
        product_data: {
          name: `Job Posting: ${job.rows[0].title}`,
          description: 'Active for 28 days on CV Hive',
        },
        unit_amount: 10000, // AED 100 in fils
      },
      quantity: 1,
    }],
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/employer-dashboard?job_payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/employer-dashboard?job_payment=cancelled`,
    metadata: { job_id: jobId, employer_id: employerId, type: 'job_posting' },
  });

  return { sessionId: session.id, url: session.url };
};

export const verifyJobPaymentSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    return { status: 'unpaid' };
  }

  const jobId = session.metadata?.job_id;
  if (!jobId) return { status: 'paid', job_id: null };

  // Check if already active
  const job = await db.query('SELECT id, status, title FROM jobs WHERE id = $1', [jobId]);
  if (job.rows.length === 0) return { status: 'error', message: 'Job not found' };

  if (job.rows[0].status === 'ACTIVE') {
    return { status: 'already_active', job_id: jobId, title: job.rows[0].title };
  }

  await activateJobAfterPayment(jobId);
  return { status: 'activated', job_id: jobId, title: job.rows[0].title };
};

export const activateJobAfterPayment = async (jobId: string) => {
  const result = await db.query(
    `UPDATE jobs SET status = 'ACTIVE', expires_at = NOW() + INTERVAL '28 days', updated_at = NOW()
     WHERE id = $1 AND status = 'DRAFT' RETURNING *`,
    [jobId]
  );
  if (result.rows.length === 0) {
    console.error('Failed to activate job - not found or not DRAFT:', jobId);
    return null;
  }
  console.log('\u2705 Job activated after payment:', jobId);
  return result.rows[0];
};

/**
 * Auto-pause jobs that have unresponded applications past the 7-day deadline.
 * Should be called by a cron job or scheduler.
 */
export const autoPauseUnresponsiveJobs = async () => {
  // Find active jobs where any application has passed its 7-day response deadline without a response
  const result = await db.query(
    `UPDATE jobs SET status = 'PAUSED', updated_at = NOW()
     WHERE status = 'ACTIVE'
       AND id IN (
         SELECT DISTINCT j.id FROM jobs j
         JOIN job_applications ja ON ja.job_id = j.id
         WHERE j.status = 'ACTIVE'
           AND ja.status = 'PENDING'
           AND ja.response_deadline < NOW()
       )
     RETURNING id, title`
  );
  return result.rows;
};

/**
 * Auto-expire jobs past their expiry date (28 days).
 */
export const autoExpireJobs = async () => {
  const result = await db.query(
    `UPDATE jobs SET status = 'EXPIRED', updated_at = NOW()
     WHERE status = 'ACTIVE' AND expires_at < NOW()
     RETURNING id, title`
  );
  return result.rows;
};

/**
 * Repost an expired job — resets it to DRAFT so employer can pay & publish again.
 * Creates a Stripe Checkout session for payment.
 */
export const repostJob = async (jobId: string, employerId: string) => {
  const job = await db.query(
    `SELECT id, status, title FROM jobs WHERE id = $1 AND employer_id = $2`,
    [jobId, employerId]
  );
  if (job.rows.length === 0) throw new Error('Job not found');
  if (job.rows[0].status !== 'EXPIRED' && job.rows[0].status !== 'CLOSED') {
    throw new Error('Only expired or closed jobs can be reposted');
  }

  // Reset to DRAFT with new timestamps
  await db.query(
    `UPDATE jobs SET status = 'DRAFT', created_at = NOW(), expires_at = NOW() + INTERVAL '28 days', updated_at = NOW()
     WHERE id = $1`,
    [jobId]
  );

  // Create Stripe Checkout session for job posting payment (AED 100)
  return payForJob(jobId, employerId);
};

/**
 * Get employer response rate and reputation score.
 */
export const getEmployerResponseMetrics = async (employerId: string) => {
  const result = await db.query(
    `SELECT response_rate, reputation_score, total_applications_received, total_applications_responded
     FROM employers WHERE id = $1`,
    [employerId]
  );
  if (result.rows.length === 0) throw new Error('Employer not found');
  return result.rows[0];
};

/**
 * Get employer response metrics by company slug (for public profile).
 */
export const getEmployerResponseMetricsBySlug = async (slug: string) => {
  const result = await db.query(
    `SELECT response_rate, reputation_score, total_applications_received, total_applications_responded
     FROM employers WHERE company_slug = $1`,
    [slug]
  );
  if (result.rows.length === 0) throw new Error('Employer not found');
  return result.rows[0];
};

/**
 * Get employer response metrics by job's employer (for job detail page).
 */
export const getEmployerResponseMetricsByJobId = async (jobId: string) => {
  const result = await db.query(
    `SELECT e.response_rate, e.reputation_score, e.total_applications_received, e.total_applications_responded
     FROM employers e
     JOIN jobs j ON j.employer_id = e.id
     WHERE j.id = $1`,
    [jobId]
  );
  if (result.rows.length === 0) throw new Error('Employer not found');
  return result.rows[0];
};
