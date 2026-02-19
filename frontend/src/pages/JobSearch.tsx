import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useSearchJobs } from '../hooks/useJobs';
import type { JobSearchFilters, Emirate, JobType } from '../types';

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Construction & Engineering',
  'Hospitality & Tourism', 'Education', 'Marketing & Advertising', 'Real Estate',
  'Oil & Gas', 'Retail', 'Legal', 'HR & Recruitment', 'Logistics & Supply Chain',
  'Media & Communications', 'Government',
];

const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const EMIRATE_OPTIONS: { value: Emirate; label: string }[] = [
  { value: 'DUBAI', label: 'Dubai' },
  { value: 'ABU_DHABI', label: 'Abu Dhabi' },
  { value: 'SHARJAH', label: 'Sharjah' },
  { value: 'AJMAN', label: 'Ajman' },
  { value: 'RAS_AL_KHAIMAH', label: 'Ras Al Khaimah' },
  { value: 'FUJAIRAH', label: 'Fujairah' },
  { value: 'UMM_AL_QUWAIN', label: 'Umm Al Quwain' },
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function JobSearch() {
  const [searchParams] = useSearchParams();
  const initialTitle = searchParams.get('title') || '';
  const initialEmirate = searchParams.get('emirate') || '';

  const [filters, setFilters] = useState<JobSearchFilters>({
    title: initialTitle || undefined,
    emirate: (initialEmirate as Emirate) || undefined,
    page: 1,
    limit: 20,
  });
  const [titleInput, setTitleInput] = useState(initialTitle);
  const { data, isLoading } = useSearchJobs(filters);

  const handleSearch = () => {
    setFilters({ ...filters, title: titleInput || undefined, page: 1 });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Search Jobs in UAE | CV Hive</title>
        <meta name="description" content="Browse and search thousands of jobs across Dubai, Abu Dhabi, Sharjah and all UAE Emirates." />
      </Helmet>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Find Jobs in the UAE</h1>

        {/* Search Bar */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              className="input flex-1"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-primary px-8">Search</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Industry</h4>
                  <select
                    className="input"
                    value={filters.industry || ''}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value || undefined, page: 1 })}
                  >
                    <option value="">All Industries</option>
                    {INDUSTRY_OPTIONS.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Emirate</h4>
                  <select
                    className="input"
                    value={filters.emirate || ''}
                    onChange={(e) => setFilters({ ...filters, emirate: (e.target.value || undefined) as Emirate | undefined, page: 1 })}
                  >
                    <option value="">All Emirates</option>
                    {EMIRATE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Job Type</h4>
                  <select
                    className="input"
                    value={filters.jobType || ''}
                    onChange={(e) => setFilters({ ...filters, jobType: (e.target.value || undefined) as JobType | undefined, page: 1 })}
                  >
                    <option value="">All Types</option>
                    {JOB_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Min Salary (AED)</h4>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 10000"
                    value={filters.salaryMin || ''}
                    onChange={(e) => setFilters({ ...filters, salaryMin: Number(e.target.value) || undefined, page: 1 })}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Date Posted</h4>
                  <select
                    className="input"
                    value={(filters as any).postedWithin || ''}
                    onChange={(e) => setFilters({ ...filters, postedWithin: e.target.value || undefined, page: 1 } as any)}
                  >
                    <option value="">Any Time</option>
                    <option value="today">Today</option>
                    <option value="3days">Last 3 Days</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Sort By</h4>
                  <select
                    className="input"
                    value={(filters as any).sort || ''}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value || undefined, page: 1 } as any)}
                  >
                    <option value="">Most Recent</option>
                    <option value="salary_desc">Salary: High to Low</option>
                    <option value="salary_asc">Salary: Low to High</option>
                  </select>
                </div>

                <button
                  onClick={() => { setFilters({ page: 1, limit: 20 }); setTitleInput(''); }}
                  className="btn btn-secondary w-full text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {data?.pagination.total ?? 0} job{data?.pagination.total !== 1 ? 's' : ''} found
                </p>

                {data?.jobs.length === 0 && (
                  <div className="card text-center py-12 text-gray-500">
                    No jobs match your search. Try adjusting your filters.
                  </div>
                )}

                <div className="space-y-4">
                  {data?.jobs.map((job: any) => (
                    <Link key={job.id} to={`/jobs/${job.id}`} className="block">
                      <div className="card hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-primary hover:text-primary-800">{job.title}</h3>
                            <p className="text-gray-700 font-medium">{job.company_name}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                              <span>{job.emirate.replace(/_/g, ' ')}</span>
                              <span>{job.job_type.replace(/_/g, ' ')}</span>
                              {!job.salary_hidden && job.salary_min && job.salary_max && (
                                <span>AED {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}</span>
                              )}
                              {job.industry && <span>{job.industry}</span>}
                            </div>
                            {job.skills && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.skills.split(',').slice(0, 4).map((s: string) => (
                                  <span key={s} className="bg-primary-50 text-primary text-xs px-2 py-0.5 rounded">
                                    {s.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            {timeAgo(job.created_at)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-8">
                    <button
                      disabled={filters.page === 1}
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                      className="btn btn-secondary text-sm"
                    >
                      Previous
                    </button>
                    <span className="flex items-center text-sm text-gray-600">
                      Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <button
                      disabled={data.pagination.page >= data.pagination.totalPages}
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                      className="btn btn-secondary text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
