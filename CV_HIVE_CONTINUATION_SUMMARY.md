# CV HIVE - Continuation Summary for New Chat
# Last Updated: 2026-02-16
# Use this file to continue development in a new Claude Code session

## PROJECT OVERVIEW
- **Name:** CV Hive - UAE CV Library / Talent Platform
- **Stack:** React 18 + Vite + Tailwind (frontend) | Express + TypeScript + PostgreSQL (backend)
- **Location:** c:\Users\mohs\Desktop\cv-hive
- **Docker Services:** PostgreSQL (5432), Redis (6379), Elasticsearch (9200)
- **Servers:** Backend :5000 | Frontend :3001

## WHAT HAS BEEN COMPLETED

### Backend (30+ files created)
All files are in `backend/src/`:

**Config:**
- `config/database.ts` - JUST SWITCHED from Prisma to direct `pg` Pool (user: cvhive, pass: cvhive123, db: cvhive on localhost:5432)
- `config/jwt.ts` - JWT config from env vars

**Middleware (all working):**
- `middleware/authenticate.ts` - JWT Bearer token verification (uses `(req as any).user`)
- `middleware/authorize.ts` - Role-based access control
- `middleware/validateRequest.ts` - Zod schema validation
- `middleware/errorHandler.ts` - Global error handler
- `middleware/upload.ts` - Multer CV upload (PDF/DOC, 5MB max, saves to uploads/cvs/)

**Utils:**
- `utils/password.ts` - bcrypt hash/compare
- `utils/tokens.ts` - JWT sign/verify with `as jwt.SignOptions` cast
- `utils/slugify.ts` - Still uses Prisma (NEEDS UPDATE to use pg pool)

**Auth Module (WORKING - just rewritten with raw SQL):**
- `modules/auth/auth.validation.ts` - Zod schemas for register/login
- `modules/auth/auth.service.ts` - REWRITTEN with raw pg queries (register, login, getMe)
- `modules/auth/auth.controller.ts` - Express handlers
- `modules/auth/auth.routes.ts` - POST /register, POST /login, GET /me, POST /logout

**Candidate Module (NEEDS rewrite from Prisma to pg):**
- `modules/candidates/candidates.validation.ts` - Zod schema
- `modules/candidates/candidates.service.ts` - WAS BEING REWRITTEN when session ended
- `modules/candidates/candidates.controller.ts` - Working handlers (uses `(req as any)`)
- `modules/candidates/candidates.routes.ts` - GET /profile, PUT /profile, POST /cv/upload, GET /, GET /:slug

**Employer Module (NEEDS rewrite from Prisma to pg):**
- `modules/employers/employers.validation.ts` - Zod schema
- `modules/employers/employers.service.ts` - NEEDS rewrite from Prisma to pg
- `modules/employers/employers.controller.ts` - Working handlers
- `modules/employers/employers.routes.ts` - GET /profile, PUT /profile

**App Entry:**
- `app.ts` - All routes registered, CORS set to localhost:3001, error handler mounted
- `server.ts` - Listens on PORT 5000

**tsconfig.json:** strict: false, noImplicitAny: false (needed for ts-node compatibility)

### Database (PostgreSQL via Docker)
Tables created manually via `docker exec` (Prisma migrations don't work due to Windows/Docker auth issue):

```sql
-- users (id, email, password_hash, role, email_verified, verification_token, reset_token, reset_token_expiry, created_at, updated_at)
-- candidates (id, user_id, full_name, phone, visa_status, current_emirate, job_title, total_experience_years, salary_min, salary_max, availability_status, cv_url, profile_visible, profile_slug, completeness_score, created_at, updated_at)
-- employers (id, user_id, company_name, industry, created_at, updated_at)
-- subscriptions (id, employer_id, plan_type, status, current_period_start, current_period_end, cv_downloads_limit, cv_downloads_used, created_at)
```

Enum values (stored as TEXT):
- UserRole: CANDIDATE, EMPLOYER, ADMIN
- VisaStatus: EMPLOYMENT_VISA, OWN_VISA, SPOUSE_VISA, FREELANCE_PERMIT, VISIT_VISA, CANCELLED_VISA
- Emirate: DUBAI, ABU_DHABI, SHARJAH, AJMAN, RAS_AL_KHAIMAH, FUJAIRAH, UMM_AL_QUWAIN
- AvailabilityStatus: IMMEDIATE, ONE_MONTH, TWO_TO_THREE_MONTHS, NOT_LOOKING
- SubscriptionPlan: BASIC, PROFESSIONAL, ENTERPRISE
- SubscriptionStatus: ACTIVE, CANCELLED, EXPIRED, PAST_DUE

### Frontend (existing pages, NO API integration yet)
All files in `frontend/src/`:

**Working UI Pages:**
- `pages/Home.tsx` - Landing page with hero, how-it-works, features, CTA
- `pages/Login.tsx` - Login form (email/password) - NO API call yet (console.log)
- `pages/Signup.tsx` - Role selection + email/password - NO API call yet
- `pages/CandidateDashboard.tsx` - Mock stats dashboard - hardcoded data
- `pages/EmployerSearch.tsx` - Search UI with filters - hardcoded results

**Components:**
- `components/layout/Header.tsx` - Sticky nav with Login/Signup buttons
- `components/layout/Footer.tsx` - 4-column footer
- `components/common/Button.tsx` - Primary/secondary variants
- `components/candidate/` - EMPTY
- `components/employer/` - EMPTY

**Empty directories ready for implementation:**
- `store/` - Zustand stores (zustand installed)
- `services/` - API service layer (axios installed)
- `types/` - TypeScript types
- `hooks/` - Custom hooks (@tanstack/react-query installed)
- `utils/` - Utility functions

**Installed but unused dependencies:**
- zustand, @tanstack/react-query, axios, react-hook-form, @hookform/resolvers, zod, react-hot-toast, lucide-react, clsx

**Config:**
- `postcss.config.js` - Created (was missing, caused Tailwind to not render)
- `tailwind.config.js` - Custom colors (primary: #0F52BA, accent: #00A651)
- `vite.config.ts` - Port 3000 (may use 3001 if 3000 occupied)
- `.env` - VITE_API_URL=http://localhost:5000/api/v1

## CRITICAL ISSUE RESOLVED
- Prisma Client cannot authenticate to Docker PostgreSQL on Windows (P1000 error)
- SOLUTION: Switched to direct `pg` Pool driver in config/database.ts
- Auth service rewritten with raw SQL queries - WORKING
- Candidates and employers services STILL USE Prisma imports - MUST be rewritten to use pg pool

## WHAT STILL NEEDS TO BE DONE (Priority Order)

### 1. FINISH Backend Migration from Prisma to pg (30 min)
- Rewrite `candidates.service.ts` with raw SQL (was mid-rewrite)
- Rewrite `employers.service.ts` with raw SQL
- Update `utils/slugify.ts` to use pg pool instead of Prisma
- Remove all Prisma imports from service files
- Test all API endpoints with curl

### 2. Seed Demo Data + Admin Account (15 min)
- Create admin user: admin@cvhive.ae / Admin123!
- Create demo candidate: candidate@demo.com / Demo1234
- Create demo employer: employer@demo.com / Demo1234
- Seed 5-10 sample candidates with varied profiles
- Insert via docker exec SQL

### 3. Frontend API Integration (2 hours)
Create these files:
- `services/api.ts` - Axios instance with Bearer token interceptor
- `services/auth.service.ts` - register(), login(), getMe(), logout()
- `services/candidate.service.ts` - getProfile(), updateProfile(), uploadCV(), search()
- `services/employer.service.ts` - getProfile(), updateProfile()
- `store/authStore.ts` - Zustand store: user, token, isAuthenticated, login(), logout()
- `types/index.ts` - User, Candidate, Employer, SearchFilters types
- `components/common/ProtectedRoute.tsx` - Auth guard component
- `components/common/LoadingSpinner.tsx` - Loading indicator

### 4. Wire Up All Pages (2 hours)
- `pages/Login.tsx` - Replace console.log with API call, redirect on success
- `pages/Signup.tsx` - Same, create profile on register
- `pages/CandidateDashboard.tsx` - Fetch real profile data, real stats
- `pages/EmployerSearch.tsx` - Real search with filters, real candidate cards
- `App.tsx` - Add QueryClientProvider, ProtectedRoute wrappers, toast provider
- `main.tsx` - Add Toaster from react-hot-toast

### 5. Add New Pages (1 hour)
- `pages/CandidateProfile.tsx` - Edit profile form (all UAE fields)
- `pages/EmployerDashboard.tsx` - Company dashboard with saved candidates
- `pages/Pricing.tsx` - 3-tier pricing: Basic (AED 499/mo), Professional (AED 999/mo), Enterprise (AED 2499/mo)
- `pages/PublicProfile.tsx` - Public candidate view at /profile/:slug

### 6. Add Pricing/Subscription Backend (30 min)
- Create `modules/subscriptions/` module
- POST /api/v1/subscriptions/create - Create subscription
- GET /api/v1/subscriptions/plans - List plans with prices
- Add subscription routes to app.ts

### 7. Opus Review Pass
- Review all backend code for security (SQL injection, auth bypass)
- Review all frontend code for XSS, proper error handling
- Add input sanitization
- Add rate limiting to auth routes
- Strengthen JWT implementation

## ENVIRONMENT SETUP (for new session)
```bash
# Start Docker services
cd c:\Users\mohs\Desktop\cv-hive && docker-compose up -d

# Start backend
cd backend && npm run dev

# Start frontend (in separate terminal)
cd frontend && npm run dev
```

## API ENDPOINTS REFERENCE
```
POST   /api/v1/auth/register     - {email, password, role, fullName?, companyName?}
POST   /api/v1/auth/login        - {email, password}
GET    /api/v1/auth/me           - [Auth] Get current user + profile
POST   /api/v1/auth/logout       - [Auth] Logout

GET    /api/v1/candidates/profile - [Auth:CANDIDATE] Own profile
PUT    /api/v1/candidates/profile - [Auth:CANDIDATE] Update profile
POST   /api/v1/candidates/cv/upload - [Auth:CANDIDATE] Upload CV file
GET    /api/v1/candidates         - [Auth:EMPLOYER] Search candidates
GET    /api/v1/candidates/:slug   - Public profile by slug

GET    /api/v1/employers/profile  - [Auth:EMPLOYER] Company profile
PUT    /api/v1/employers/profile  - [Auth:EMPLOYER] Update company

GET    /health                    - Health check
GET    /api/v1                    - API info
```

## KEY DECISIONS MADE
1. Switched from Prisma ORM to direct pg Pool (Windows/Docker auth incompatibility)
2. TypeScript strict mode disabled for ts-node compatibility
3. All `req.user` and `req.file` use `(req as any)` cast
4. Database tables created via manual SQL (not migrations)
5. PostCSS config was missing - created postcss.config.js to fix Tailwind
6. Template literals were broken in original code (server.ts, Button.tsx, Signup.tsx)

## MASTER PROMPT CONTEXT
This is a UAE-focused CV Library SaaS following 7 Pillars of Software Development.
Target: Largest searchable UAE CV database with visa-status-aware filtering.
Monetization: Employer subscriptions (Basic/Pro/Enterprise).
Must support: English primary, Arabic RTL (future), UAE compliance.
Scale target: 100k+ CVs.
