import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../services/api';

export default function CompanyProfile() {
  const { slug } = useParams<{ slug: string }>();

  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => api.get(`/employers/profile/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Company Not Found</h1>
          <p className="text-gray-600 mb-6">This company profile doesn't exist.</p>
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      </div>
    );
  }

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8 flex-1">
        {/* Company Header */}
        <div className="card mb-8">
          <div className="flex items-start gap-6">
            {company.company_logo_url ? (
              <img
                src={`${API_BASE}${company.company_logo_url}`}
                alt={company.company_name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                {company.company_name?.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{company.company_name}</h1>
              <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 mb-3">
                {company.industry && <span>{company.industry}</span>}
                {company.location && <span>{company.location}</span>}
                {company.company_size && <span>{company.company_size} employees</span>}
                {company.founded_year && <span>Founded {company.founded_year}</span>}
              </div>
              {/* Response Rate & Reputation Badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                  parseFloat(company.response_rate || 0) >= 70 ? 'bg-green-100 text-green-700' :
                  parseFloat(company.response_rate || 0) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {parseFloat(company.response_rate || 0).toFixed(0)}% response rate
                </span>
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                  parseFloat(company.reputation_score || 0) >= 70 ? 'bg-green-100 text-green-700' :
                  parseFloat(company.reputation_score || 0) >= 40 ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Reputation: {parseFloat(company.reputation_score || 0).toFixed(0)}/100
                </span>
              </div>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  {company.website}
                </a>
              )}
            </div>
          </div>
          {company.description && (
            <p className="mt-4 text-gray-700">{company.description}</p>
          )}
        </div>

        {/* Active Jobs */}
        <h2 className="text-2xl font-bold mb-4">Open Positions ({company.jobs?.length || 0})</h2>
        {!company.jobs || company.jobs.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No open positions at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {company.jobs.map((job: any) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="card block hover:shadow-md transition">
                <h3 className="font-semibold text-lg text-blue-600">{job.title}</h3>
                <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 mt-1">
                  <span>{job.emirate?.replace(/_/g, ' ')}</span>
                  <span>{job.job_type?.replace(/_/g, ' ')}</span>
                  {!job.salary_hidden && job.salary_min && job.salary_max && (
                    <span>AED {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}</span>
                  )}
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
