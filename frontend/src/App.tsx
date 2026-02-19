import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMe } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerSearch from './pages/EmployerSearch';
import Pricing from './pages/Pricing';
import CandidateProfile from './pages/CandidateProfile';
import AdminDashboard from './pages/AdminDashboard';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import EmployerDashboard from './pages/EmployerDashboard';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import JobAlerts from './pages/JobAlerts';
import CompanyProfile from './pages/CompanyProfile';
import EmployerSettings from './pages/EmployerSettings';
import RegisterEmployer from './pages/RegisterEmployer';
import CompanyDirectory from './pages/CompanyDirectory';
import CVBuilder from './pages/CVBuilder';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Contact from './pages/Contact';
import MyApplications from './pages/MyApplications';
import SavedJobs from './pages/SavedJobs';
import PaymentMethods from './pages/PaymentMethods';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';
import CookieConsent from './components/common/CookieConsent';

function AppRoutes() {
  // Fetch current user on app load (if token exists)
  useMe();

  return (
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
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <ProtectedRoute roles={['EMPLOYER']}>
            <PaymentMethods />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
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
