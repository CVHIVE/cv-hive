import db from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

interface CreateAlertData {
  title?: string;
  industry?: string;
  jobType?: string;
  emirate?: string;
  salaryMin?: number;
  frequency?: string;
}

export const getAlerts = async (candidateId: string) => {
  const result = await db.query(
    'SELECT * FROM job_alerts WHERE candidate_id = $1 ORDER BY created_at DESC',
    [candidateId]
  );
  return result.rows;
};

export const createAlert = async (candidateId: string, data: CreateAlertData) => {
  const id = uuidv4();
  const result = await db.query(
    `INSERT INTO job_alerts (id, candidate_id, title, industry, job_type, emirate, salary_min, frequency)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id, candidateId, data.title || null, data.industry || null, data.jobType || null,
     data.emirate || null, data.salaryMin || null, data.frequency || 'WEEKLY']
  );
  return result.rows[0];
};

export const updateAlert = async (alertId: string, candidateId: string, data: Partial<CreateAlertData & { isActive: boolean }>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const map: Record<string, string> = {
    title: 'title', industry: 'industry', jobType: 'job_type',
    emirate: 'emirate', salaryMin: 'salary_min', frequency: 'frequency', isActive: 'is_active',
  };

  for (const [key, col] of Object.entries(map)) {
    if ((data as any)[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      values.push((data as any)[key]);
    }
  }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(alertId, candidateId);
  const result = await db.query(
    `UPDATE job_alerts SET ${fields.join(', ')} WHERE id = $${idx++} AND candidate_id = $${idx} RETURNING *`,
    values
  );
  if (result.rows.length === 0) throw new Error('Alert not found');
  return result.rows[0];
};

export const deleteAlert = async (alertId: string, candidateId: string) => {
  const result = await db.query(
    'DELETE FROM job_alerts WHERE id = $1 AND candidate_id = $2 RETURNING id',
    [alertId, candidateId]
  );
  if (result.rows.length === 0) throw new Error('Alert not found');
  return { deleted: true };
};
