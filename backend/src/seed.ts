import dotenv from 'dotenv';
dotenv.config();

import db from './config/database';
import { hashPassword } from './utils/password';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

async function seed() {
  console.log('Seeding database...');

  // ── Create tables ────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE',
      email_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      reset_token VARCHAR(255),
      reset_token_expiry TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id UUID PRIMARY KEY,
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      visa_status VARCHAR(30) DEFAULT 'OWN_VISA',
      current_emirate VARCHAR(30) DEFAULT 'DUBAI',
      job_title VARCHAR(255),
      total_experience_years INTEGER,
      salary_min INTEGER,
      salary_max INTEGER,
      availability_status VARCHAR(30) DEFAULT 'IMMEDIATE',
      cv_url VARCHAR(500),
      profile_visible BOOLEAN DEFAULT TRUE,
      profile_slug VARCHAR(255) UNIQUE,
      completeness_score INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS employers (
      id UUID PRIMARY KEY,
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_name VARCHAR(255) NOT NULL,
      industry VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY,
      employer_id UUID UNIQUE NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
      plan_type VARCHAR(20) DEFAULT 'BASIC',
      status VARCHAR(20) DEFAULT 'ACTIVE',
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      cv_downloads_limit INTEGER DEFAULT 10,
      cv_downloads_used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Tables created.');

  // ── Clear existing demo data ─────────────────────────
  await db.query(`DELETE FROM users WHERE email IN ('candidate@demo.com', 'employer@demo.com', 'admin@cvhive.ae')`);

  const password = await hashPassword('demo1234');

  // ── Demo Candidate ───────────────────────────────────
  const candidateUserId = uuidv4();
  const candidateId = uuidv4();
  const candidateSlug = slugify('Ahmed Al-Mansoori', { lower: true, strict: true }) + '-demo';

  await db.query(
    `INSERT INTO users (id, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, TRUE)`,
    [candidateUserId, 'candidate@demo.com', password, 'CANDIDATE']
  );
  await db.query(
    `INSERT INTO candidates (id, user_id, full_name, phone, visa_status, current_emirate, job_title,
      total_experience_years, salary_min, salary_max, availability_status, profile_visible, profile_slug, completeness_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [candidateId, candidateUserId, 'Ahmed Al-Mansoori', '+971501234567', 'OWN_VISA', 'DUBAI',
     'Senior Software Engineer', 8, 25000, 35000, 'IMMEDIATE', true, candidateSlug, 85]
  );

  // ── Extra candidate profiles for search results ──────
  const extraCandidates = [
    { name: 'Fatima Hassan', title: 'Marketing Manager', emirate: 'ABU_DHABI', visa: 'EMPLOYMENT_VISA', exp: 6, min: 18000, max: 25000, avail: 'IMMEDIATE' },
    { name: 'Raj Patel', title: 'Financial Analyst', emirate: 'DUBAI', visa: 'OWN_VISA', exp: 4, min: 12000, max: 18000, avail: 'ONE_MONTH' },
    { name: 'Sara Al-Balushi', title: 'UX Designer', emirate: 'SHARJAH', visa: 'SPOUSE_VISA', exp: 5, min: 15000, max: 22000, avail: 'IMMEDIATE' },
    { name: 'Mohamed Ibrahim', title: 'Project Manager', emirate: 'DUBAI', visa: 'OWN_VISA', exp: 10, min: 30000, max: 40000, avail: 'TWO_TO_THREE_MONTHS' },
    { name: 'Priya Sharma', title: 'Data Scientist', emirate: 'DUBAI', visa: 'EMPLOYMENT_VISA', exp: 3, min: 20000, max: 28000, avail: 'IMMEDIATE' },
    { name: 'Omar Khalil', title: 'Civil Engineer', emirate: 'ABU_DHABI', visa: 'OWN_VISA', exp: 12, min: 22000, max: 32000, avail: 'ONE_MONTH' },
    { name: 'Layla Al-Maktoum', title: 'HR Specialist', emirate: 'AJMAN', visa: 'OWN_VISA', exp: 7, min: 14000, max: 20000, avail: 'IMMEDIATE' },
  ];

  for (const c of extraCandidates) {
    const uid = uuidv4();
    const cid = uuidv4();
    const email = c.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') + '@demo.com';
    const slug = slugify(c.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);

    await db.query(
      `INSERT INTO users (id, email, password_hash, role, email_verified) VALUES ($1, $2, $3, 'CANDIDATE', TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [uid, email, password]
    );
    await db.query(
      `INSERT INTO candidates (id, user_id, full_name, visa_status, current_emirate, job_title,
        total_experience_years, salary_min, salary_max, availability_status, profile_visible, profile_slug, completeness_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11, 70)
       ON CONFLICT (user_id) DO NOTHING`,
      [cid, uid, c.name, c.visa, c.emirate, c.title, c.exp, c.min, c.max, c.avail, slug]
    );
  }

  // ── Demo Employer ────────────────────────────────────
  const employerUserId = uuidv4();
  const employerId = uuidv4();

  await db.query(
    `INSERT INTO users (id, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, TRUE)`,
    [employerUserId, 'employer@demo.com', password, 'EMPLOYER']
  );
  await db.query(
    `INSERT INTO employers (id, user_id, company_name, industry) VALUES ($1, $2, $3, $4)`,
    [employerId, employerUserId, 'TechHub UAE', 'Technology']
  );

  // ── Demo Admin ───────────────────────────────────────
  const adminUserId = uuidv4();

  await db.query(
    `INSERT INTO users (id, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, TRUE)`,
    [adminUserId, 'admin@cvhive.ae', password, 'ADMIN']
  );

  console.log('');
  console.log('===================================');
  console.log('  Demo accounts seeded:');
  console.log('===================================');
  console.log('  Candidate:  candidate@demo.com / demo1234');
  console.log('  Employer:   employer@demo.com  / demo1234');
  console.log('  Admin:      admin@cvhive.ae    / demo1234');
  console.log('===================================');
  console.log(`  + ${extraCandidates.length} extra candidate profiles`);
  console.log('');

  await db.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
