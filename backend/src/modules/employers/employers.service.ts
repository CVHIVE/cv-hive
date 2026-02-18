import db from '../../config/database';
import slugify from 'slugify';

export const getProfile = async (userId: string) => {
  const result = await db.query(
    `SELECT e.*, u.email FROM employers e JOIN users u ON e.user_id = u.id WHERE e.user_id = $1`,
    [userId]
  );
  if (result.rows.length === 0) throw new Error('Employer profile not found');
  return result.rows[0];
};

export const updateProfile = async (userId: string, data: any) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const map: Record<string, string> = {
    companyName: 'company_name', industry: 'industry', description: 'description',
    website: 'website', companySize: 'company_size', foundedYear: 'founded_year',
    location: 'location',
  };

  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      values.push(data[key]);
    }
  }

  // Auto-generate slug from company name if name is being updated
  if (data.companyName) {
    const slug = slugify(data.companyName, { lower: true, strict: true });
    fields.push(`company_slug = $${idx++}`);
    values.push(slug);
  }

  if (fields.length === 0) throw new Error('No fields to update');

  fields.push('updated_at = NOW()');
  values.push(userId);

  const result = await db.query(
    `UPDATE employers SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const updateLogo = async (userId: string, logoUrl: string) => {
  const result = await db.query(
    'UPDATE employers SET company_logo_url = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
    [logoUrl, userId]
  );
  if (result.rows.length === 0) throw new Error('Employer not found');
  return result.rows[0];
};

export const getPublicProfile = async (slug: string) => {
  const result = await db.query(
    `SELECT e.company_name, e.industry, e.company_logo_url, e.company_slug, e.description,
            e.website, e.company_size, e.founded_year, e.location, e.created_at
     FROM employers e
     WHERE e.company_slug = $1`,
    [slug]
  );
  if (result.rows.length === 0) throw new Error('Company not found');

  const employer = result.rows[0];

  // Get active jobs
  const jobs = await db.query(
    `SELECT j.id, j.title, j.industry, j.job_type, j.emirate, j.salary_min, j.salary_max,
            j.salary_hidden, j.created_at
     FROM jobs j
     JOIN employers e ON e.id = j.employer_id
     WHERE e.company_slug = $1 AND j.status = 'ACTIVE'
     ORDER BY j.created_at DESC`,
    [slug]
  );

  return { ...employer, jobs: jobs.rows };
};

export const getPublicDirectory = async (letter?: string) => {
  let query = `SELECT company_name, company_slug, industry, location, company_size, company_logo_url
    FROM employers WHERE company_slug IS NOT NULL`;
  const values: any[] = [];

  if (letter && letter.length === 1) {
    query += ` AND company_name ILIKE $1`;
    values.push(`${letter}%`);
  }

  query += ` ORDER BY company_name ASC`;

  const result = await db.query(query, values);
  return result.rows;
};
