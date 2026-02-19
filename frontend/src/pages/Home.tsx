import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useRecentJobs, usePlatformStats, useFeaturedEmployers } from '../hooks/useJobs';
import type { Emirate } from '../types';

const EMIRATE_OPTIONS: { value: Emirate; label: string }[] = [
  { value: 'DUBAI', label: 'Dubai' },
  { value: 'ABU_DHABI', label: 'Abu Dhabi' },
  { value: 'SHARJAH', label: 'Sharjah' },
  { value: 'AJMAN', label: 'Ajman' },
  { value: 'RAS_AL_KHAIMAH', label: 'Ras Al Khaimah' },
  { value: 'FUJAIRAH', label: 'Fujairah' },
  { value: 'UMM_AL_QUWAIN', label: 'Umm Al Quwain' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [searchEmirate, setSearchEmirate] = useState('');
  const { data: recentJobs } = useRecentJobs();
  const { data: stats } = usePlatformStats();
  const { data: featuredEmployers } = useFeaturedEmployers();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTitle) params.set('title', searchTitle);
    if (searchEmirate) params.set('emirate', searchEmirate);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>CV Hive — Find Jobs in UAE | Upload Your CV</title>
        <meta name="description" content="Search jobs across all seven Emirates. Upload your CV and get discovered by top UAE employers. Free for job seekers." />
      </Helmet>
      <Header />

      {/* Hero — clean, search-focused */}
      <section className="bg-slate-900 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Find a job that works for you
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Search jobs across all seven Emirates. Upload your CV and get discovered.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-xl p-1.5 sm:p-2 shadow-lg flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative min-w-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Job title or keywords"
                className="w-full pl-10 pr-3 py-3 rounded-lg text-gray-900 border-0 focus:outline-none text-sm"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <select
                className="pl-10 pr-6 py-3 rounded-lg text-gray-900 border-0 focus:outline-none appearance-none bg-gray-50 text-sm w-full sm:w-auto sm:min-w-[150px]"
                value={searchEmirate}
                onChange={(e) => setSearchEmirate(e.target.value)}
              >
                <option value="">All Emirates</option>
                {EMIRATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm whitespace-nowrap"
            >
              Search Jobs
            </button>
          </div>

          {/* Live Stats */}
          {stats && (
            <p className="text-gray-400 text-sm mt-5">
              <span className="text-white font-semibold">{stats.activeJobs.toLocaleString()}</span> jobs from{' '}
              <span className="text-white font-semibold">{stats.employers.toLocaleString()}</span> companies
            </p>
          )}
        </div>
      </section>

      {/* Browse by Industry */}
      {stats?.industries && stats.industries.length > 0 && (
        <section className="py-10 sm:py-14 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold mb-6">Browse jobs by industry</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {stats.industries.map((ind: any) => (
                <Link
                  key={ind.name}
                  to={`/jobs?industry=${encodeURIComponent(ind.name)}`}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-lg text-sm transition-colors group"
                >
                  <span className="truncate font-medium">{ind.name}</span>
                  <span className="text-xs text-gray-400 group-hover:text-white/70 ml-2 flex-shrink-0">{ind.count}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/jobs" className="text-primary hover:underline text-sm font-medium">
                View all jobs &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Jobs */}
      {recentJobs && recentJobs.length > 0 && (
        <section className="py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold">Latest jobs</h2>
              <Link to="/jobs" className="text-primary hover:underline text-sm font-medium hidden sm:block">
                View all &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentJobs.map((job: any) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition-all block"
                >
                  <h3 className="font-semibold text-primary mb-1 text-[15px]">{job.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{job.company_name}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded">{job.emirate.replace(/_/g, ' ')}</span>
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded">{job.job_type.replace(/_/g, ' ')}</span>
                    {!job.salary_hidden && job.salary_min && (
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded">
                        AED {job.salary_min.toLocaleString()} – {job.salary_max.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="sm:hidden text-center mt-5">
              <Link to="/jobs" className="text-primary font-medium text-sm hover:underline">View all jobs &rarr;</Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Employers */}
      {featuredEmployers && featuredEmployers.length > 0 && (
        <section className="py-10 sm:py-14 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold mb-6">Featured employers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredEmployers.map((emp: any) => (
                <Link
                  key={emp.company_slug}
                  to={`/companies/${emp.company_slug}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  {emp.company_logo_url ? (
                    <img src={emp.company_logo_url} alt={emp.company_name} className="h-10 w-auto mx-auto mb-2 object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded mx-auto mb-2 flex items-center justify-center text-sm font-bold text-gray-500">
                      {emp.company_name.charAt(0)}
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-800 truncate">{emp.company_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {parseInt(emp.job_count) > 0 ? `${emp.job_count} jobs` : emp.industry || 'View profile'}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/companies" className="text-primary hover:underline text-sm font-medium">
                Browse all companies &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Job Alerts</h3>
              <p className="text-gray-500 text-sm mb-4">
                Get the latest jobs sent to your inbox. Set up alerts by industry, location, or keywords.
              </p>
              <Link to="/job-alerts" className="text-primary hover:underline text-sm font-medium">
                Set up alerts &rarr;
              </Link>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Company Directory</h3>
              <p className="text-gray-500 text-sm mb-4">
                Browse UAE employers and recruitment agencies by industry and location.
              </p>
              <Link to="/companies" className="text-primary hover:underline text-sm font-medium">
                Search companies &rarr;
              </Link>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">CV Builder</h3>
              <p className="text-gray-500 text-sm mb-4">
                Create a professional CV in minutes using our free builder tool — no account needed.
              </p>
              <Link to="/cv-builder" className="text-primary hover:underline text-sm font-medium">
                Build your CV &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Register CTA */}
      <section className="py-10 sm:py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
              <h3 className="font-bold text-xl mb-2">Register your CV</h3>
              <p className="text-gray-500 text-sm mb-4">
                Upload your CV to be discovered by {stats ? stats.employers.toLocaleString() : ''} companies, and apply to{' '}
                {stats ? stats.activeJobs.toLocaleString() : ''} jobs with one click.
              </p>
              <Link to="/signup">
                <button className="btn btn-primary text-sm">Register now — free</button>
              </Link>
            </div>
            <div className="bg-slate-900 text-white rounded-lg p-6 sm:p-8">
              <h3 className="font-bold text-xl mb-2">Recruiting?</h3>
              <p className="text-gray-400 text-sm mb-4">
                Post jobs and search {stats ? stats.candidates.toLocaleString() : ''} CVs in our database. Flexible plans for companies of all sizes.
              </p>
              <Link to="/pricing">
                <button className="bg-white text-slate-900 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
                  Start recruiting
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Location */}
      <section className="py-10 sm:py-14 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold mb-6">Jobs by location</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {EMIRATE_OPTIONS.map((e) => (
              <Link
                key={e.value}
                to={`/jobs?emirate=${e.value}`}
                className="px-4 py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors"
              >
                {e.label} Jobs
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
