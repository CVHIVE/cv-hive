import { useState } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useRegisterEmployer } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

const PLAN_NAMES: Record<string, string> = {
  BASIC: 'Basic (Free)',
  PROFESSIONAL: 'Professional (AED 499/month)',
  ENTERPRISE: 'Enterprise (AED 1,499/month)',
};

export default function RegisterEmployer() {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('plan') || 'BASIC';
  const { isAuthenticated, user } = useAuthStore();
  const { mutate: registerEmployer, isPending } = useRegisterEmployer();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  if (isAuthenticated && user?.role === 'EMPLOYER') {
    return <Navigate to="/employer-dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerEmployer({ email, password, companyName, planType });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <h2 className="text-2xl font-bold text-center mb-2">Create Recruiter Account</h2>
            <p className="text-center text-gray-500 text-sm mb-6">
              Start finding top talent in the UAE
            </p>

            {/* Selected Plan */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                Selected Plan: <span className="font-bold">{PLAN_NAMES[planType] || planType}</span>
              </p>
              <Link to="/pricing" className="text-xs text-blue-600 hover:underline">Change plan</Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input"
                  placeholder="Acme Corp"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
              </div>

              <button type="submit" disabled={isPending} className="btn btn-primary w-full">
                {isPending ? 'Creating Account...' : 'Create Recruiter Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            </p>
            <p className="text-center text-sm text-gray-600 mt-2">
              Looking for a job?{' '}
              <Link to="/signup" className="text-blue-600 hover:underline">Sign up as a candidate</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
