import db from '../../config/database';
import { hashPassword } from '../../utils/password';

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
    return { ...user, employer: employer.rows[0] || null };
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
    `SELECT e.*, u.email, u.created_at as registered_at
     FROM employers e
     JOIN users u ON u.id = e.user_id
     ORDER BY e.created_at DESC`
  );
  return result.rows;
};

export const resetPassword = async (userId: string, newPassword: string) => {
  const hash = await hashPassword(newPassword);
  const result = await db.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email',
    [hash, userId]
  );
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return result.rows[0];
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
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [userId]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return result.rows[0];
};
