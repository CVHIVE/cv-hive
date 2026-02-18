import db from '../config/database';

export const getSimilarJobs = async (jobId: string, limit: number = 4) => {
  // Get the source job
  const source = await db.query(
    'SELECT industry, emirate, job_type FROM jobs WHERE id = $1',
    [jobId]
  );
  if (source.rows.length === 0) throw new Error('Job not found');

  const { industry, emirate, job_type } = source.rows[0];

  // Score similar jobs: industry match = 3, emirate match = 2, job_type match = 1
  const result = await db.query(
    `SELECT j.id, j.title, j.industry, j.job_type, j.emirate, j.salary_min, j.salary_max,
            j.salary_hidden, j.created_at, e.company_name, e.company_slug,
            (CASE WHEN j.industry = $2 THEN 3 ELSE 0 END +
             CASE WHEN j.emirate = $3 THEN 2 ELSE 0 END +
             CASE WHEN j.job_type = $4 THEN 1 ELSE 0 END) as relevance_score
     FROM jobs j
     JOIN employers e ON e.id = j.employer_id
     WHERE j.id != $1 AND j.status = 'ACTIVE'
     ORDER BY relevance_score DESC, j.created_at DESC
     LIMIT $5`,
    [jobId, industry, emirate, job_type, limit]
  );

  return result.rows;
};
