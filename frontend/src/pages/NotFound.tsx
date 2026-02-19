import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Page Not Found | CV Hive</title>
      </Helmet>
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center px-4">
          <p className="text-6xl font-bold text-primary mb-4">404</p>
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Try searching for jobs or head back to the homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn btn-primary text-sm">Go to homepage</Link>
            <Link to="/jobs" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
              Search jobs
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
