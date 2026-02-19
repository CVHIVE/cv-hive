import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { authService } from '../services/auth';
import { subscriptionService } from '../services/subscriptions';
import toast from 'react-hot-toast';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const PLAN_LABELS: Record<string, string> = {
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';
  const pending = searchParams.get('pending') === 'true';
  const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error'>(
    pending ? 'pending' : 'loading'
  );
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState(emailParam);
  const verifyAttempted = useRef(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);

  useEffect(() => {
    if (pending || !token) {
      if (!pending && !token) {
        setStatus('error');
        setMessage('No verification token provided.');
      }
      return;
    }

    // Prevent React StrictMode double-fire from invalidating the token
    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    authService.verifyEmail(token)
      .then((result) => {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        // Store tokens so user is logged in (needed for checkout call)
        if (result?.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
        }
        // Check for pending plan
        const plan = localStorage.getItem('pendingPlan');
        if (plan && ['PROFESSIONAL', 'ENTERPRISE'].includes(plan)) {
          setPendingPlan(plan);
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
      });
  }, [token, pending]);

  const handleResend = async () => {
    if (!resendEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setResending(true);
    try {
      await authService.resendVerificationByEmail(resendEmail);
      toast.success('Verification email sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Verify Email | CV Hive</title>
        <meta name="description" content="Verify your CV Hive email address to activate your account." />
      </Helmet>
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card text-center">
            {status === 'pending' && (
              <>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-2">
                  We've sent a verification link to your email address.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Please click the link in the email to verify your account before you can log in.
                  Check your spam/junk folder if you don't see it.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Your email</label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="input w-full"
                      placeholder="you@example.com"
                    />
                  </div>
                  <button
                    onClick={handleResend}
                    disabled={resending || !resendEmail}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                  <Link to="/login" className="btn btn-secondary w-full block">
                    Go to Login
                  </Link>
                </div>
              </>
            )}
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-gray-600">Verifying your email...</p>
              </>
            )}
            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-6">{message}</p>

                {pendingPlan && PLAN_LABELS[pendingPlan] ? (
                  <div className="space-y-4">
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <p className="text-sm text-primary-700 font-medium">
                        Almost there! Complete your payment to activate the{' '}
                        <span className="font-bold">{PLAN_LABELS[pendingPlan]}</span> plan.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        setRedirectingToPayment(true);
                        try {
                          const checkout = await subscriptionService.createCheckout(pendingPlan);
                          localStorage.removeItem('pendingPlan');
                          if (checkout.url) {
                            window.location.href = checkout.url;
                          }
                        } catch (err: any) {
                          toast.error(err.response?.data?.message || 'Failed to start checkout. Please try from the dashboard.');
                          setRedirectingToPayment(false);
                        }
                      }}
                      disabled={redirectingToPayment}
                      className="btn btn-primary w-full"
                    >
                      {redirectingToPayment ? 'Redirecting to Payment...' : `Complete Payment — ${PLAN_LABELS[pendingPlan]}`}
                    </button>
                    <p className="text-xs text-gray-500">
                      You must complete payment to access employer features.
                    </p>
                  </div>
                ) : (
                  <Link to="/login" className="btn btn-primary w-full block">Go to Login</Link>
                )}
              </>
            )}
            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle size={32} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link to="/login" className="btn btn-primary w-full block">Go to Login</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
