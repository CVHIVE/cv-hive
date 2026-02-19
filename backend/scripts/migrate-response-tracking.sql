-- Migration: Add response tracking, auto-pause support, and reputation scoring
-- Run this against an existing database to add the new features

-- Add response tracking columns to job_applications
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days');
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;

-- Set response_deadline for existing pending applications
UPDATE job_applications SET response_deadline = applied_at + INTERVAL '7 days' WHERE response_deadline IS NULL;

-- Add employer response metrics
ALTER TABLE employers ADD COLUMN IF NOT EXISTS response_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS reputation_score NUMERIC(5,2) DEFAULT 0;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS total_applications_received INTEGER DEFAULT 0;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS total_applications_responded INTEGER DEFAULT 0;

-- Backfill employer metrics from existing data
UPDATE employers e SET
  total_applications_received = (
    SELECT COUNT(*) FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    WHERE j.employer_id = e.id
  ),
  total_applications_responded = (
    SELECT COUNT(*) FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    WHERE j.employer_id = e.id AND ja.status != 'PENDING'
  );

UPDATE employers SET
  response_rate = CASE
    WHEN total_applications_received > 0
    THEN (total_applications_responded::NUMERIC / total_applications_received::NUMERIC) * 100
    ELSE 0
  END;
