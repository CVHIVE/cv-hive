import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useSearchJobs } from '../hooks/useJobs';
import { jobUrl } from '../utils/jobSlug';
import type { Emirate } from '../types';

const EMIRATES: Record<string, { title: string; value: Emirate; description: string; icon: string }> = {
  'dubai': { title: 'Dubai', value: 'DUBAI', description: 'The UAE\'s business hub and most popular destination for professionals. Home to DIFC, Media City, Internet City, and thousands of multinational companies.', icon: '🏙️' },
  'abu-dhabi': { title: 'Abu Dhabi', value: 'ABU_DHABI', description: 'The capital of the UAE with growing opportunities in oil & gas, government, finance, education, and tourism sectors.', icon: '🕌' },
  'sharjah': { title: 'Sharjah', value: 'SHARJAH', description: 'Known as the cultural capital of the UAE. Growing job market in manufacturing, education, healthcare, and retail.', icon: '📖' },
  'ajman': { title: 'Ajman', value: 'AJMAN', description: 'Smallest emirate with a growing free zone. Opportunities in manufacturing, trading, and SME sectors.', icon: '🏗️' },
  'ras-al-khaimah': { title: 'Ras Al Khaimah', value: 'RAS_AL_KHAIMAH', description: 'Fastest-growing emirate with strong industrial, tourism, and construction sectors. Home to RAK Free Zone.', icon: '⛰️' },
  'fujairah': { title: 'Fujairah', value: 'FUJAIRAH', description: 'The only emirate on the Gulf of Oman coast. Key sectors include oil bunkering, tourism, and mining.', icon: '🌊' },
  'umm-al-quwain': { title: 'Umm Al Quwain', value: 'UMM_AL_QUWAIN', description: 'A peaceful emirate with affordable business setup. Opportunities in aquaculture, trading, and tourism.', icon: '🐚' },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// List page - all Emirates
export function EmirateJobsList() {
  const emirates = Object.entries(EMIRATES);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Browse Jobs by Emirate | UAE Jobs | CV Hive</title>
        <meta name="description" content="Find jobs across all seven UAE Emirates. Browse opportunities in Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain." />
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">Jobs by Emirate</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore job opportunities across all seven Emirates of the UAE.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {emirates.map(([slug, info]) => (
              <Link
                key={slug}
                to={`/jobs/emirate/${slug}`}
                className="p-6 rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all group"
              >
                <span className="text-3xl mb-3 block">{info.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">Jobs in {info.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{info.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Detail page - jobs in a specific emirate
export default function EmirateJobs() {
  const { slug } = useParams<{ slug: string }>();
  const emirate = slug ? EMIRATES[slug] : null;

  const { data, isLoading } = useSearchJobs({
    emirate: emirate?.value,
    page: 1,
    limit: 20,
  });

  if (!emirate) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Emirate Not Found</h1>
            <p className="text-gray-500 mb-4">The emirate you're looking for doesn't exist.</p>
            <Link to="/jobs/emirate" className="btn btn-primary">Browse All Emirates</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const jobs = data?.jobs || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Jobs in {emirate.title} | UAE Jobs | CV Hive</title>
        <meta name="description" content={`Find jobs in ${emirate.title}, UAE. ${emirate.description} Browse ${total}+ live vacancies on CV Hive.`} />
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-4xl mb-4 block">{emirate.icon}</span>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">Jobs in {emirate.title}</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{emirate.description}</p>
            {!isLoading && <p className="text-primary-200 mt-4 text-sm">{total} jobs found</p>}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No jobs in {emirate.title} right now.</p>
              <Link to="/jobs" className="btn btn-primary">Search All Jobs</Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {jobs.map((job: any) => (
                  <Link
                    key={job.id}
                    to={jobUrl(job)}
                    className="block p-5 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-sm text-primary font-medium">{job.company_name}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                          {job.industry && <span className="bg-gray-100 px-2 py-0.5 rounded">{job.industry}</span>}
                          {job.job_type && <span className="bg-gray-100 px-2 py-0.5 rounded">{job.job_type.replace(/_/g, ' ')}</span>}
                          {(job.salary_min || job.salary_max) && (
                            <span>AED {job.salary_min?.toLocaleString()}{job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : ''}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(job.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {total > 20 && (
                <div className="text-center mt-8">
                  <Link
                    to={`/jobs?emirate=${emirate.value}`}
                    className="btn btn-primary"
                  >
                    View All {total} Jobs in {emirate.title}
                  </Link>
                </div>
              )}
            </>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Browse Other Emirates</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(EMIRATES)
                .filter(([s]) => s !== slug)
                .map(([s, info]) => (
                  <Link
                    key={s}
                    to={`/jobs/emirate/${s}`}
                    className="text-sm px-4 py-2 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                  >
                    {info.icon} {info.title}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
