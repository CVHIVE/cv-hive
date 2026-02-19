import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import EmployerNav from '../components/employer/EmployerNav';
import { useBookmarkedCandidates, useUnbookmarkCandidate } from '../hooks/useCandidates';
import { subscriptionService } from '../services/subscriptions';

export default function BookmarkedCandidates() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBookmarkedCandidates(page, 20);
  const unbookmarkMutation = useUnbookmarkCandidate();

  const { data: subData } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionService.getStatus(),
    staleTime: 5 * 60 * 1000,
  });
  const plan = (subData as any)?.data?.plan_type || (subData as any)?.plan_type || 'DEMO';
  const isPro = plan === 'PROFESSIONAL' || plan === 'ENTERPRISE';

  const candidates = (data as any)?.candidates || [];
  const pagination = (data as any)?.pagination;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Bookmarked Candidates | CV Hive</title>
        <meta name="description" content="View and manage your bookmarked candidates on CV Hive." />
      </Helmet>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <EmployerNav />
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Bookmarked Candidates</h1>

            {!isPro ? (
              <div className="card text-center py-12">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Professional Plan Required</h3>
                <p className="text-gray-500 mb-4">Upgrade to Professional or Enterprise to bookmark and manage candidates.</p>
                <Link to="/pricing" className="btn btn-primary px-6">View Plans</Link>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="mb-2">No bookmarked candidates yet</p>
                <Link to="/search" className="text-primary hover:underline">Search candidates to bookmark</Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">{pagination?.total || 0} bookmarked candidate{pagination?.total !== 1 ? 's' : ''}</p>

                <div className="space-y-4">
                  {candidates.map((c: any) => (
                    <div key={c.bookmark_id || c.id} className="card hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="w-14 h-14 bg-primary-100 rounded-full flex-shrink-0 flex items-center justify-center text-primary font-bold text-xl">
                          {c.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{c.full_name}</h3>
                          <p className="text-gray-600">{c.job_title || 'No title specified'}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                            {c.total_experience_years != null && <span>{c.total_experience_years} years exp</span>}
                            <span>{c.current_emirate?.replace(/_/g, ' ')}</span>
                            <span>{c.visa_status?.replace(/_/g, ' ')}</span>
                            <span>{c.availability_status?.replace(/_/g, ' ')}</span>
                          </div>
                          {c.skills && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {c.skills.split(',').slice(0, 4).map((skill: string, i: number) => (
                                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{skill.trim()}</span>
                              ))}
                            </div>
                          )}
                          {c.bookmarked_at && (
                            <p className="text-xs text-gray-400 mt-2">
                              Bookmarked {new Date(c.bookmarked_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                          <Link to={`/candidates/${c.profile_slug}`}>
                            <button className="btn btn-primary text-sm px-4 w-full">View Profile</button>
                          </Link>
                          <button
                            onClick={() => unbookmarkMutation.mutate(c.id)}
                            disabled={unbookmarkMutation.isPending}
                            className="btn btn-secondary text-sm px-4 text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-8">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-secondary text-sm">Previous</button>
                    <span className="flex items-center text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary text-sm">Next</button>
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
