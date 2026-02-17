import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useMe } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerSearch from './pages/EmployerSearch';
import Pricing from './pages/Pricing';
import CandidateProfile from './pages/CandidateProfile';
import ProtectedRoute from './components/common/ProtectedRoute';

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

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <CandidateDashboard />
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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
