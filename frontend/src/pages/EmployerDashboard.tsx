import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import { useEmployerJobs, useCloseJob, usePayForJob, useJobApplications, useUpdateApplicationStatus } from '../hooks/useJobs';
import api from '../services/api';
import { subscriptionService } from '../services/subscriptions';
import toast from 'react-hot-toast';

export default function EmployerDashboard() {
  const { data: jobs, isLoading } = useEmployerJobs();
  const { mutate: closeJob } = useCloseJob();
  const { mutate: payForJob, isPending: isPaying } = usePayForJob();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [tab, setTab] = useState<'jobs' | 'applications' | 'analytics' | 'subscription'>('jobs');
  const { data: applications } = useJobApplications(selectedJobId || '');
  const { mutate: updateStatus } = useUpdateApplicationStatus();

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data),
    enabled: tab === 'analytics',
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionService.getStatus(),
    enabled: tab === 'subscription',
  });

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <Link to="/post-job" className="btn btn-primary">Post a Job</Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-6 max-w-2xl">
          {(['jobs', 'applications', 'analytics', 'subscription'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                tab === t ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t === 'jobs' ? `My Jobs (${jobs?.length || 0})` :
               t === 'applications' ? 'Applications' :
               t === 'analytics' ? 'Analytics' : 'Subscription'}
            </button>
          ))}
        </div>

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
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                        <span>{job.emirate.replace(/_/g, ' ')}</span>
                        <span>{job.job_type.replace(/_/g, ' ')}</span>
                        <span>{job.views_count} views</span>
                        <span>{job.applications_count} applications</span>
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
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
                    {applications.map((app: any) => (
                      <div key={app.id} className="card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{app.full_name}</h3>
                            <p className="text-sm text-gray-600">{app.email}</p>
                            <p className="text-sm text-gray-500">
                              {app.job_title} &middot; {app.total_experience_years} yrs exp &middot; {app.current_emirate?.replace(/_/g, ' ')}
                            </p>
                            {app.cover_letter && (
                              <p className="text-sm text-gray-600 mt-2 italic">"{app.cover_letter}"</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Applied {new Date(app.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-4">
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
                    ))}
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
                    {subscription.plan_type === 'BASIC' ? 'Upgrade Plan' : 'Change Plan'}
                  </Link>
                  {subscription.plan_type !== 'BASIC' && !subscription.cancel_at_period_end && (
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
