import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useRecentJobs } from '../hooks/useJobs';
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

  // Scroll animation observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.animate-on-scroll, .stagger-children').forEach((el) => {
      observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [recentJobs]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTitle) params.set('title', searchTitle);
    if (searchEmirate) params.set('emirate', searchEmirate);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-800 to-primary text-white py-16 sm:py-24">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-white/90">UAE's Leading CV Library Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1]">
              Your next career move
              <span className="block text-accent-300 mt-1">starts here</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-white/70 max-w-2xl mx-auto leading-relaxed">
              Search thousands of jobs across all Emirates. Upload your CV and get discovered by top UAE employers.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative min-w-0">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Job title or keywords"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <select
                  className="pl-11 pr-8 py-3.5 rounded-xl text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-primary-400 appearance-none bg-gray-50 text-sm min-w-[140px] sm:min-w-[160px] w-full"
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
                className="bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98] text-sm"
              >
                Search Jobs
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <Link to="/signup">
                <button className="border-2 border-white/30 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white hover:text-primary transition-all text-sm backdrop-blur-sm">
                  Upload Your CV — Free
                </button>
              </Link>
              <Link to="/post-job">
                <button className="border-2 border-accent/40 text-accent-300 px-6 py-2.5 rounded-xl font-semibold hover:bg-accent hover:text-white hover:border-accent transition-all text-sm backdrop-blur-sm">
                  Post a Job
                </button>
              </Link>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-white/50 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Free for job seekers
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              All 7 Emirates
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Privacy first
            </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      {recentJobs && recentJobs.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10 animate-on-scroll">
              <div>
                <h2 className="text-3xl font-bold">Latest Jobs</h2>
                <p className="text-gray-500 mt-1">Fresh opportunities from top UAE employers</p>
              </div>
              <Link to="/jobs" className="text-primary hover:text-primary-700 font-semibold text-sm hidden sm:block transition-colors">
                View all jobs &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {recentJobs.map((job: any) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="card hover:shadow-soft hover:border-primary-100 transition-all duration-300 block group">
                  <h3 className="font-semibold text-primary group-hover:text-primary-700 mb-1 transition-colors">{job.title}</h3>
                  <p className="text-gray-700 text-sm font-medium mb-3">{job.company_name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg font-medium">{job.emirate.replace(/_/g, ' ')}</span>
                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{job.job_type.replace(/_/g, ' ')}</span>
                    {!job.salary_hidden && job.salary_min && (
                      <span className="bg-accent-50 text-accent-700 px-2.5 py-1 rounded-lg font-medium">
                        AED {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="sm:hidden text-center mt-6">
              <Link to="/jobs" className="text-primary font-semibold text-sm">View all jobs &rarr;</Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="inline-block bg-primary-50 text-primary font-semibold text-sm px-4 py-1.5 rounded-full mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold">Three steps to your next role</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 stagger-children">
            {/* Step 1 */}
            <div className="relative text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Your CV</h3>
              <p className="text-gray-500 leading-relaxed">Create your profile in under 5 minutes. Upload your CV and set your preferences.</p>
              {/* Connector line (hidden on mobile) */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
            </div>
            {/* Step 2 */}
            <div className="relative text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Search & Apply</h3>
              <p className="text-gray-500 leading-relaxed">Browse thousands of jobs across all Emirates. Apply with a single click.</p>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
            </div>
            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Get Hired</h3>
              <p className="text-gray-500 leading-relaxed">Receive interview calls from verified UAE employers. Land your dream job.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore CV Hive */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-on-scroll">
            <span className="inline-block bg-accent-50 text-accent font-semibold text-sm px-4 py-1.5 rounded-full mb-4">Explore</span>
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need for your career</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">All the tools to land your next role in the UAE — completely free for job seekers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            <Link to="/jobs" className="card hover:shadow-soft hover:border-primary-100 transition-all duration-300 text-center group hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Search Jobs</h3>
              <p className="text-sm text-gray-500">Browse thousands of jobs across all UAE Emirates</p>
            </Link>
            <Link to="/cv-builder" className="card hover:shadow-soft hover:border-accent-100 transition-all duration-300 text-center group hover:-translate-y-1">
              <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-100 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">CV Builder</h3>
              <p className="text-sm text-gray-500">Build a professional CV in minutes for free</p>
            </Link>
            <Link to="/job-alerts" className="card hover:shadow-soft hover:border-orange-100 transition-all duration-300 text-center group hover:-translate-y-1">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-100 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Job Alerts</h3>
              <p className="text-sm text-gray-500">Never miss an opportunity. Get alerts for new jobs.</p>
            </Link>
            <Link to="/companies" className="card hover:shadow-soft hover:border-purple-100 transition-all duration-300 text-center group hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Company A-Z</h3>
              <p className="text-sm text-gray-500">Browse all registered UAE companies and their openings</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose CV Hive */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-on-scroll">
            <h2 className="text-3xl sm:text-4xl font-bold">Why choose CV Hive?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            <div className="card text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold mb-2">Free Forever</h3>
              <p className="text-sm text-gray-500">Always free for job seekers. No hidden costs, ever.</p>
            </div>
            <div className="card text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold mb-2">UAE Focused</h3>
              <p className="text-sm text-gray-500">Built specifically for the UAE job market and its culture.</p>
            </div>
            <div className="card text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="font-bold mb-2">Privacy First</h3>
              <p className="text-sm text-gray-500">Control who sees your profile. Your data, your choice.</p>
            </div>
            <div className="card text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-bold mb-2">Instant Matching</h3>
              <p className="text-sm text-gray-500">Advanced search helps employers find you fast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-700 to-slate-900 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">Join thousands of professionals already on CV Hive. Your next opportunity is waiting.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <button className="bg-white text-primary px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-sm">
                Create Your Profile
              </button>
            </Link>
            <Link to="/jobs">
              <button className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all text-sm backdrop-blur-sm">
                Browse Jobs
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
