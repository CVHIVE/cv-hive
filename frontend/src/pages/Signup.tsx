import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useRegister } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CANDIDATE');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const { mutate: register, isPending } = useRegister();
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'EMPLOYER' ? '/search' : '/dashboard'} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({
      email,
      password,
      role,
      fullName: role === 'CANDIDATE' ? fullName : undefined,
      companyName: role === 'EMPLOYER' ? companyName : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a:</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('CANDIDATE')}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      role === 'CANDIDATE' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="font-semibold">Job Seeker</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('EMPLOYER')}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      role === 'EMPLOYER' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="font-semibold">Employer</div>
                  </button>
                </div>
              </div>

              {role === 'CANDIDATE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>
              )}

              {role === 'EMPLOYER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input"
                    placeholder="Acme Corp"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
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
                  placeholder="********"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <button type="submit" disabled={isPending} className="btn btn-primary w-full">
                {isPending ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
