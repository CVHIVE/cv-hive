import db from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokens';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../services/email.service';
import { isBusinessEmail } from './auth.validation';

interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
}

interface RegisterEmployerData {
  email: string;
  password: string;
  companyName: string;
}

export const register = async (data: RegisterData) => {
  const { email, password, fullName } = data;

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const userId = uuidv4();
  const role = 'CANDIDATE';

  const verificationToken = crypto.randomBytes(32).toString('hex');

  await db.query(
    'INSERT INTO users (id, email, password_hash, role, verification_token) VALUES ($1, $2, $3, $4, $5)',
    [userId, email, passwordHash, role, verificationToken]
  );

  sendVerificationEmail(email, verificationToken, userId)
    .then(() => console.log('📧 Verification email sent to:', email))
    .catch((err) => console.error('❌ Failed to send verification email to', email, ':', err.message));

  const name = fullName || 'New Candidate';
  const candidateSlug = slugify(name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  await db.query(
    `INSERT INTO candidates (id, user_id, full_name, visa_status, current_emirate, availability_status, profile_slug)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [uuidv4(), userId, name, 'OWN_VISA', 'DUBAI', 'IMMEDIATE', candidateSlug]
  );

  const accessToken = generateAccessToken({ id: userId, email, role });
  const refreshToken = generateRefreshToken({ id: userId });

  return { user: { id: userId, email, role }, accessToken, refreshToken };
};

export const registerEmployer = async (data: RegisterEmployerData) => {
  const { email, password, companyName } = data;

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const userId = uuidv4();
  const role = 'EMPLOYER';

  const verificationToken = crypto.randomBytes(32).toString('hex');

  await db.query(
    'INSERT INTO users (id, email, password_hash, role, verification_token) VALUES ($1, $2, $3, $4, $5)',
    [userId, email, passwordHash, role, verificationToken]
  );

  sendVerificationEmail(email, verificationToken, userId)
    .then(() => console.log('📧 Verification email sent to:', email))
    .catch((err) => console.error('❌ Failed to send verification email to', email, ':', err.message));

  const employerId = uuidv4();
  const companySlug = slugify(companyName, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  await db.query(
    'INSERT INTO employers (id, user_id, company_name, company_slug) VALUES ($1, $2, $3, $4)',
    [employerId, userId, companyName, companySlug]
  );

  // Always start with DEMO (free) plan — paid plans require Stripe checkout
  await db.query(
    `INSERT INTO subscriptions (id, employer_id, plan_type, status, contact_reveals_limit, contact_reveals_used, current_period_start, current_period_end)
     VALUES ($1, $2, 'DEMO', 'ACTIVE', 0, 0, NOW(), NOW() + INTERVAL '24 hours')`,
    [uuidv4(), employerId]
  );

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

  // Block unverified users from logging in
  if (!user.email_verified) {
    throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  return { user: { id: user.id, email: user.email, role: user.role, email_verified: user.email_verified }, accessToken, refreshToken };
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
    'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id, email, role',
    [token]
  );
  if (result.rows.length === 0) throw new Error('Invalid or expired verification token');

  const user = result.rows[0];
  // Return tokens so user can be auto-logged-in after verification
  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });
  return { id: user.id, email: user.email, role: user.role, accessToken, refreshToken };
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

export const resendVerificationByEmail = async (email: string) => {
  const user = await db.query('SELECT id, email, email_verified FROM users WHERE email = $1', [email]);
  if (user.rows.length === 0) {
    // Don't reveal whether the email exists
    return { message: 'If an account with that email exists, a verification email has been sent.' };
  }
  if (user.rows[0].email_verified) {
    return { message: 'If an account with that email exists, a verification email has been sent.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  await db.query('UPDATE users SET verification_token = $1 WHERE id = $2', [token, user.rows[0].id]);
  await sendVerificationEmail(user.rows[0].email, token, user.rows[0].id);
  return { message: 'If an account with that email exists, a verification email has been sent.' };
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

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('User not found');

  const isValid = await comparePassword(currentPassword, result.rows[0].password_hash);
  if (!isValid) throw new Error('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
  return { message: 'Password changed successfully' };
};

export const deleteAccount = async (userId: string, password: string) => {
  const result = await db.query('SELECT password_hash, role FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('User not found');

  const isValid = await comparePassword(password, result.rows[0].password_hash);
  if (!isValid) throw new Error('Password is incorrect');

  if (result.rows[0].role === 'ADMIN') throw new Error('Admin accounts cannot be self-deleted');

  // CASCADE will handle related records (candidates, employers, jobs, applications, etc.)
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
  return { message: 'Account deleted successfully' };
};
