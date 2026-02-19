import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../services/api';

const INDUSTRY_OPTIONS = [
  'Accountancy', 'Admin & Office Support', 'Automotive', 'Aviation & Aerospace',
  'Cleaning & Facilities', 'Consulting', 'Construction & Engineering', 'Customer Service',
  'Design & Creative', 'Education', 'Engineering', 'Environmental', 'Finance & Banking',
  'Government', 'Healthcare', 'Hospitality & Tourism', 'HR & Recruitment', 'Insurance',
  'Legal', 'Logistics & Supply Chain', 'Manufacturing', 'Marketing & Advertising',
  'Media & Communications', 'Oil & Gas', 'Procurement & Purchasing', 'Real Estate',
  'Retail', 'Sales & Business Development', 'Science & Research', 'Security & Safety',
  'Telecoms', 'Technology',
];

const EMIRATE_OPTIONS = [
  { value: 'DUBAI', label: 'Dubai' },
  { value: 'ABU_DHABI', label: 'Abu Dhabi' },
  { value: 'SHARJAH', label: 'Sharjah' },
  { value: 'AJMAN', label: 'Ajman' },
  { value: 'RAS_AL_KHAIMAH', label: 'Ras Al Khaimah' },
  { value: 'FUJAIRAH', label: 'Fujairah' },
  { value: 'UMM_AL_QUWAIN', label: 'Umm Al Quwain' },
];

interface DbStats {
  total: number;
  recentlyUpdated: number;
  byIndustry: { industry: string; count: number }[];
  byEmirate: { emirate: string; count: number }[];
}

function AnimatedCount({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count.toLocaleString()}</>;
}

export default function CandidateDatabase() {
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState('');

  const { data: stats, isLoading } = useQuery<DbStats>({
    queryKey: ['db-stats', selectedIndustry, selectedEmirate],
    queryFn: () =>
      api.get('/candidates/db-stats', {
        params: {
          ...(selectedIndustry ? { industry: selectedIndustry } : {}),
          ...(selectedEmirate ? { emirate: selectedEmirate } : {}),
        },
      }).then((r: any) => r.data.data),
    staleTime: 30 * 1000,
  });

  const formatEmirate = useCallback((e: string) => {
    const map: Record<string, string> = {
      DUBAI: 'Dubai', ABU_DHABI: 'Abu Dhabi', SHARJAH: 'Sharjah',
      AJMAN: 'Ajman', RAS_AL_KHAIMAH: 'Ras Al Khaimah',
      FUJAIRAH: 'Fujairah', UMM_AL_QUWAIN: 'Umm Al Quwain',
    };
    return map[e] || e.replace(/_/g, ' ');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>CV Database — Search UAE Candidates | CV Hive</title>
        <meta name="description" content="Browse CV Hive's candidate database. Filter by industry, location, and experience to find the perfect match for your vacancy." />
      </Helmet>
      <Header />

      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Search Our CV Database</h1>
          <p className="text-lg text-gray-400 mb-8">
            Find the best talent across the UAE — filter by industry and location in real time
          </p>

          {/* Live Filter */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <select
                className="w-full rounded-lg bg-white text-gray-800 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                <option value="">All Industries</option>
                {INDUSTRY_OPTIONS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <select
                className="w-full rounded-lg bg-white text-gray-800 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                value={selectedEmirate}
                onChange={(e) => setSelectedEmirate(e.target.value)}
              >
                <option value="">All Locations</option>
                {EMIRATE_OPTIONS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            {/* Live Count */}
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-accent mb-1">
                {isLoading ? (
                  <span className="inline-block w-32 h-12 bg-white/10 rounded animate-pulse" />
                ) : (
                  <AnimatedCount target={stats?.total ?? 0} />
                )}
              </p>
              <p className="text-gray-300 text-sm">
                candidates{selectedIndustry ? ` in ${selectedIndustry}` : ''}{selectedEmirate ? ` in ${formatEmirate(selectedEmirate)}` : ' across all emirates'}
              </p>
              {stats && stats.recentlyUpdated > 0 && (
                <p className="text-gray-400 text-xs mt-2">
                  {stats.recentlyUpdated.toLocaleString()} updated their CV in the last 2 months
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breakdown */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* By Industry */}
            <div className="card">
              <h2 className="text-lg font-bold mb-4">Candidates by Industry</h2>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(stats?.byIndustry || []).map((item) => {
                    const pct = stats?.total ? Math.round((item.count / stats.total) * 100) : 0;
                    return (
                      <button
                        key={item.industry}
                        onClick={() => setSelectedIndustry(item.industry === selectedIndustry ? '' : item.industry)}
                        className={`w-full text-left flex items-center gap-3 p-2 rounded-lg transition group ${
                          selectedIndustry === item.industry
                            ? 'bg-primary/10 ring-1 ring-primary/30'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate">{item.industry}</span>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{item.count.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-primary rounded-full h-1.5 transition-all duration-500"
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {(stats?.byIndustry || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No industry data available</p>
                  )}
                </div>
              )}
            </div>

            {/* By Emirate */}
            <div className="card">
              <h2 className="text-lg font-bold mb-4">Candidates by Location</h2>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(stats?.byEmirate || []).map((item) => {
                    const pct = stats?.total ? Math.round((item.count / stats.total) * 100) : 0;
                    return (
                      <button
                        key={item.emirate}
                        onClick={() => setSelectedEmirate(item.emirate === selectedEmirate ? '' : item.emirate)}
                        className={`w-full text-left flex items-center gap-3 p-2 rounded-lg transition group ${
                          selectedEmirate === item.emirate
                            ? 'bg-primary/10 ring-1 ring-primary/30'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{formatEmirate(item.emirate)}</span>
                            <span className="text-xs text-gray-500 ml-2">{item.count.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-accent rounded-full h-1.5 transition-all duration-500"
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {(stats?.byEmirate || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No location data available</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features / CTA */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Why Search with CV Hive?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="font-semibold mb-2">Advanced Search</h3>
              <p className="text-sm text-gray-600">Filter by industry, location, visa status, experience, salary, skills, and more</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="font-semibold mb-2">UAE Talent Pool</h3>
              <p className="text-sm text-gray-600">Candidates across all seven emirates with verified profiles and CVs</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-semibold mb-2">Contact & Reveal</h3>
              <p className="text-sm text-gray-600">Reveal candidate contact details, download CVs, and bookmark your shortlist</p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/search" className="btn btn-primary px-8 py-3 text-lg inline-block">
              Search Candidates Now
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              <Link to="/pricing" className="text-primary hover:underline">View pricing plans</Link> for full database access
            </p>
          </div>
        </div>
      </section>

      {/* Browse by Industry */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Browse by Industry</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {INDUSTRY_OPTIONS.map((ind) => {
              const industryCount = stats?.byIndustry.find((b) => b.industry === ind)?.count || 0;
              return (
                <button
                  key={ind}
                  onClick={() => { setSelectedIndustry(ind === selectedIndustry ? '' : ind); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedIndustry === ind
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-200 hover:border-primary/40 hover:shadow-sm bg-white'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 mb-0.5">{ind}</p>
                  <p className="text-xs text-gray-500">
                    {industryCount > 0 ? `${industryCount.toLocaleString()} candidate${industryCount !== 1 ? 's' : ''}` : 'View candidates'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
