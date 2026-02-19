import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CandidateNav from '../components/candidate/CandidateNav';
import { useCandidateApplications } from '../hooks/useJobs';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  REVIEWED: 'bg-blue-50 text-blue-700',
  SHORTLISTED: 'bg-green-50 text-green-700',
  INTERVIEW: 'bg-purple-50 text-purple-700',
  OFFERED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  REVIEWED: 'Reviewed',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Offered',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export default function MyApplications() {
  const { data: applications, isLoading } = useCandidateApplications();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>My Applications | CV Hive</title>
        <meta name="description" content="Track your job applications and their status on CV Hive." />
      </Helmet>
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-56 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <CandidateNav />
              </div>
            </aside>
            <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Applications</h1>
            <Link to="/jobs" className="text-primary text-sm font-medium hover:underline">
              Browse jobs &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
              ))}
            </div>
          ) : !applications || applications.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 rounded-lg">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No applications yet</h3>
              <p className="text-gray-500 text-sm mb-4">Start applying to jobs to track them here.</p>
              <Link to="/jobs" className="btn btn-primary text-sm">Search jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <div
                  key={app.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link to={`/jobs/${app.job_id}`} className="font-semibold text-primary hover:underline text-[15px]">
                        {app.job_title}
                      </Link>
                      <p className="text-gray-600 text-sm mt-0.5">{app.company_name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                        {app.emirate && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded">{app.emirate.replace(/_/g, ' ')}</span>
                        )}
                        <span>Applied {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                    </div>
                  </div>

                  {app.status === 'REJECTED' && app.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500"><span className="font-medium text-gray-600">Feedback:</span> {app.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
