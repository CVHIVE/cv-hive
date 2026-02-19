import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';
import Logo from '../common/Logo';

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMobile = () => setMobileMenuOpen(false);

  const navLinkClass = (path: string) =>
    `block px-3 py-2 rounded-xl text-base font-medium transition-all ${
      location.pathname === path
        ? 'text-primary bg-primary-50 font-semibold'
        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
    }`;

  const desktopLinkClass = (path: string) =>
    `text-sm font-medium transition-all relative px-1 py-0.5 ${
      location.pathname === path
        ? 'text-primary font-semibold'
        : 'text-gray-600 hover:text-primary'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={desktopLinkClass('/')}>Home</Link>
            <Link to="/jobs" className={desktopLinkClass('/jobs')}>Find Jobs</Link>
            {(!isAuthenticated || user?.role !== 'EMPLOYER') && (
              <Link to="/cv-builder" className={desktopLinkClass('/cv-builder')}>CV Builder</Link>
            )}
            <Link to="/companies" className={desktopLinkClass('/companies')}>Companies</Link>
            {isAuthenticated && user?.role === 'EMPLOYER' && (
              <>
                <Link to="/post-job" className={desktopLinkClass('/post-job')}>Post a Job</Link>
                <Link to="/employer-dashboard" className={desktopLinkClass('/employer-dashboard')}>Dashboard</Link>
                <Link to="/search" className={desktopLinkClass('/search')}>Search</Link>
                <Link to="/employer-settings" className={desktopLinkClass('/employer-settings')}>Settings</Link>
              </>
            )}
            {isAuthenticated && user?.role === 'CANDIDATE' && (
              <>
                <Link to="/dashboard" className={desktopLinkClass('/dashboard')}>Dashboard</Link>
                <Link to="/job-alerts" className={desktopLinkClass('/job-alerts')}>Alerts</Link>
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link to="/admin" className={desktopLinkClass('/admin')}>Admin</Link>
            )}
          </nav>

          {/* Desktop Auth + Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-500 hidden lg:block max-w-[200px] truncate">{user?.email}</span>
                  <button onClick={logout} className="btn btn-secondary text-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login"><button className="btn btn-secondary text-sm">Login</button></Link>
                  <Link to="/signup"><button className="btn btn-primary text-sm">Sign Up</button></Link>
                </>
              )}
            </div>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" className={navLinkClass('/')} onClick={closeMobile}>Home</Link>
            <Link to="/jobs" className={navLinkClass('/jobs')} onClick={closeMobile}>Find Jobs</Link>
            {(!isAuthenticated || user?.role !== 'EMPLOYER') && (
              <Link to="/cv-builder" className={navLinkClass('/cv-builder')} onClick={closeMobile}>CV Builder</Link>
            )}
            <Link to="/companies" className={navLinkClass('/companies')} onClick={closeMobile}>Companies</Link>
            <Link to="/pricing" className={navLinkClass('/pricing')} onClick={closeMobile}>Pricing</Link>

            {isAuthenticated && user?.role === 'EMPLOYER' && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employer</p>
                <Link to="/post-job" className={navLinkClass('/post-job')} onClick={closeMobile}>Post a Job</Link>
                <Link to="/employer-dashboard" className={navLinkClass('/employer-dashboard')} onClick={closeMobile}>Dashboard</Link>
                <Link to="/search" className={navLinkClass('/search')} onClick={closeMobile}>Search Candidates</Link>
                <Link to="/employer-settings" className={navLinkClass('/employer-settings')} onClick={closeMobile}>Settings</Link>
              </>
            )}
            {isAuthenticated && user?.role === 'CANDIDATE' && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Candidate</p>
                <Link to="/dashboard" className={navLinkClass('/dashboard')} onClick={closeMobile}>Dashboard</Link>
                <Link to="/job-alerts" className={navLinkClass('/job-alerts')} onClick={closeMobile}>Job Alerts</Link>
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <Link to="/admin" className={navLinkClass('/admin')} onClick={closeMobile}>Admin Dashboard</Link>
              </>
            )}
          </div>

          {/* Mobile auth section */}
          <div className="border-t border-gray-200 px-4 py-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                <button onClick={() => { logout(); closeMobile(); }} className="w-full btn btn-secondary text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={closeMobile}>
                  <button className="w-full btn btn-secondary text-sm">Login</button>
                </Link>
                <Link to="/signup" onClick={closeMobile}>
                  <button className="w-full btn btn-primary text-sm mt-2">Sign Up</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
