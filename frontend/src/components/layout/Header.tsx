import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">CV Hive</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            {isAuthenticated && user?.role === 'EMPLOYER' && (
              <Link to="/search" className="text-gray-600 hover:text-gray-900">Search Candidates</Link>
            )}
            {isAuthenticated && user?.role === 'CANDIDATE' && (
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
                <button onClick={logout} className="btn btn-secondary">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"><button className="btn btn-secondary">Login</button></Link>
                <Link to="/signup"><button className="btn btn-primary">Sign Up</button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
