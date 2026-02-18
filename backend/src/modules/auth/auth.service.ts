import db from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokens';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../services/email.service';

interface RegisterData {
  email: string;
  password: string;
  role: string;
  fullName?: string;
  companyName?: string;
}

export const register = async (data: RegisterData) => {
  const { email, password, role, fullName, companyName } = data;

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const userId = uuidv4();

  const verificationToken = crypto.randomBytes(32).toString('hex');

  await db.query(
    'INSERT INTO users (id, email, password_hash, role, verification_token) VALUES ($1, $2, $3, $4, $5)',
    [userId, email, passwordHash, role, verificationToken]
  );

  // Send verification email (non-blocking)
  sendVerificationEmail(email, verificationToken, userId).catch((err) =>
    console.error('Failed to send verification email:', err.message)
  );

  if (role === 'CANDIDATE') {
    const name = fullName || 'New Candidate';
    const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    await db.query(
      `INSERT INTO candidates (id, user_id, full_name, visa_status, current_emirate, availability_status, profile_slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), userId, name, 'OWN_VISA', 'DUBAI', 'IMMEDIATE', slug]
    );
  } else if (role === 'EMPLOYER') {
    const company = companyName || 'New Company';
    await db.query(
      'INSERT INTO employers (id, user_id, company_name) VALUES ($1, $2, $3)',
      [uuidv4(), userId, company]
    );
  }

  const accessToken = generateAccessToken({ id: userId, email, role });
  const refreshToken = generateRefreshToken({ id: userId });

  return { user: { id: userId, email, role }, accessToken, refreshToken };
};

export const login = async (email: string, password: string) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];
  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  return { user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken };
};

export const getMe = async (userId: string) => {
  const userResult = await db.query(
    'SELECT id, email, role, email_verified, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = userResult.rows[0];

  if (user.role === 'CANDIDATE') {
    const candidateResult = await db.query('SELECT * FROM candidates WHERE user_id = $1', [userId]);
    return { ...user, candidate: candidateResult.rows[0] || null };
  } else if (user.role === 'EMPLOYER') {
    const employerResult = await db.query('SELECT * FROM employers WHERE user_id = $1', [userId]);
    return { ...user, employer: employerResult.rows[0] || null };
  }

  return user;
};

export const verifyEmail = async (token: string) => {
  const result = await db.query(
    'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id, email',
    [token]
  );
  if (result.rows.length === 0) throw new Error('Invalid or expired verification token');
  return result.rows[0];
};

export const resendVerification = async (userId: string) => {
  const user = await db.query('SELECT id, email, email_verified FROM users WHERE id = $1', [userId]);
  if (user.rows.length === 0) throw new Error('User not found');
  if (user.rows[0].email_verified) throw new Error('Email already verified');

  const token = crypto.randomBytes(32).toString('hex');
  await db.query('UPDATE users SET verification_token = $1 WHERE id = $2', [token, userId]);
  await sendVerificationEmail(user.rows[0].email, token, userId);
  return { message: 'Verification email sent' };
};

export const requestPasswordReset = async (email: string) => {
  const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    // Don't reveal that email doesn't exist
    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  const userId = result.rows[0].id;
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.query(
    'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
    [token, expiry, userId]
  );

  await sendPasswordResetEmail(email, token, userId);
  return { message: 'If an account with that email exists, a password reset link has been sent.' };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const result = await db.query(
    'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
    [token]
  );
  if (result.rows.length === 0) throw new Error('Invalid or expired reset token');

  const passwordHash = await hashPassword(newPassword);
  await db.query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
    [passwordHash, result.rows[0].id]
  );
  return { message: 'Password reset successfully' };
};
