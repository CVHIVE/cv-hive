import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cv-hive-cookies');
    if (!accepted) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cv-hive-cookies', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-slate-900 text-white rounded-xl shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-300">
          We use cookies to improve your experience on CV Hive. By continuing to browse, you agree to our{' '}
          <Link to="/privacy" className="text-white underline hover:text-primary-300">Privacy Policy</Link>.
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={accept}
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={accept}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
