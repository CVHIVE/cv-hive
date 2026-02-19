import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import { useEmployerJobs, useCloseJob, usePayForJob, useJobApplications, useUpdateApplicationStatus } from '../hooks/useJobs';
import api from '../services/api';
import { subscriptionService } from '../services/subscriptions';
import { jobService } from '../services/jobs';
import toast from 'react-hot-toast';

export default function EmployerDashboard() {
  const { data: jobs, isLoading } = useEmployerJobs();
  const { mutate: closeJob } = useCloseJob();
  const { mutate: payForJob, isPending: isPaying } = usePayForJob();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [tab, setTab] = useState<'jobs' | 'applications' | 'analytics' | 'subscription'>('jobs');
  const { data: applications } = useJobApplications(selectedJobId || '');
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Handle subscription success/cancel redirect from Stripe
  useEffect(() => {
    const subStatus = searchParams.get('subscription');
    const jobPayment = searchParams.get('job_payment');
    const sessionId = searchParams.get('session_id');

    if (subStatus === 'success' && sessionId) {
      subscriptionService.verifySession(sessionId)
        .then((result) => {
          if (result.status === 'activated' || result.status === 'already_active') {
            toast.success(`Successfully upgraded to ${result.plan_type} plan!`);
            queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
          } else {
            toast.error('Payment not completed. Please try again.');
          }
        })
        .catch(() => toast.error('Could not verify payment. Please contact support.'));
      searchParams.delete('subscription');
      searchParams.delete('session_id');
      setSearchParams(searchParams, { replace: true });
      setTab('subscription');
    } else if (jobPayment === 'success' && sessionId) {
      jobService.verifyJobPayment(sessionId)
        .then((result) => {
          if (result.status === 'activated' || result.status === 'already_active') {
            toast.success(`Job "${result.title}" is now live!`);
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
          } else {
            toast.error('Job payment not completed. Please try again.');
          }
        })
        .catch(() => toast.error('Could not verify job payment. Please contact support.'));
      searchParams.delete('job_payment');
      searchParams.delete('session_id');
      setSearchParams(searchParams, { replace: true });
    } else if (jobPayment === 'cancelled') {
      toast('Job payment was cancelled. You can pay later from your dashboard.', { icon: '\u26a0\ufe0f' });
      searchParams.delete('job_payment');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data),
    enabled: tab === 'analytics',
  });

  const { data: employerProfile } = useQuery({
    queryKey: ['employer-profile'],
    queryFn: () => api.get('/employers/profile').then((r) => r.data),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionService.getStatus(),
  });

  const [paymentRedirecting, setPaymentRedirecting] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionService.cancel(),
    onSuccess: () => toast.success('Subscription will cancel at end of billing period'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Cancel failed'),
  });

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

  const STATUS_OPTIONS = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'] as const;
  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    REVIEWED: 'bg-blue-100 text-blue-700',
    SHORTLISTED: 'bg-purple-100 text-purple-700',
    REJECTED: 'bg-red-100 text-red-700',
    HIRED: 'bg-green-100 text-green-700',
  };

  // Check if employer is on DEMO plan and has a pending paid plan to complete
  const storedPendingPlan = typeof window !== 'undefined' ? localStorage.getItem('pendingPlan') : null;
  const needsPayment = subscription && subscription.plan_type === 'DEMO' && storedPendingPlan && ['PROFESSIONAL', 'ENTERPRISE'].includes(storedPendingPlan);

  const handleCompletePayment = async () => {
    if (!storedPendingPlan) return;
    setPaymentRedirecting(true);
    try {
      const checkout = await subscriptionService.createCheckout(storedPendingPlan);
      localStorage.removeItem('pendingPlan');
      if (checkout.url) {
        window.location.href = checkout.url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
      setPaymentRedirecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Paywall: force payment for pending paid plan */}
      {needsPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Complete Your Payment</h2>
            <p className="text-gray-600 mb-4">
              Your email is verified! Complete your{' '}
              <span className="font-bold text-blue-600">
                {storedPendingPlan === 'PROFESSIONAL' ? 'Professional' : 'Enterprise'}
              </span>{' '}
              plan payment to unlock all employer features.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You're currently on the Demo plan. Job posting, candidate contact reveals, and other features
              are only available with a paid subscription.
            </p>
            <button
              onClick={handleCompletePayment}
              disabled={paymentRedirecting}
              className="btn btn-primary w-full mb-3"
            >
              {paymentRedirecting ? 'Redirecting to Payment...' : 'Complete Payment Now'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('pendingPlan');
                window.location.reload();
              }}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              Continue on Demo plan instead
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Employer Dashboard</h1>
          <Link to="/post-job" className="btn btn-primary text-center">Post a Job</Link>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto space-x-1 bg-gray-200 rounded-lg p-1 mb-6 max-w-2xl">
          {(['jobs', 'applications', 'analytics', 'subscription'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                tab === t ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t === 'jobs' ? `Jobs (${jobs?.length || 0})` :
               t === 'applications' ? 'Apps' :
               t === 'analytics' ? 'Analytics' : 'Plan'}
            </button>
          ))}
        </div>

        {/* Response Rate & Reputation Banner */}
        {employerProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Response Rate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {parseFloat(employerProfile.response_rate || 0).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">
                  {employerProfile.total_applications_responded || 0} of {employerProfile.total_applications_received || 0} responded
                </div>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Reputation Score</div>
                <div className="text-2xl font-bold text-green-600">
                  {parseFloat(employerProfile.reputation_score || 0).toFixed(1)}
                  <span className="text-sm font-normal text-gray-400">/100</span>
                </div>
                <div className="text-xs text-gray-400">
                  {parseFloat(employerProfile.reputation_score || 0) >= 70 ? 'Excellent' :
                   parseFloat(employerProfile.reputation_score || 0) >= 40 ? 'Good' :
                   parseFloat(employerProfile.reputation_score || 0) > 0 ? 'Building' : 'New'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Jobs Tab */}
        {tab === 'jobs' && (
          <div className="space-y-4">
            {!jobs || jobs.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">
                <p className="mb-4">You haven't posted any jobs yet.</p>
                <Link to="/post-job" className="btn btn-primary">Post Your First Job</Link>
              </div>
            ) : (
              jobs.map((job: any) => (
                <div key={job.id} className="card">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                          job.status === 'PAUSED' ? 'bg-orange-100 text-orange-700' :
                          job.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      {job.status === 'PAUSED' && (
                        <p className="text-xs text-orange-600 mt-1">
                          This job was paused due to unresponded applications. Respond to pending applicants to reactivate.
                        </p>
                      )}
                      {job.status === 'EXPIRED' && (
                        <p className="text-xs text-red-600 mt-1">
                          This job expired after 28 days.
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                        <span>{job.emirate.replace(/_/g, ' ')}</span>
                        <span>{job.job_type.replace(/_/g, ' ')}</span>
                        <span>{job.views_count} views</span>
                        <span>{job.applications_count} applications</span>
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                        {job.expires_at && (
                          <span className={new Date(job.expires_at) < new Date() ? 'text-red-500' : ''}>
                            Expires {new Date(job.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setSelectedJobId(job.id); setTab('applications'); }}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200"
                      >
                        View Applications
                      </button>
                      {job.status === 'DRAFT' && (
                        <button
                          onClick={() => payForJob(job.id)}
                          disabled={isPaying}
                          className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200 font-medium"
                        >
                          Pay AED 100 & Publish
                        </button>
                      )}
                      {job.status === 'ACTIVE' && (
                        <button
                          onClick={() => closeJob(job.id)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-200"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Applications Tab */}
        {tab === 'applications' && (
          <div>
            {!selectedJobId ? (
              <div className="card text-center py-12 text-gray-500">
                Select a job from the "My Jobs" tab to view its applications.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <select
                    className="input"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    {jobs?.map((job: any) => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                </div>

                {!applications || applications.length === 0 ? (
                  <div className="card text-center py-12 text-gray-500">
                    No applications for this job yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app: any) => {
                      const deadlinePassed = app.response_deadline && new Date(app.response_deadline) < new Date();
                      const deadlineSoon = app.response_deadline && !deadlinePassed &&
                        (new Date(app.response_deadline).getTime() - Date.now()) < 2 * 24 * 60 * 60 * 1000;
                      return (
                      <div key={app.id} className="card">
                        {/* Response deadline warning */}
                        {app.status === 'PENDING' && deadlinePassed && (
                          <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3 text-sm text-red-700 flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                            </svg>
                            Response overdue! Respond now to avoid job being paused.
                          </div>
                        )}
                        {app.status === 'PENDING' && deadlineSoon && !deadlinePassed && (
                          <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3 text-sm text-amber-700 flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Response due by {new Date(app.response_deadline).toLocaleDateString()} — respond soon!
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{app.full_name}</h3>
                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-x-4 mt-1">
                              <a href={`mailto:${app.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {app.email}
                              </a>
                              {app.phone && (
                                <a href={`tel:${app.phone}`} className="text-sm text-green-600 hover:underline flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {app.phone}
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {app.job_title} &middot; {app.total_experience_years} yrs exp &middot; {app.current_emirate?.replace(/_/g, ' ')}
                            </p>
                            {app.cover_letter && (
                              <p className="text-sm text-gray-600 mt-2 italic">"{app.cover_letter}"</p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-gray-400">
                                Applied {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                              {app.status === 'PENDING' && app.response_deadline && (
                                <p className="text-xs text-gray-400">
                                  Respond by {new Date(app.response_deadline).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
                            <select
                              value={app.status}
                              onChange={(e) => updateStatus({ applicationId: app.id, status: e.target.value })}
                              className={`text-xs px-2 py-1 rounded border-0 cursor-pointer font-medium ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            {app.cv_url && (
                              <a
                                href={`${API_BASE}${app.cv_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Download CV
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <div>
            {!analytics ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="card">
                    <div className="text-sm text-gray-500">Total Jobs</div>
                    <div className="text-2xl font-bold text-blue-600">{analytics.jobs?.total || 0}</div>
                    <div className="text-xs text-gray-400">{analytics.jobs?.active || 0} active</div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-gray-500">Total Applications</div>
                    <div className="text-2xl font-bold text-green-600">{analytics.applications?.total || 0}</div>
                    <div className="text-xs text-gray-400">{analytics.applications?.pending || 0} pending</div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-gray-500">Total Views</div>
                    <div className="text-2xl font-bold text-purple-600">{analytics.totalViews || 0}</div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-gray-500">Hired</div>
                    <div className="text-2xl font-bold text-orange-600">{analytics.applications?.hired || 0}</div>
                  </div>
                </div>

                {/* Top Jobs */}
                <div className="card mb-6">
                  <h3 className="font-semibold mb-4">Top Jobs by Applications</h3>
                  {analytics.topJobs?.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topJobs.map((j: any) => (
                        <div key={j.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                          <span className="font-medium">{j.title}</span>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>{j.applications_count} apps</span>
                            <span>{j.views_count} views</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No job data yet.</p>
                  )}
                </div>

                {/* Daily Applications */}
                {analytics.dailyApplications?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold mb-4">Applications (Last 30 Days)</h3>
                    <div className="flex items-end gap-1 h-32">
                      {analytics.dailyApplications.map((d: any, i: number) => {
                        const max = Math.max(...analytics.dailyApplications.map((x: any) => parseInt(x.count)));
                        const height = max > 0 ? (parseInt(d.count) / max) * 100 : 0;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center group relative">
                            <div
                              className="w-full bg-blue-500 rounded-t min-h-[2px]"
                              style={{ height: `${height}%` }}
                            />
                            <div className="absolute -top-6 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded">
                              {d.count} on {new Date(d.date).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Subscription Tab */}
        {tab === 'subscription' && (
          <div>
            {!subscription ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="max-w-lg">
                <div className="card mb-6">
                  <h3 className="font-semibold mb-4">Current Plan</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-blue-600">{subscription.plan_type}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {subscription.status}
                    </span>
                    {subscription.cancel_at_period_end && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">Cancels at period end</span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Contact Reveals: {subscription.contact_reveals_used} / {subscription.contact_reveals_limit === -1 ? 'Unlimited' : subscription.contact_reveals_limit}</p>
                    {subscription.current_period_end && (
                      <p>Current period ends: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                    )}
                  </div>

                  {/* Contact Reveals Progress */}
                  {subscription.contact_reveals_limit > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (subscription.contact_reveals_used / subscription.contact_reveals_limit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link to="/pricing" className="btn btn-primary">
                    {subscription.plan_type === 'DEMO' ? 'Upgrade Plan' : 'Change Plan'}
                  </Link>
                  {subscription.plan_type !== 'DEMO' && !subscription.cancel_at_period_end && (
                    <button
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                      className="btn btn-secondary"
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
