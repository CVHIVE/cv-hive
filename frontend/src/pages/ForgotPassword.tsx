import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>

            {sent ? (
              <div className="text-center">
                <div className="text-green-500 text-4xl mb-4">&#9993;</div>
                <p className="text-gray-600 mb-6">
                  If an account with <strong>{email}</strong> exists, we've sent a password reset link.
                  Check your email (and spam folder).
                </p>
                <Link to="/login" className="btn btn-secondary">Back to Login</Link>
              </div>
            ) : (
              <>
                <p className="text-center text-gray-600 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  <button type="submit" disabled={loading} className="btn btn-primary w-full">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-4">
                  <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
