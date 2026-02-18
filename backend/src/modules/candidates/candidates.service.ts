import db from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getProfile = async (userId: string) => {
  const result = await db.query(
    `SELECT c.*, u.email FROM candidates c JOIN users u ON c.user_id = u.id WHERE c.user_id = $1`,
    [userId]
  );
  if (result.rows.length === 0) throw new Error('Candidate profile not found');
  return result.rows[0];
};

export const updateProfile = async (userId: string, data: any) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const columnMap: Record<string, string> = {
    fullName: 'full_name', phone: 'phone', visaStatus: 'visa_status',
    currentEmirate: 'current_emirate', jobTitle: 'job_title',
    totalExperience: 'total_experience_years', salaryMin: 'salary_min',
    salaryMax: 'salary_max', availabilityStatus: 'availability_status',
    profileVisible: 'profile_visible', industry: 'industry',
    desiredJobTitles: 'desired_job_titles', preferredEmirate: 'preferred_emirate',
    education: 'education', skills: 'skills', noticePeriod: 'notice_period',
    cvVisibility: 'cv_visibility',
  };

  for (const [key, col] of Object.entries(columnMap)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
  }

  if (fields.length === 0) throw new Error('No fields to update');

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await db.query(
    `UPDATE candidates SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const uploadCV = async (userId: string, file: any) => {
  const cvUrl = `/uploads/cvs/${file.filename}`;
  const originalName = file.originalname;
  const result = await db.query(
    'UPDATE candidates SET cv_url = $1, cv_original_filename = $2, updated_at = NOW() WHERE user_id = $3 RETURNING *',
    [cvUrl, originalName, userId]
  );
  return result.rows[0];
};

export const removeCV = async (userId: string) => {
  const result = await db.query(
    'UPDATE candidates SET cv_url = NULL, cv_original_filename = NULL, updated_at = NOW() WHERE user_id = $1 RETURNING *',
    [userId]
  );
  if (result.rows.length === 0) throw new Error('Candidate not found');
  return result.rows[0];
};

export const searchCandidates = async (filters: any) => {
  const { emirate, visaStatus, jobTitle, availability, industry, experienceMin, experienceMax, salaryMin, salaryMax, page = 1, limit = 20 } = filters;
  const conditions: string[] = ['profile_visible = true'];
  const values: any[] = [];
  let idx = 1;

  if (emirate) { conditions.push(`current_emirate = $${idx}`); values.push(emirate); idx++; }
  if (visaStatus) { conditions.push(`visa_status = $${idx}`); values.push(visaStatus); idx++; }
  if (jobTitle) { conditions.push(`(job_title ILIKE $${idx} OR desired_job_titles ILIKE $${idx})`); values.push(`%${jobTitle}%`); idx++; }
  if (availability) { conditions.push(`availability_status = $${idx}`); values.push(availability); idx++; }
  if (industry) { conditions.push(`industry = $${idx}`); values.push(industry); idx++; }
  if (experienceMin) { conditions.push(`total_experience_years >= $${idx}`); values.push(Number(experienceMin)); idx++; }
  if (experienceMax) { conditions.push(`total_experience_years <= $${idx}`); values.push(Number(experienceMax)); idx++; }
  if (salaryMin) { conditions.push(`salary_max >= $${idx}`); values.push(Number(salaryMin)); idx++; }
  if (salaryMax) { conditions.push(`salary_min <= $${idx}`); values.push(Number(salaryMax)); idx++; }

  const where = conditions.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  const countResult = await db.query(`SELECT COUNT(*) FROM candidates WHERE ${where}`, values);
  const total = parseInt(countResult.rows[0].count);

  const candidates = await db.query(
    `SELECT id, full_name, job_title, current_emirate, visa_status, total_experience_years,
            availability_status, profile_slug, industry, skills
     FROM candidates WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, Number(limit), offset]
  );

  return {
    candidates: candidates.rows,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

export const getPublicProfile = async (slug: string) => {
  const result = await db.query(
    `SELECT c.*, u.email FROM candidates c JOIN users u ON c.user_id = u.id
     WHERE c.profile_slug = $1 AND c.profile_visible = true`,
    [slug]
  );
  if (result.rows.length === 0) throw new Error('Profile not found');
  return result.rows[0];
};

export const getCandidateCVPath = async (candidateId: string) => {
  const result = await db.query(
    'SELECT cv_url FROM candidates WHERE id = $1',
    [candidateId]
  );
  if (result.rows.length === 0) throw new Error('Candidate not found');
  if (!result.rows[0].cv_url) throw new Error('No CV uploaded');
  return result.rows[0].cv_url;
};

export const getCandidateContactInfo = async (candidateId: string) => {
  const result = await db.query(
    `SELECT c.phone, c.cv_url, u.email FROM candidates c JOIN users u ON c.user_id = u.id WHERE c.id = $1`,
    [candidateId]
  );
  if (result.rows.length === 0) throw new Error('Candidate not found');
  return { phone: result.rows[0].phone, email: result.rows[0].email, cv_url: result.rows[0].cv_url };
};

export const checkAlreadyRevealed = async (employerId: string, candidateId: string) => {
  const result = await db.query(
    'SELECT id FROM contact_reveals WHERE employer_id = $1 AND candidate_id = $2',
    [employerId, candidateId]
  );
  return result.rows.length > 0;
};

export const recordReveal = async (employerId: string, candidateId: string) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO contact_reveals (id, employer_id, candidate_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [id, employerId, candidateId]
  );
};
