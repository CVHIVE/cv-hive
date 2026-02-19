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
    DROP TABLE IF EXISTS bookmarked_candidates CASCADE;
    DROP TABLE IF EXISTS contact_reveals CASCADE;
    DROP TABLE IF EXISTS payment_methods CASCADE;
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
      cv_original_filename VARCHAR(255),
      industry VARCHAR(100),
      desired_job_titles TEXT,
      preferred_emirate VARCHAR(30),
      education VARCHAR(255),
      skills TEXT,
      notice_period VARCHAR(50),
      professional_summary TEXT,
      cv_visibility VARCHAR(20) DEFAULT 'PUBLIC',
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
      response_rate NUMERIC(5,2) DEFAULT 0,
      reputation_score NUMERIC(5,2) DEFAULT 0,
      total_applications_received INTEGER DEFAULT 0,
      total_applications_responded INTEGER DEFAULT 0,
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
      response_deadline TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
      responded_at TIMESTAMP,
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
      plan_type VARCHAR(20) DEFAULT 'DEMO',
      status VARCHAR(20) DEFAULT 'ACTIVE',
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      stripe_price_id VARCHAR(255),
      cancel_at_period_end BOOLEAN DEFAULT FALSE,
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      contact_reveals_limit INTEGER DEFAULT 0,
      contact_reveals_used INTEGER DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS payment_methods (
      id UUID PRIMARY KEY,
      employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
      card_brand VARCHAR(20) NOT NULL,
      card_last4 VARCHAR(4) NOT NULL,
      card_exp_month INTEGER NOT NULL,
      card_exp_year INTEGER NOT NULL,
      cardholder_name VARCHAR(255) NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      stripe_payment_method_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
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

    CREATE TABLE IF NOT EXISTS contact_reveals (
      id UUID PRIMARY KEY,
      employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
      candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      revealed_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(employer_id, candidate_id)
    );

    CREATE TABLE IF NOT EXISTS bookmarked_candidates (
      id UUID PRIMARY KEY,
      employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
      candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(employer_id, candidate_id)
    );

    CREATE TABLE IF NOT EXISTS saved_searches (
      id UUID PRIMARY KEY,
      candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      filters JSONB NOT NULL,
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
    { name: 'Fatima Hassan', title: 'Marketing Manager', emirate: 'ABU_DHABI', visa: 'EMPLOYMENT_VISA', exp: 6, min: 18000, max: 25000, avail: 'IMMEDIATE', phone: '+971502345678' },
    { name: 'Raj Patel', title: 'Financial Analyst', emirate: 'DUBAI', visa: 'OWN_VISA', exp: 4, min: 12000, max: 18000, avail: 'ONE_MONTH', phone: '+971503456789' },
    { name: 'Sara Al-Balushi', title: 'UX Designer', emirate: 'SHARJAH', visa: 'SPOUSE_VISA', exp: 5, min: 15000, max: 22000, avail: 'IMMEDIATE', phone: '+971504567890' },
    { name: 'Mohamed Ibrahim', title: 'Project Manager', emirate: 'DUBAI', visa: 'OWN_VISA', exp: 10, min: 30000, max: 40000, avail: 'TWO_TO_THREE_MONTHS', phone: '+971505678901' },
    { name: 'Priya Sharma', title: 'Data Scientist', emirate: 'DUBAI', visa: 'EMPLOYMENT_VISA', exp: 3, min: 20000, max: 28000, avail: 'IMMEDIATE', phone: '+971506789012' },
    { name: 'Omar Khalil', title: 'Civil Engineer', emirate: 'ABU_DHABI', visa: 'OWN_VISA', exp: 12, min: 22000, max: 32000, avail: 'ONE_MONTH', phone: '+971507890123' },
    { name: 'Layla Al-Maktoum', title: 'HR Specialist', emirate: 'AJMAN', visa: 'OWN_VISA', exp: 7, min: 14000, max: 20000, avail: 'IMMEDIATE', phone: '+971508901234' },
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
      `INSERT INTO candidates (id, user_id, full_name, phone, visa_status, current_emirate, job_title,
        total_experience_years, salary_min, salary_max, availability_status, profile_visible, profile_slug, completeness_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, $12, 70)
       ON CONFLICT (user_id) DO NOTHING`,
      [cid, uid, c.name, c.phone, c.visa, c.emirate, c.title, c.exp, c.min, c.max, c.avail, slug]
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

  // ── Demo Employer Subscription ────────────────────────
  await db.query(
    `INSERT INTO subscriptions (id, employer_id, plan_type, status, contact_reveals_limit, contact_reveals_used, current_period_start, current_period_end)
     VALUES ($1, $2, 'DEMO', 'ACTIVE', 0, 0, NOW(), NOW() + INTERVAL '24 hours')`,
    [uuidv4(), employerId]
  );

  // ── Sample Jobs ─────────────────────────────────────
  await db.query(`DELETE FROM jobs WHERE employer_id = $1`, [employerId]);

  // ── UAE Public Companies Directory ───────────────────
  const uaeCompanies = [
    // Technology
    { name: 'Careem', industry: 'Technology', desc: 'Leading ride-hailing and delivery super app operating across the Middle East, Africa, and South Asia.', website: 'https://www.careem.com', size: '1000+', year: 2012, location: 'Dubai, UAE' },
    { name: 'Noon', industry: 'Technology', desc: 'Homegrown e-commerce marketplace offering millions of products with same-day and next-day delivery across the UAE and Saudi Arabia.', website: 'https://www.noon.com', size: '1000+', year: 2017, location: 'Dubai, UAE' },
    { name: 'Souq.com', industry: 'Technology', desc: 'The largest e-commerce platform in the Arab world, now part of Amazon. Offers electronics, fashion, home goods and more.', website: 'https://www.amazon.ae', size: '1000+', year: 2005, location: 'Dubai, UAE' },
    { name: 'Dubizzle', industry: 'Technology', desc: 'Leading classifieds platform in the UAE for buying, selling, and finding jobs, property, vehicles, and services.', website: 'https://www.dubizzle.com', size: '500-1000', year: 2005, location: 'Dubai, UAE' },
    { name: 'Talabat', industry: 'Technology', desc: 'Online food ordering and delivery platform serving millions of customers across the UAE and the wider Middle East.', website: 'https://www.talabat.com', size: '1000+', year: 2004, location: 'Dubai, UAE' },
    { name: 'Kitopi', industry: 'Technology', desc: 'Cloud kitchen platform that partners with restaurants and food brands to optimize delivery operations using technology.', website: 'https://www.kitopi.com', size: '1000+', year: 2018, location: 'Dubai, UAE' },
    { name: 'Fetchr', industry: 'Technology', desc: 'Technology-driven logistics company using GPS-based delivery to solve last-mile challenges in the Middle East.', website: 'https://www.fetchr.us', size: '200-500', year: 2012, location: 'Dubai, UAE' },
    { name: 'Sarwa', industry: 'Finance & Banking', desc: 'Digital wealth management platform offering automated investing, trading, and crypto services regulated by DFSA.', website: 'https://www.sarwa.co', size: '50-200', year: 2017, location: 'Dubai, UAE' },
    { name: 'Bayzat', industry: 'Technology', desc: 'HR and insurance technology platform automating payroll, employee benefits, and health insurance for companies in the UAE.', website: 'https://www.bayzat.com', size: '200-500', year: 2013, location: 'Dubai, UAE' },
    { name: 'Property Finder', industry: 'Real Estate', desc: 'Leading real estate portal in the UAE and Middle East, connecting buyers, renters, and investors with property listings.', website: 'https://www.propertyfinder.ae', size: '500-1000', year: 2007, location: 'Dubai, UAE' },
    { name: 'Bayut', industry: 'Real Estate', desc: 'One of the top property search platforms in the UAE, offering listings for apartments, villas, offices, and commercial spaces.', website: 'https://www.bayut.com', size: '500-1000', year: 2008, location: 'Dubai, UAE' },

    // Airlines & Aviation
    { name: 'Emirates', industry: 'Logistics & Supply Chain', desc: 'Award-winning international airline based in Dubai, connecting passengers to over 150 destinations across 80+ countries.', website: 'https://www.emirates.com', size: '1000+', year: 1985, location: 'Dubai, UAE' },
    { name: 'Etihad Airways', industry: 'Logistics & Supply Chain', desc: 'National airline of the UAE based in Abu Dhabi, flying to over 120 passenger and cargo destinations worldwide.', website: 'https://www.etihad.com', size: '1000+', year: 2003, location: 'Abu Dhabi, UAE' },
    { name: 'flydubai', industry: 'Logistics & Supply Chain', desc: 'Dubai-based low-cost carrier offering affordable flights across the Middle East, Africa, Asia, and Europe.', website: 'https://www.flydubai.com', size: '1000+', year: 2008, location: 'Dubai, UAE' },
    { name: 'Air Arabia', industry: 'Logistics & Supply Chain', desc: 'First and largest low-cost carrier in the Middle East and North Africa, based in Sharjah International Airport.', website: 'https://www.airarabia.com', size: '1000+', year: 2003, location: 'Sharjah, UAE' },

    // Banking & Finance
    { name: 'Emirates NBD', industry: 'Finance & Banking', desc: 'One of the largest banking groups in the Middle East, offering retail, corporate, and investment banking services.', website: 'https://www.emiratesnbd.com', size: '1000+', year: 2007, location: 'Dubai, UAE' },
    { name: 'First Abu Dhabi Bank', industry: 'Finance & Banking', desc: 'The largest bank in the UAE by total assets, providing personal, business, and private banking services.', website: 'https://www.bankfab.com', size: '1000+', year: 2017, location: 'Abu Dhabi, UAE' },
    { name: 'Dubai Islamic Bank', industry: 'Finance & Banking', desc: 'The first full-fledged Islamic bank in the world, offering Shariah-compliant banking products and services.', website: 'https://www.dib.ae', size: '1000+', year: 1975, location: 'Dubai, UAE' },
    { name: 'Mashreq Bank', industry: 'Finance & Banking', desc: 'One of the leading financial institutions in the UAE, providing innovative banking solutions for individuals and businesses.', website: 'https://www.mashreqbank.com', size: '1000+', year: 1967, location: 'Dubai, UAE' },
    { name: 'Abu Dhabi Commercial Bank', industry: 'Finance & Banking', desc: 'Major bank in the UAE offering a wide range of consumer and wholesale banking products and services.', website: 'https://www.adcb.com', size: '1000+', year: 1985, location: 'Abu Dhabi, UAE' },
    { name: 'RAKBANK', industry: 'Finance & Banking', desc: 'National Bank of Ras Al Khaimah offering personal and business banking, credit cards, and financing solutions.', website: 'https://www.rakbank.ae', size: '1000+', year: 1976, location: 'Ras Al Khaimah, UAE' },

    // Telecom
    { name: 'Etisalat (e&)', industry: 'Technology', desc: 'One of the largest telecommunications companies in the world, providing mobile, broadband, and enterprise digital services.', website: 'https://www.etisalat.ae', size: '1000+', year: 1976, location: 'Abu Dhabi, UAE' },
    { name: 'du (EITC)', industry: 'Technology', desc: 'Integrated telecom operator offering mobile, fixed-line, broadband, and IPTV services across the UAE.', website: 'https://www.du.ae', size: '1000+', year: 2005, location: 'Dubai, UAE' },

    // Real Estate & Construction
    { name: 'Emaar Properties', industry: 'Real Estate', desc: 'Global property developer behind iconic projects including Burj Khalifa, Dubai Mall, and Dubai Marina.', website: 'https://www.emaar.com', size: '1000+', year: 1997, location: 'Dubai, UAE' },
    { name: 'DAMAC Properties', industry: 'Real Estate', desc: 'Luxury real estate developer delivering residential, commercial, and leisure properties across the Middle East.', website: 'https://www.damacproperties.com', size: '1000+', year: 2002, location: 'Dubai, UAE' },
    { name: 'Aldar Properties', industry: 'Real Estate', desc: 'Abu Dhabi\'s leading real estate developer and manager, delivering iconic destinations like Yas Island and Saadiyat Island.', website: 'https://www.aldar.com', size: '1000+', year: 2004, location: 'Abu Dhabi, UAE' },
    { name: 'Nakheel', industry: 'Real Estate', desc: 'World-renowned developer behind Palm Jumeirah, The World Islands, and other landmark projects in Dubai.', website: 'https://www.nakheel.com', size: '1000+', year: 2000, location: 'Dubai, UAE' },
    { name: 'Meraas', industry: 'Real Estate', desc: 'Dubai-based holding company creating world-class destinations including City Walk, Bluewaters, and La Mer.', website: 'https://www.meraas.com', size: '1000+', year: 2007, location: 'Dubai, UAE' },
    { name: 'Sobha Realty', industry: 'Real Estate', desc: 'Premium real estate developer known for luxury villas and apartments with backward integration in construction.', website: 'https://www.sobharealty.com', size: '1000+', year: 1976, location: 'Dubai, UAE' },
    { name: 'Azizi Developments', industry: 'Real Estate', desc: 'Private developer delivering affordable luxury residential and commercial properties across Dubai.', website: 'https://www.azizidevelopments.com', size: '500-1000', year: 2007, location: 'Dubai, UAE' },
    { name: 'Arabtec Holding', industry: 'Construction & Engineering', desc: 'One of the largest construction companies in the Middle East, involved in major infrastructure and building projects.', website: 'https://www.arabtecholding.com', size: '1000+', year: 1975, location: 'Dubai, UAE' },

    // Hospitality & Tourism
    { name: 'Jumeirah Group', industry: 'Hospitality & Tourism', desc: 'Luxury hospitality company operating iconic hotels including Burj Al Arab, Jumeirah Beach Hotel, and Madinat Jumeirah.', website: 'https://www.jumeirah.com', size: '1000+', year: 1997, location: 'Dubai, UAE' },
    { name: 'Rotana Hotels', industry: 'Hospitality & Tourism', desc: 'Leading hotel management company in the Middle East and Africa, managing over 100 properties across the region.', website: 'https://www.rotana.com', size: '1000+', year: 1992, location: 'Abu Dhabi, UAE' },
    { name: 'Majid Al Futtaim', industry: 'Retail', desc: 'Major lifestyle conglomerate operating shopping malls (Mall of the Emirates), retail (Carrefour), and entertainment venues.', website: 'https://www.majidalfuttaim.com', size: '1000+', year: 1992, location: 'Dubai, UAE' },
    { name: 'Al Habtoor Group', industry: 'Hospitality & Tourism', desc: 'Diversified conglomerate with interests in hospitality, automotive, real estate, education, and publishing.', website: 'https://www.alhabtoor.com', size: '1000+', year: 1970, location: 'Dubai, UAE' },
    { name: 'Atlantis The Royal', industry: 'Hospitality & Tourism', desc: 'Ultra-luxury resort and entertainment destination on Palm Jumeirah featuring world-class dining and experiences.', website: 'https://www.atlantis.com', size: '1000+', year: 2023, location: 'Dubai, UAE' },

    // Oil & Gas / Energy
    { name: 'ADNOC', industry: 'Oil & Gas', desc: 'Abu Dhabi National Oil Company, one of the world\'s leading energy producers responsible for the UAE\'s oil and gas operations.', website: 'https://www.adnoc.ae', size: '1000+', year: 1971, location: 'Abu Dhabi, UAE' },
    { name: 'ENOC', industry: 'Oil & Gas', desc: 'Emirates National Oil Company, a fully integrated energy player operating fuel retail, lubricants, aviation, and terminals.', website: 'https://www.enoc.com', size: '1000+', year: 1993, location: 'Dubai, UAE' },
    { name: 'Masdar', industry: 'Oil & Gas', desc: 'Abu Dhabi\'s clean energy company driving the deployment of renewable energy and sustainable urban development globally.', website: 'https://www.masdar.ae', size: '500-1000', year: 2006, location: 'Abu Dhabi, UAE' },
    { name: 'DEWA', industry: 'Government', desc: 'Dubai Electricity and Water Authority, providing electricity and water services to over 1 million customers in Dubai.', website: 'https://www.dewa.gov.ae', size: '1000+', year: 1992, location: 'Dubai, UAE' },

    // Retail & FMCG
    { name: 'Al Futtaim Group', industry: 'Retail', desc: 'Diversified business conglomerate with operations in automotive (Toyota, Honda), retail (IKEA, Zara), and real estate.', website: 'https://www.alfuttaim.com', size: '1000+', year: 1930, location: 'Dubai, UAE' },
    { name: 'Chalhoub Group', industry: 'Retail', desc: 'Leading luxury goods retailer in the Middle East, partnering with top fashion and beauty brands like Louis Vuitton and Sephora.', website: 'https://www.chalhoubgroup.com', size: '1000+', year: 1955, location: 'Dubai, UAE' },
    { name: 'Apparel Group', industry: 'Retail', desc: 'Global fashion and lifestyle retail conglomerate managing brands like Tommy Hilfiger, Calvin Klein, and Tim Hortons in the region.', website: 'https://www.apparelgroup.com', size: '1000+', year: 1999, location: 'Dubai, UAE' },
    { name: 'Landmark Group', industry: 'Retail', desc: 'One of the largest retail and hospitality conglomerates in the Middle East, operating brands like Centrepoint and Home Centre.', website: 'https://www.landmarkgroup.com', size: '1000+', year: 1973, location: 'Dubai, UAE' },
    { name: 'Lulu Group', industry: 'Retail', desc: 'Multinational conglomerate operating hypermarkets, shopping malls, and import-export businesses across the Middle East and Asia.', website: 'https://www.lulugroupinternational.com', size: '1000+', year: 2000, location: 'Abu Dhabi, UAE' },
    { name: 'Choithrams', industry: 'Retail', desc: 'Established supermarket chain in the UAE offering groceries, fresh produce, and household essentials across multiple locations.', website: 'https://www.choithrams.com', size: '1000+', year: 1974, location: 'Dubai, UAE' },

    // Healthcare
    { name: 'Mediclinic Middle East', industry: 'Healthcare', desc: 'Leading private healthcare provider operating hospitals, clinics, and day surgery centers across Abu Dhabi and Dubai.', website: 'https://www.mediclinic.ae', size: '1000+', year: 2007, location: 'Dubai, UAE' },
    { name: 'NMC Health', industry: 'Healthcare', desc: 'One of the largest private healthcare operators in the UAE, running hospitals, pharmacies, and specialty clinics.', website: 'https://www.nmchealth.com', size: '1000+', year: 1975, location: 'Abu Dhabi, UAE' },
    { name: 'Aster DM Healthcare', industry: 'Healthcare', desc: 'Integrated healthcare provider operating hospitals, clinics, and pharmacies across the UAE, GCC, and India.', website: 'https://www.asterdmhealthcare.com', size: '1000+', year: 1987, location: 'Dubai, UAE' },
    { name: 'Cleveland Clinic Abu Dhabi', industry: 'Healthcare', desc: 'Multispecialty hospital on Al Maryah Island providing world-class patient care as an extension of Cleveland Clinic in the US.', website: 'https://www.clevelandclinicabudhabi.ae', size: '1000+', year: 2015, location: 'Abu Dhabi, UAE' },

    // Education
    { name: 'GEMS Education', industry: 'Education', desc: 'Largest private K-12 education provider in the world, operating over 60 schools across the UAE with diverse curricula.', website: 'https://www.gemseducation.com', size: '1000+', year: 1959, location: 'Dubai, UAE' },
    { name: 'Taaleem', industry: 'Education', desc: 'Premium education provider operating schools across Dubai and Abu Dhabi delivering British, American, and IB curricula.', website: 'https://www.taaleem.ae', size: '500-1000', year: 2004, location: 'Dubai, UAE' },

    // Logistics & Ports
    { name: 'DP World', industry: 'Logistics & Supply Chain', desc: 'Global port operator and logistics company managing marine and inland terminals, maritime services, and free zones.', website: 'https://www.dpworld.com', size: '1000+', year: 2005, location: 'Dubai, UAE' },
    { name: 'Aramex', industry: 'Logistics & Supply Chain', desc: 'Global logistics and transportation solutions company offering express delivery, freight forwarding, and e-commerce solutions.', website: 'https://www.aramex.com', size: '1000+', year: 1982, location: 'Dubai, UAE' },

    // Government & Semi-Government
    { name: 'Dubai Holding', industry: 'Government', desc: 'Global investment holding company managing a diverse portfolio including real estate, hospitality, media, and technology.', website: 'https://www.dubaiholding.com', size: '1000+', year: 2004, location: 'Dubai, UAE' },
    { name: 'Mubadala Investment Company', industry: 'Finance & Banking', desc: 'Abu Dhabi sovereign investor managing a global portfolio in aerospace, ICT, healthcare, metals, and real estate.', website: 'https://www.mubadala.com', size: '1000+', year: 2002, location: 'Abu Dhabi, UAE' },
    { name: 'Abu Dhabi Investment Authority', industry: 'Finance & Banking', desc: 'One of the world\'s largest sovereign wealth funds investing globally across multiple asset classes for long-term value.', website: 'https://www.adia.ae', size: '1000+', year: 1976, location: 'Abu Dhabi, UAE' },
    { name: 'Investment Corporation of Dubai', industry: 'Finance & Banking', desc: 'Principal investment arm of the Government of Dubai managing a diversified portfolio of commercial enterprises.', website: 'https://www.icd.gov.ae', size: '500-1000', year: 2006, location: 'Dubai, UAE' },
    { name: 'Dubai Multi Commodities Centre', industry: 'Government', desc: 'Free zone authority and commodity exchange center, home to over 20,000 businesses in the Jumeirah Lakes Towers district.', website: 'https://www.dmcc.ae', size: '500-1000', year: 2002, location: 'Dubai, UAE' },

    // Automotive
    { name: 'Al Tayer Group', industry: 'Retail', desc: 'Leading UAE conglomerate in luxury automotive (Ford, Lincoln, Ferrari, Maserati), fashion, and engineering services.', website: 'https://www.altayer.com', size: '1000+', year: 1979, location: 'Dubai, UAE' },
    { name: 'Al Nabooda Automobiles', industry: 'Retail', desc: 'Official dealer for Audi, Porsche, and Volkswagen in Dubai, offering sales, after-sales, and parts services.', website: 'https://www.alnabooda.com', size: '500-1000', year: 1966, location: 'Dubai, UAE' },
    { name: 'Arabian Automobiles', industry: 'Retail', desc: 'Flagship company of the AW Rostamani Group serving as the exclusive dealer for Nissan, INFINITI, and Renault in Dubai.', website: 'https://www.arabianauto.com', size: '1000+', year: 1968, location: 'Dubai, UAE' },

    // Media & Entertainment
    { name: 'MBC Group', industry: 'Media & Communications', desc: 'Largest media company in the Middle East and North Africa, broadcasting free-to-air TV channels, streaming, and content production.', website: 'https://www.mbc.net', size: '1000+', year: 1991, location: 'Dubai, UAE' },
    { name: 'twofour54', industry: 'Media & Communications', desc: 'Abu Dhabi\'s media free zone enabling Arabic content creation, providing facilities, training, and business support for media companies.', website: 'https://www.twofour54.com', size: '200-500', year: 2008, location: 'Abu Dhabi, UAE' },

    // Food & Beverage
    { name: 'Al Islami Foods', industry: 'Retail', desc: 'Leading halal food brand in the UAE offering frozen meats, poultry, seafood, and ready-to-eat meals across the region.', website: 'https://www.alislamifoods.com', size: '500-1000', year: 1981, location: 'Dubai, UAE' },
    { name: 'Agthia Group', industry: 'Retail', desc: 'Leading food and beverage company in the UAE, producing Al Ain Water, Grand Mills flour, and other consumer products.', website: 'https://www.agthia.com', size: '1000+', year: 2004, location: 'Abu Dhabi, UAE' },

    // Consulting & Professional Services
    { name: 'Caspian', industry: 'HR & Recruitment', desc: 'Executive search and recruitment firm specializing in placing senior professionals across the Middle East and emerging markets.', website: 'https://www.caspianone.com', size: '50-200', year: 2011, location: 'Dubai, UAE' },
    { name: 'Michael Page Middle East', industry: 'HR & Recruitment', desc: 'Leading specialist recruitment firm operating across the UAE, placing professionals in finance, tech, engineering, and more.', website: 'https://www.michaelpage.ae', size: '200-500', year: 2006, location: 'Dubai, UAE' },

    // Free Zones
    { name: 'DIFC', industry: 'Finance & Banking', desc: 'Dubai International Financial Centre, a leading financial hub hosting banks, insurance firms, and wealth management companies.', website: 'https://www.difc.ae', size: '500-1000', year: 2004, location: 'Dubai, UAE' },
    { name: 'Jebel Ali Free Zone (JAFZA)', industry: 'Logistics & Supply Chain', desc: 'One of the world\'s largest free trade zones, home to over 8,000 companies involved in trading, logistics, and manufacturing.', website: 'https://www.jafza.ae', size: '1000+', year: 1985, location: 'Dubai, UAE' },
  ];

  for (const c of uaeCompanies) {
    const uid = uuidv4();
    const eid = uuidv4();
    const slug = slugify(c.name, { lower: true, strict: true });
    const email = slug.replace(/-/g, '.') + '@company.placeholder';
    const domain = new URL(c.website).hostname.replace(/^www\./, '');
    const logoUrl = `https://logo.clearbit.com/${domain}`;

    await db.query(
      `INSERT INTO users (id, email, password_hash, role, email_verified) VALUES ($1, $2, $3, 'EMPLOYER', TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [uid, email, password]
    );
    await db.query(
      `INSERT INTO employers (id, user_id, company_name, industry, company_slug, description, website, company_size, founded_year, location, company_logo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (user_id) DO NOTHING`,
      [eid, uid, c.name, c.industry, slug, c.desc, c.website, c.size, c.year, c.location, logoUrl]
    );
  }

  console.log(`  + ${uaeCompanies.length} UAE companies directory`);


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
