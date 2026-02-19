import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { jobService } from '../services/jobs';

function formatSalary(amount: number | string | null) {
  if (!amount) return '—';
  const n = typeof amount === 'string' ? parseInt(amount) : amount;
  if (isNaN(n) || n <= 0) return '—';
  return `AED ${n.toLocaleString()}`;
}

export default function SalaryGuide() {
  const { data, isLoading } = useQuery({
    queryKey: ['salary-guide'],
    queryFn: () => jobService.getSalaryGuide(),
    staleTime: 10 * 60 * 1000,
  });

  const byIndustry = data?.byIndustry || [];
  const byEmirate = data?.byEmirate || [];
  const overall = data?.overall;
  const maxSalary = byIndustry.length > 0 ? Math.max(...byIndustry.map((i: any) => parseInt(i.avg_salary) || 0)) : 1;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>UAE Salary Guide 2026 | CV Hive</title>
        <meta name="description" content="Explore average salaries across industries and Emirates in the UAE. Data-driven salary insights to help you negotiate better." />
      </Helmet>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Updated from live job data
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">UAE Salary Guide 2026</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Real salary data from job listings across the UAE. See what employers are offering by industry, role, and location.
            </p>
            {overall && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 max-w-2xl mx-auto">
                <div className="bg-white/5 rounded-xl p-5">
                  <div className="text-3xl font-bold text-primary">{formatSalary(overall.avg_salary)}</div>
                  <div className="text-sm text-gray-400 mt-1">Average Salary</div>
                </div>
                <div className="bg-white/5 rounded-xl p-5">
                  <div className="text-3xl font-bold text-accent">{formatSalary(overall.avg_max)}</div>
                  <div className="text-sm text-gray-400 mt-1">Avg Max Salary</div>
                </div>
                <div className="bg-white/5 rounded-xl p-5">
                  <div className="text-3xl font-bold text-white">{parseInt(overall.total_jobs || '0').toLocaleString()}</div>
                  <div className="text-sm text-gray-400 mt-1">Jobs with Salary Data</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* By Industry */}
            <section className="py-12 sm:py-16">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold mb-2">Salaries by Industry</h2>
                <p className="text-gray-500 mb-8">Average monthly salary ranges based on current job listings.</p>

                {byIndustry.length > 0 ? (
                  <div className="space-y-3">
                    {byIndustry.map((ind: any, i: number) => {
                      const avg = parseInt(ind.avg_salary) || 0;
                      const pct = maxSalary > 0 ? (avg / maxSalary) * 100 : 0;
                      return (
                        <div key={ind.industry} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                              <span className="font-semibold">{ind.industry}</span>
                              <span className="text-xs text-gray-400">{ind.job_count} jobs</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-500">
                                {formatSalary(ind.avg_min)} – {formatSalary(ind.avg_max)}
                              </span>
                              <span className="font-bold text-primary text-base">{formatSalary(ind.avg_salary)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary to-primary-400 h-2 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No salary data available yet. Salary data is sourced from job listings with published salary ranges.</p>
                  </div>
                )}
              </div>
            </section>

            {/* By Emirate */}
            <section className="py-12 sm:py-16 bg-gray-50">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold mb-2">Salaries by Emirate</h2>
                <p className="text-gray-500 mb-8">See how salaries compare across the seven Emirates.</p>

                {byEmirate.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {byEmirate.map((em: any) => (
                      <div key={em.emirate} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg mb-1">{em.emirate.replace(/_/g, ' ')}</h3>
                        <p className="text-xs text-gray-400 mb-4">{em.job_count} jobs with salary data</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Average Salary</span>
                            <span className="font-bold text-primary">{formatSalary(em.avg_salary)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Avg Min</span>
                            <span className="font-medium">{formatSalary(em.avg_min)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Avg Max</span>
                            <span className="font-medium">{formatSalary(em.avg_max)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <p className="text-gray-500">No emirate salary data available yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* CTA */}
            <section className="py-12 sm:py-16">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Find the Right Salary?</h2>
                <p className="text-gray-500 mb-8">
                  Browse thousands of jobs with published salaries or create your profile to get personalised recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/jobs" className="btn btn-primary px-8">Browse Jobs</Link>
                  <Link to="/signup" className="btn btn-secondary px-8">Create Profile</Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
