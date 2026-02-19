import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

const PLAN_LABELS: Record<string, string> = {
  PROFESSIONAL: 'Professional (AED 499/month)',
  ENTERPRISE: 'Enterprise (AED 1,499/month)',
};

export default function RegisterEmployer() {
  const { isAuthenticated, user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isPending, setIsPending] = useState(false);

  if (isAuthenticated && user?.role === 'EMPLOYER') {
    return <Navigate to="/employer-dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }
    setIsPending(true);
    try {
      await authService.registerEmployer({ email, password, companyName });

      // Store pending plan so we can redirect to Stripe after email verification
      if (selectedPlan && ['PROFESSIONAL', 'ENTERPRISE'].includes(selectedPlan)) {
        localStorage.setItem('pendingPlan', selectedPlan);
      }

      toast.success('Account created! Please check your email to verify your account.');
      window.location.href = `/verify-email?pending=true&email=${encodeURIComponent(email)}`;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsPending(false);
    }
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

            {selectedPlan && PLAN_LABELS[selectedPlan] ? (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-primary-700">
                  Selected plan: <span className="font-bold">{PLAN_LABELS[selectedPlan]}</span>
                </p>
                <p className="text-xs text-primary mt-1">
                  After verifying your email, you'll be redirected to complete payment.
                </p>
                <Link to="/register-employer" className="text-xs text-blue-500 hover:underline">
                  Switch to Free Demo plan
                </Link>
              </div>
            ) : (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-primary-700">
                  You'll start on the <span className="font-bold">Demo (Free)</span> plan — explore the platform for 24 hours.
                  Upgrade anytime from your dashboard.
                </p>
                <Link to="/pricing" className="text-xs text-primary hover:underline">View all plans</Link>
              </div>
            )}

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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" disabled={isPending} className="btn btn-primary w-full">
                {isPending
                  ? 'Creating Account...'
                  : selectedPlan && PLAN_LABELS[selectedPlan]
                    ? 'Sign Up & Verify Email'
                    : 'Create Recruiter Account'
                }
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">Login</Link>
            </p>
            <p className="text-center text-sm text-gray-600 mt-2">
              Looking for a job?{' '}
              <Link to="/signup" className="text-primary hover:underline">Sign up as a candidate</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
