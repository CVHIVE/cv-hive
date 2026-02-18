import dotenv from 'dotenv';
dotenv.config();

import db from './config/database';
import { hashPassword } from './utils/password';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

async function seed() {
  console.log('Seeding database...');

  // ── Drop existing tables (dev only) ─────────────────
  await db.query(`
    DROP TABLE IF EXISTS analytics_events CASCADE;
    DROP TABLE IF EXISTS email_logs CASCADE;
    DROP TABLE IF EXISTS job_alerts CASCADE;
    DROP TABLE IF EXISTS application_status_history CASCADE;
    DROP TABLE IF EXISTS saved_jobs CASCADE;
    DROP TABLE IF EXISTS job_applications CASCADE;
    DROP TABLE IF EXISTS jobs CASCADE;
    DROP TABLE IF EXISTS subscriptions CASCADE;
    DROP TABLE IF EXISTS candidates CASCADE;
    DROP TABLE IF EXISTS employers CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
  console.log('Old tables dropped.');

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
      company_logo_url VARCHAR(500),
      company_slug VARCHAR(255) UNIQUE,
      description TEXT,
      website VARCHAR(500),
      company_size VARCHAR(50),
      founded_year INTEGER,
      location VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY,
      employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      industry VARCHAR(100),
      job_type VARCHAR(30) DEFAULT 'FULL_TIME',
      emirate VARCHAR(30) DEFAULT 'DUBAI',
      salary_min INTEGER,
      salary_max INTEGER,
      salary_hidden BOOLEAN DEFAULT FALSE,
      experience_min INTEGER,
      experience_max INTEGER,
      skills TEXT,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      views_count INTEGER DEFAULT 0,
      applications_count INTEGER DEFAULT 0,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS job_applications (
      id UUID PRIMARY KEY,
      job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'PENDING',
      cover_letter TEXT,
      applied_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(job_id, candidate_id)
    );

    CREATE TABLE IF NOT EXISTS saved_jobs (
      id UUID PRIMARY KEY,
      job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      saved_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(job_id, candidate_id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY,
      employer_id UUID UNIQUE NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
      plan_type VARCHAR(20) DEFAULT 'BASIC',
      status VARCHAR(20) DEFAULT 'ACTIVE',
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      stripe_price_id VARCHAR(255),
      cancel_at_period_end BOOLEAN DEFAULT FALSE,
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      cv_downloads_limit INTEGER DEFAULT 10,
      cv_downloads_used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS application_status_history (
      id UUID PRIMARY KEY,
      application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
      old_status VARCHAR(20),
      new_status VARCHAR(20) NOT NULL,
      changed_by UUID REFERENCES users(id),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS job_alerts (
      id UUID PRIMARY KEY,
      candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      title VARCHAR(255),
      industry VARCHAR(100),
      job_type VARCHAR(30),
      emirate VARCHAR(30),
      salary_min INTEGER,
      frequency VARCHAR(20) DEFAULT 'WEEKLY',
      is_active BOOLEAN DEFAULT TRUE,
      last_sent_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      email_type VARCHAR(50) NOT NULL,
      recipient_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      status VARCHAR(20) DEFAULT 'SENT',
      error_message TEXT,
      sent_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id UUID PRIMARY KEY,
      employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
      job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
      event_type VARCHAR(50) NOT NULL,
      candidate_id UUID REFERENCES candidates(id),
      metadata JSONB,
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
    `INSERT INTO employers (id, user_id, company_name, industry, company_slug, description, website, company_size, founded_year, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [employerId, employerUserId, 'TechHub UAE', 'Technology', 'techhub-uae',
     'Leading technology company in the UAE specializing in innovative software solutions and digital transformation.',
     'https://techhub.ae', '50-200', 2019, 'Dubai, UAE']
  );

  // ── Sample Jobs ─────────────────────────────────────
  await db.query(`DELETE FROM jobs WHERE employer_id = $1`, [employerId]);

  const sampleJobs = [
    { title: 'Senior Software Engineer', desc: 'We are looking for an experienced software engineer to join our growing team in Dubai. You will work on cutting-edge web applications using React, Node.js, and cloud technologies. Must have 5+ years of experience.', industry: 'Technology', type: 'FULL_TIME', emirate: 'DUBAI', sMin: 25000, sMax: 40000, eMin: 5, eMax: 10, skills: 'React,Node.js,TypeScript,AWS' },
    { title: 'Marketing Manager', desc: 'Lead our marketing team and drive brand awareness across the UAE market. You will develop and execute marketing strategies, manage campaigns, and analyze performance metrics.', industry: 'Marketing & Advertising', type: 'FULL_TIME', emirate: 'DUBAI', sMin: 18000, sMax: 28000, eMin: 4, eMax: 8, skills: 'Digital Marketing,SEO,Social Media,Analytics' },
    { title: 'Financial Analyst', desc: 'Join our finance team to provide data-driven insights and support strategic decision-making. Strong Excel and financial modeling skills required.', industry: 'Finance & Banking', type: 'FULL_TIME', emirate: 'ABU_DHABI', sMin: 15000, sMax: 25000, eMin: 3, eMax: 6, skills: 'Financial Modeling,Excel,SAP,PowerBI' },
    { title: 'UX/UI Designer', desc: 'Design beautiful and intuitive user interfaces for our mobile and web applications. Must have a strong portfolio demonstrating user-centered design principles.', industry: 'Technology', type: 'CONTRACT', emirate: 'DUBAI', sMin: 20000, sMax: 30000, eMin: 3, eMax: 7, skills: 'Figma,Adobe XD,Prototyping,User Research' },
    { title: 'Civil Engineer', desc: 'Oversee construction projects across Abu Dhabi. Must have experience with infrastructure projects and knowledge of UAE building regulations.', industry: 'Construction & Engineering', type: 'FULL_TIME', emirate: 'ABU_DHABI', sMin: 22000, sMax: 35000, eMin: 5, eMax: 12, skills: 'AutoCAD,Project Management,Structural Design' },
    { title: 'HR Coordinator', desc: 'Support the HR department with recruitment, onboarding, and employee relations. Great opportunity for someone starting their HR career.', industry: 'HR & Recruitment', type: 'FULL_TIME', emirate: 'SHARJAH', sMin: 8000, sMax: 14000, eMin: 1, eMax: 3, skills: 'Recruitment,HRIS,Employee Relations' },
    { title: 'Data Scientist Intern', desc: 'Join our data team as an intern. Work on real-world machine learning projects and gain hands-on experience with Python and data analytics tools.', industry: 'Technology', type: 'INTERNSHIP', emirate: 'DUBAI', sMin: 4000, sMax: 7000, eMin: 0, eMax: 1, skills: 'Python,Machine Learning,SQL,Pandas' },
    { title: 'Part-time Graphic Designer', desc: 'Create visual content for social media, marketing materials, and brand assets. Flexible hours, 20 hours per week.', industry: 'Media & Communications', type: 'PART_TIME', emirate: 'DUBAI', sMin: 6000, sMax: 10000, eMin: 2, eMax: 5, skills: 'Photoshop,Illustrator,InDesign,Canva' },
    { title: 'Freelance Web Developer', desc: 'Build and maintain websites for our clients. Must be proficient in modern web technologies and able to work independently on multiple projects.', industry: 'Technology', type: 'FREELANCE', emirate: 'AJMAN', sMin: 15000, sMax: 25000, eMin: 3, eMax: 8, skills: 'HTML,CSS,JavaScript,WordPress,React' },
    { title: 'Hotel Operations Manager', desc: 'Manage day-to-day operations of a 5-star hotel in Dubai. Must have hospitality management experience and excellent leadership skills.', industry: 'Hospitality & Tourism', type: 'FULL_TIME', emirate: 'DUBAI', sMin: 20000, sMax: 32000, eMin: 6, eMax: 12, skills: 'Hospitality Management,Leadership,Customer Service,Opera PMS' },
  ];

  for (const j of sampleJobs) {
    await db.query(
      `INSERT INTO jobs (id, employer_id, title, description, industry, job_type, emirate,
        salary_min, salary_max, experience_min, experience_max, skills, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ACTIVE', NOW() + INTERVAL '28 days')`,
      [uuidv4(), employerId, j.title, j.desc, j.industry, j.type, j.emirate,
       j.sMin, j.sMax, j.eMin, j.eMax, j.skills]
    );
  }

  // ── Demo Admin ───────────────────────────────────────
  const adminUserId = uuidv4();
  const adminPassword = await hashPassword('Catsaymeow2');

  await db.query(
    `INSERT INTO users (id, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, TRUE)`,
    [adminUserId, 'admin@cvhive.ae', adminPassword, 'ADMIN']
  );

  console.log('');
  console.log('===================================');
  console.log('  Demo accounts seeded:');
  console.log('===================================');
  console.log('  Candidate:  candidate@demo.com / demo1234');
  console.log('  Employer:   employer@demo.com  / demo1234');
  console.log('  Admin:      admin@cvhive.ae    / Catsaymeow2');
  console.log('===================================');
  console.log(`  + ${extraCandidates.length} extra candidate profiles`);
  console.log(`  + ${sampleJobs.length} sample jobs`);
  console.log('');

  await db.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
