import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMe } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/common/ProtectedRoute';
import CookieConsent from './components/common/CookieConsent';

// Lazy-loaded pages
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const EmployerSearch = lazy(() => import('./pages/EmployerSearch'));
const Pricing = lazy(() => import('./pages/Pricing'));
const CandidateProfile = lazy(() => import('./pages/CandidateProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const JobSearch = lazy(() => import('./pages/JobSearch'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const PostJob = lazy(() => import('./pages/PostJob'));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const JobAlerts = lazy(() => import('./pages/JobAlerts'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'));
const EmployerSettings = lazy(() => import('./pages/EmployerSettings'));
const RegisterEmployer = lazy(() => import('./pages/RegisterEmployer'));
const CompanyDirectory = lazy(() => import('./pages/CompanyDirectory'));
const CVBuilder = lazy(() => import('./pages/CVBuilder'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const SavedJobs = lazy(() => import('./pages/SavedJobs'));

const BookmarkedCandidates = lazy(() => import('./pages/BookmarkedCandidates'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
    </div>
  );
}

function AppRoutes() {
  // Fetch current user on app load (if token exists)
  useMe();

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/candidates/:slug" element={<CandidateProfile />} />
      <Route path="/jobs" element={<JobSearch />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/companies/:slug" element={<CompanyProfile />} />
      <Route path="/register-employer" element={<RegisterEmployer />} />
      <Route path="/companies" element={<CompanyDirectory />} />
      <Route path="/cv-builder" element={<CVBuilder />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route
        path="/post-job"
        element={
          <ProtectedRoute roles={['EMPLOYER']}>
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer-dashboard"
        element={
          <ProtectedRoute roles={['EMPLOYER']}>
            <EmployerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer-settings"
        element={
          <ProtectedRoute roles={['EMPLOYER']}>
            <EmployerSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-alerts"
        element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <JobAlerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-applications"
        element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <MyApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-jobs"
        element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <SavedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute roles={['EMPLOYER', 'ADMIN']}>
            <EmployerSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarked-candidates"
        element={
          <ProtectedRoute roles={['EMPLOYER', 'ADMIN']}>
            <BookmarkedCandidates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
      <CookieConsent />
    </Router>
  );
}

export default App;
