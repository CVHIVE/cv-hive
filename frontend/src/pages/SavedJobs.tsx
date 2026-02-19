import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CandidateNav from '../components/candidate/CandidateNav';
import { useSavedJobs, useUnsaveJob } from '../hooks/useJobs';
import { jobUrl } from '../utils/jobSlug';

export default function SavedJobs() {
  const { data: savedJobs, isLoading } = useSavedJobs();
  const { mutate: unsaveJob, isPending: isRemoving } = useUnsaveJob();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Saved Jobs | CV Hive</title>
        <meta name="description" content="View your saved jobs on CV Hive." />
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
            <h1 className="text-2xl font-bold">Saved Jobs</h1>
            <Link to="/jobs" className="text-primary text-sm font-medium hover:underline">
              Browse more jobs &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
              ))}
            </div>
          ) : !savedJobs || savedJobs.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 rounded-lg">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No saved jobs</h3>
              <p className="text-gray-500 text-sm mb-4">Save jobs you're interested in to review them later.</p>
              <Link to="/jobs" className="btn btn-primary text-sm">Search jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedJobs.map((job: any) => (
                <div
                  key={job.id || job.job_id}
                  className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link to={jobUrl({ id: job.job_id || job.id, title: job.title || job.job_title, emirate: job.emirate })} className="font-semibold text-primary hover:underline text-[15px]">
                        {job.title || job.job_title}
                      </Link>
                      <p className="text-gray-600 text-sm mt-0.5">{job.company_name}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        {job.emirate && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{job.emirate.replace(/_/g, ' ')}</span>
                        )}
                        {job.job_type && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.job_type.replace(/_/g, ' ')}</span>
                        )}
                        {!job.salary_hidden && job.salary_min && (
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
                            AED {job.salary_min.toLocaleString()} – {job.salary_max?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => unsaveJob(job.job_id || job.id)}
                      disabled={isRemoving}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 self-start flex-shrink-0"
                      title="Remove from saved"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
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
