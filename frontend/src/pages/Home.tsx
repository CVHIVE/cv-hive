import { useState } from 'react';
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTitle) params.set('title', searchTitle);
    if (searchEmirate) params.set('emirate', searchEmirate);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section with Job Search */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Your Dream Job in the UAE
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Search thousands of jobs across all Emirates. Upload your CV and get discovered.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Job title or keywords"
              className="flex-1 px-4 py-3 rounded-md text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <select
              className="px-4 py-3 rounded-md text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchEmirate}
              onChange={(e) => setSearchEmirate(e.target.value)}
            >
              <option value="">All Emirates</option>
              {EMIRATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Search Jobs
            </button>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Link to="/signup">
              <button className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-sm">
                Upload Your CV - Free
              </button>
            </Link>
            <Link to="/post-job">
              <button className="border-2 border-blue-300 text-blue-100 px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-sm">
                Post a Job
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      {recentJobs && recentJobs.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Latest Jobs</h2>
              <Link to="/jobs" className="text-blue-600 hover:underline font-medium">
                View all jobs &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentJobs.map((job: any) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="card hover:shadow-md transition block">
                  <h3 className="font-semibold text-blue-600 mb-1">{job.title}</h3>
                  <p className="text-gray-700 text-sm font-medium mb-2">{job.company_name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{job.emirate.replace(/_/g, ' ')}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{job.job_type.replace(/_/g, ' ')}</span>
                    {!job.salary_hidden && job.salary_min && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        AED {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload CV</h3>
              <p className="text-gray-600">Create your profile in 5 minutes. Upload your CV and let us do the rest.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Search & Apply</h3>
              <p className="text-gray-600">Browse thousands of jobs and apply with one click.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Hired</h3>
              <p className="text-gray-600">Receive interview calls from verified UAE employers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore CV Hive */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Explore CV Hive</h2>
          <p className="text-center text-gray-600 mb-12">Everything you need for your career in the UAE</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/jobs" className="card hover:shadow-lg transition text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Search Jobs</h3>
              <p className="text-sm text-gray-600">Browse thousands of jobs across all UAE Emirates</p>
            </Link>
            <Link to="/cv-builder" className="card hover:shadow-lg transition text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">CV Builder</h3>
              <p className="text-sm text-gray-600">Build a professional CV in minutes for free</p>
            </Link>
            <Link to="/job-alerts" className="card hover:shadow-lg transition text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Job Alerts</h3>
              <p className="text-sm text-gray-600">Never miss an opportunity. Get alerts for new jobs.</p>
            </Link>
            <Link to="/companies" className="card hover:shadow-lg transition text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Company A-Z</h3>
              <p className="text-sm text-gray-600">Browse all registered UAE companies and their openings</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CV Hive?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center">
              <h3 className="font-semibold mb-2">Free Forever</h3>
              <p className="text-sm text-gray-600">Always free for job seekers. No hidden costs.</p>
            </div>
            <div className="card text-center">
              <h3 className="font-semibold mb-2">UAE Focused</h3>
              <p className="text-sm text-gray-600">Built specifically for the UAE job market.</p>
            </div>
            <div className="card text-center">
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-gray-600">Control who sees your profile. Your data, your choice.</p>
            </div>
            <div className="card text-center">
              <h3 className="font-semibold mb-2">Instant Matching</h3>
              <p className="text-sm text-gray-600">Advanced search helps employers find you fast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of professionals already on CV Hive</p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Create Your Profile
              </button>
            </Link>
            <Link to="/jobs">
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
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
