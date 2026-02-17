import db from '../../config/database';

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

  if (data.companyName) { fields.push(`company_name = $${idx}`); values.push(data.companyName); idx++; }
  if (data.industry) { fields.push(`industry = $${idx}`); values.push(data.industry); idx++; }

  if (fields.length === 0) throw new Error('No fields to update');

  fields.push('updated_at = NOW()');
  values.push(userId);

  const result = await db.query(
    `UPDATE employers SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};
