import db from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { sendApplicationNotification, sendStatusChangeNotification } from '../../services/email.service';

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
    `SELECT j.*, e.company_name, e.industry as company_industry, u.email as employer_email
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

  const where = conditions.join(' AND ');
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const offset = (page - 1) * limit;

  const countResult = await db.query(
    `SELECT COUNT(*) FROM jobs j WHERE ${where}`, values
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await db.query(
    `SELECT j.id, j.title, j.industry, j.job_type, j.emirate, j.salary_min, j.salary_max,
            j.salary_hidden, j.experience_min, j.experience_max, j.skills, j.created_at,
            j.views_count, j.applications_count, e.company_name
     FROM jobs j
     JOIN employers e ON e.id = j.employer_id
     WHERE ${where}
     ORDER BY j.created_at DESC
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
    `INSERT INTO job_applications (id, job_id, candidate_id, cover_letter)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, jobId, candidateId, coverLetter || null]
  );

  // Increment applications count
  await db.query('UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1', [jobId]);

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
            c.current_emirate, c.visa_status, u.email
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
            e.company_name
     FROM job_applications ja
     JOIN jobs j ON j.id = ja.job_id
     JOIN employers e ON e.id = j.employer_id
     WHERE ja.candidate_id = $1
     ORDER BY ja.applied_at DESC`,
    [candidateId]
  );
  return result.rows;
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
    'UPDATE job_applications SET status = $1 WHERE id = $2',
    [newStatus, applicationId]
  );

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

export const payForJob = async (jobId: string, employerId: string) => {
  // Verify ownership and DRAFT status
  const job = await db.query(
    'SELECT id, status FROM jobs WHERE id = $1 AND employer_id = $2',
    [jobId, employerId]
  );
  if (job.rows.length === 0) throw new Error('Job not found or not authorized');
  if (job.rows[0].status !== 'DRAFT') throw new Error('Job is already paid for');

  // Check for active payment method
  const card = await db.query(
    'SELECT id FROM payment_methods WHERE employer_id = $1 AND is_default = TRUE LIMIT 1',
    [employerId]
  );
  if (card.rows.length === 0) {
    throw new Error('No payment method on file. Please add a card first.');
  }

  // Charge AED 100 (in dev mode, just activate directly)
  const result = await db.query(
    `UPDATE jobs SET status = 'ACTIVE', expires_at = NOW() + INTERVAL '28 days', updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [jobId]
  );
  return result.rows[0];
};
