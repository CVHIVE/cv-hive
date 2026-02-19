// ── Enums ──────────────────────────────────────────────
export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';

export type VisaStatus =
  | 'EMPLOYMENT_VISA'
  | 'OWN_VISA'
  | 'SPOUSE_VISA'
  | 'FREELANCE_PERMIT'
  | 'VISIT_VISA'
  | 'CANCELLED_VISA';

export type Emirate =
  | 'DUBAI'
  | 'ABU_DHABI'
  | 'SHARJAH'
  | 'AJMAN'
  | 'RAS_AL_KHAIMAH'
  | 'FUJAIRAH'
  | 'UMM_AL_QUWAIN';

export type AvailabilityStatus =
  | 'IMMEDIATE'
  | 'ONE_MONTH'
  | 'TWO_TO_THREE_MONTHS'
  | 'NOT_LOOKING';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP';
export type JobStatus = 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'PAUSED' | 'EXPIRED';

export type Industry =
  | 'Technology'
  | 'Finance & Banking'
  | 'Healthcare'
  | 'Construction & Engineering'
  | 'Hospitality & Tourism'
  | 'Education'
  | 'Marketing & Advertising'
  | 'Real Estate'
  | 'Oil & Gas'
  | 'Retail'
  | 'Legal'
  | 'HR & Recruitment'
  | 'Logistics & Supply Chain'
  | 'Media & Communications'
  | 'Government';

export type SubscriptionPlan = 'DEMO' | 'PROFESSIONAL' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';

// ── Models ─────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  role: UserRole;
  email_verified?: boolean;
  created_at?: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  email?: string;
  full_name: string;
  phone?: string;
  visa_status: VisaStatus;
  current_emirate: Emirate;
  job_title?: string;
  total_experience_years?: number;
  salary_min?: number;
  salary_max?: number;
  availability_status: AvailabilityStatus;
  cv_url?: string;
  cv_original_filename?: string;
  industry?: string;
  desired_job_titles?: string;
  preferred_emirate?: Emirate;
  education?: string;
  skills?: string;
  notice_period?: string;
  cv_visibility?: 'PUBLIC' | 'PRIVATE';
  profile_visible: boolean;
  profile_slug: string;
  completeness_score: number;
  created_at: string;
  updated_at: string;
}

export interface Employer {
  id: string;
  user_id: string;
  email?: string;
  company_name: string;
  industry?: string;
  response_rate?: number;
  reputation_score?: number;
  total_applications_received?: number;
  total_applications_responded?: number;
  created_at: string;
  updated_at: string;
}

// ── Auth ───────────────────────────────────────────────
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse extends User {
  candidate?: Candidate | null;
  employer?: Employer | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
}

export interface RegisterEmployerPayload {
  email: string;
  password: string;
  companyName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── Candidates ─────────────────────────────────────────
export interface UpdateCandidatePayload {
  fullName?: string;
  phone?: string;
  visaStatus?: VisaStatus;
  currentEmirate?: Emirate;
  jobTitle?: string;
  totalExperience?: number;
  salaryMin?: number;
  salaryMax?: number;
  availabilityStatus?: AvailabilityStatus;
  profileVisible?: boolean;
  industry?: string;
  desiredJobTitles?: string;
  preferredEmirate?: Emirate;
  education?: string;
  skills?: string;
  noticePeriod?: string;
  cvVisibility?: 'PUBLIC' | 'PRIVATE';
}

export interface RevealedContact {
  phone?: string;
  email?: string;
  cv_url?: string;
}

export interface CandidateSearchFilters {
  emirate?: Emirate;
  visaStatus?: VisaStatus;
  jobTitle?: string;
  availability?: AvailabilityStatus;
  industry?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  distance?: number;
  page?: number;
  limit?: number;
}

export interface CandidateSearchResult {
  id: string;
  full_name: string;
  job_title?: string;
  current_emirate: Emirate;
  visa_status: VisaStatus;
  total_experience_years?: number;
  availability_status: AvailabilityStatus;
  profile_slug: string;
}

export interface PaginatedCandidates {
  candidates: CandidateSearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Employers ──────────────────────────────────────────
export interface UpdateEmployerPayload {
  companyName?: string;
  industry?: string;
}

// ── Jobs ──────────────────────────────────────────────
export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  industry: string;
  job_type: JobType;
  emirate: Emirate;
  salary_min?: number;
  salary_max?: number;
  salary_hidden?: boolean;
  experience_min?: number;
  experience_max?: number;
  skills?: string;
  status: JobStatus;
  views_count: number;
  applications_count: number;
  company_name?: string;
  employer_email?: string;
  company_industry?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface JobSearchFilters {
  title?: string;
  industry?: string;
  emirate?: Emirate;
  jobType?: JobType;
  salaryMin?: number;
  experienceMax?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedJobs {
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JobApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  cover_letter?: string;
  applied_at: string;
  // From joins
  job_title?: string;
  emirate?: string;
  job_type?: string;
  job_status?: string;
  company_name?: string;
  full_name?: string;
  cv_url?: string;
  total_experience_years?: number;
  current_emirate?: string;
  visa_status?: string;
  email?: string;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  industry: string;
  jobType: JobType;
  emirate: Emirate;
  salaryMin?: number;
  salaryMax?: number;
  salaryHidden?: boolean;
  experienceMin?: number;
  experienceMax?: number;
  skills?: string;
  status?: JobStatus;
}
