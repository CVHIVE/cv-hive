import db from '../../config/database';

export const getAllUsers = async () => {
  const result = await db.query(
    `SELECT id, email, role, email_verified, created_at FROM users ORDER BY created_at DESC`
  );
  return result.rows;
};

export const getUserById = async (userId: string) => {
  const userResult = await db.query(
    `SELECT id, email, role, email_verified, created_at FROM users WHERE id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = userResult.rows[0];

  if (user.role === 'CANDIDATE') {
    const candidate = await db.query('SELECT * FROM candidates WHERE user_id = $1', [userId]);
    return { ...user, candidate: candidate.rows[0] || null };
  } else if (user.role === 'EMPLOYER') {
    const employer = await db.query('SELECT * FROM employers WHERE user_id = $1', [userId]);
    const subscription = await db.query('SELECT * FROM subscriptions WHERE employer_id = $1', [employer.rows[0]?.id]);
    return { ...user, employer: employer.rows[0] || null, subscription: subscription.rows[0] || null };
  }

  return user;
};

export const getAllCandidates = async () => {
  const result = await db.query(
    `SELECT c.*, u.email, u.created_at as registered_at
     FROM candidates c
     JOIN users u ON u.id = c.user_id
     ORDER BY c.created_at DESC`
  );
  return result.rows;
};

export const getAllEmployers = async () => {
  const result = await db.query(
    `SELECT e.*, u.email, u.created_at as registered_at,
            s.plan_type, s.status as subscription_status, s.contact_reveals_used, s.contact_reveals_limit
     FROM employers e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN subscriptions s ON s.employer_id = e.id
     ORDER BY e.created_at DESC`
  );
  return result.rows;
};

export const getAllJobs = async () => {
  const result = await db.query(
    `SELECT j.*, e.company_name
     FROM jobs j
     JOIN employers e ON e.id = j.employer_id
     ORDER BY j.created_at DESC`
  );
  return result.rows;
};

export const deleteUser = async (userId: string) => {
  // Prevent deleting admin users
  const user = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
  if (user.rows.length === 0) throw new Error('User not found');
  if (user.rows[0].role === 'ADMIN') throw new Error('Cannot delete admin accounts');

  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [userId]);
  return result.rows[0];
};

/** Platform-wide statistics for admin dashboard */
export const getPlatformStats = async () => {
  const [users, candidates, employers, jobs, activeJobs, applications, subscriptions, revenue] = await Promise.all([
    db.query('SELECT COUNT(*) as count FROM users'),
    db.query('SELECT COUNT(*) as count FROM candidates'),
    db.query('SELECT COUNT(*) as count FROM employers'),
    db.query('SELECT COUNT(*) as count FROM jobs'),
    db.query("SELECT COUNT(*) as count FROM jobs WHERE status = 'ACTIVE'"),
    db.query('SELECT COUNT(*) as count FROM job_applications'),
    db.query("SELECT plan_type, COUNT(*) as count FROM subscriptions GROUP BY plan_type"),
    db.query("SELECT COUNT(*) as count FROM jobs WHERE status != 'DRAFT'"),  // jobs that were paid for
  ]);

  return {
    totalUsers: parseInt(users.rows[0].count),
    totalCandidates: parseInt(candidates.rows[0].count),
    totalEmployers: parseInt(employers.rows[0].count),
    totalJobs: parseInt(jobs.rows[0].count),
    activeJobs: parseInt(activeJobs.rows[0].count),
    totalApplications: parseInt(applications.rows[0].count),
    subscriptionBreakdown: subscriptions.rows,
    paidJobPostings: parseInt(revenue.rows[0].count),
  };
};

/** Recent activity feed for admin */
export const getRecentActivity = async (limit = 20) => {
  const result = await db.query(
    `(SELECT 'user_registered' as type, u.email as detail, u.role as meta, u.created_at
      FROM users u ORDER BY u.created_at DESC LIMIT $1)
     UNION ALL
     (SELECT 'job_posted' as type, j.title as detail, e.company_name as meta, j.created_at
      FROM jobs j JOIN employers e ON e.id = j.employer_id ORDER BY j.created_at DESC LIMIT $1)
     UNION ALL
     (SELECT 'application_submitted' as type, j.title as detail, c.full_name as meta, ja.applied_at as created_at
      FROM job_applications ja JOIN jobs j ON j.id = ja.job_id JOIN candidates c ON c.id = ja.candidate_id ORDER BY ja.applied_at DESC LIMIT $1)
     ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
};

/** Update a job's status (admin moderation) */
export const updateJobStatus = async (jobId: string, status: string) => {
  const validStatuses = ['ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED'];
  if (!validStatuses.includes(status)) throw new Error('Invalid status');

  const result = await db.query(
    'UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title, status',
    [status, jobId]
  );
  if (result.rows.length === 0) throw new Error('Job not found');
  return result.rows[0];
};

/** Update employer subscription (admin override) */
export const updateEmployerSubscription = async (employerId: string, planType: string) => {
  const validPlans = ['DEMO', 'PROFESSIONAL', 'ENTERPRISE'];
  if (!validPlans.includes(planType)) throw new Error('Invalid plan type');

  const limits: Record<string, number> = { DEMO: 0, PROFESSIONAL: 100, ENTERPRISE: 500 };

  const existing = await db.query('SELECT id FROM subscriptions WHERE employer_id = $1', [employerId]);
  if (existing.rows.length === 0) {
    const { v4: uuidv4 } = await import('uuid');
    await db.query(
      `INSERT INTO subscriptions (id, employer_id, plan_type, status, contact_reveals_limit, contact_reveals_used, current_period_start, current_period_end)
       VALUES ($1, $2, $3, 'ACTIVE', $4, 0, NOW(), NOW() + INTERVAL '30 days')`,
      [uuidv4(), employerId, planType, limits[planType]]
    );
  } else {
    await db.query(
      `UPDATE subscriptions SET plan_type = $1, contact_reveals_limit = $2, contact_reveals_used = 0,
       current_period_start = NOW(), current_period_end = NOW() + INTERVAL '30 days', status = 'ACTIVE'
       WHERE employer_id = $3`,
      [planType, limits[planType], employerId]
    );
  }

  return { employer_id: employerId, plan_type: planType };
};
