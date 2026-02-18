import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { authService } from '../services/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    authService.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card text-center">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Verifying your email...</p>
              </>
            )}
            {status === 'success' && (
              <>
                <div className="text-green-500 text-5xl mb-4">&#10003;</div>
                <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link to="/login" className="btn btn-primary">Go to Login</Link>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="text-red-500 text-5xl mb-4">&#10007;</div>
                <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link to="/login" className="btn btn-primary">Go to Login</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
