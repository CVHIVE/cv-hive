import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { adminService } from '../services/admin';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  EXPIRED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const PLAN_COLORS: Record<string, string> = {
  DEMO: 'bg-gray-100 text-gray-700',
  PROFESSIONAL: 'bg-primary-100 text-primary-700',
  ENTERPRISE: 'bg-purple-100 text-purple-700',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'users' | 'candidates' | 'employers' | 'jobs'>('overview');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
  });

  const { data: activity } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => adminService.getActivity(),
    enabled: tab === 'overview',
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers(),
    enabled: tab === 'users',
  });

  const { data: candidates } = useQuery({
    queryKey: ['admin-candidates'],
    queryFn: () => adminService.getCandidates(),
    enabled: tab === 'candidates',
  });

  const { data: employers } = useQuery({
    queryKey: ['admin-employers'],
    queryFn: () => adminService.getEmployers(),
    enabled: tab === 'employers',
  });

  const { data: jobs } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => adminService.getJobs(),
    enabled: tab === 'jobs',
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-candidates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-employers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const jobStatusMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: string }) => adminService.updateJobStatus(jobId, status),
    onSuccess: () => {
      toast.success('Job status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const subMutation = useMutation({
    mutationFn: ({ employerId, planType }: { employerId: string; planType: string }) =>
      adminService.updateEmployerSubscription(employerId, planType),
    onSuccess: () => {
      toast.success('Subscription updated');
      queryClient.invalidateQueries({ queryKey: ['admin-employers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'users' as const, label: `Users (${stats?.totalUsers || 0})` },
    { key: 'candidates' as const, label: `Candidates (${stats?.totalCandidates || 0})` },
    { key: 'employers' as const, label: `Employers (${stats?.totalEmployers || 0})` },
    { key: 'jobs' as const, label: `Jobs (${stats?.totalJobs || 0})` },
  ];

  const filterItems = (items: any[] | undefined, fields: string[]) => {
    if (!items) return [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item: any) => fields.some((f) => item[f]?.toString().toLowerCase().includes(q)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Admin Dashboard | CV Hive</title>
      </Helmet>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex overflow-x-auto space-x-1 bg-gray-200 rounded-lg p-1 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(''); }}
              className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                tab === t.key ? 'bg-white text-primary shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-primary-50 text-primary' },
                { label: 'Candidates', value: stats?.totalCandidates || 0, icon: '📄', color: 'bg-green-50 text-green-600' },
                { label: 'Employers', value: stats?.totalEmployers || 0, icon: '🏢', color: 'bg-purple-50 text-purple-600' },
                { label: 'Active Jobs', value: stats?.activeJobs || 0, icon: '💼', color: 'bg-orange-50 text-orange-600' },
                { label: 'Total Jobs', value: stats?.totalJobs || 0, icon: '📋', color: 'bg-blue-50 text-blue-600' },
                { label: 'Applications', value: stats?.totalApplications || 0, icon: '📨', color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Paid Postings', value: stats?.paidJobPostings || 0, icon: '💳', color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Est. Revenue', value: `AED ${((stats?.paidJobPostings || 0) * 100).toLocaleString()}`, icon: '💰', color: 'bg-yellow-50 text-yellow-600' },
              ].map((stat) => (
                <div key={stat.label} className={`card ${stat.color} border-0`}>
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-70">{stat.label}</div>
                </div>
              ))}
            </div>

            {stats?.subscriptionBreakdown && stats.subscriptionBreakdown.length > 0 && (
              <div className="card mb-8">
                <h3 className="font-semibold mb-3">Subscription Breakdown</h3>
                <div className="flex flex-wrap gap-4">
                  {stats.subscriptionBreakdown.map((sub: any) => (
                    <div key={sub.plan_type} className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${PLAN_COLORS[sub.plan_type] || 'bg-gray-100 text-gray-700'}`}>
                        {sub.plan_type}
                      </span>
                      <span className="text-sm text-gray-600">{sub.count} employers</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              {!activity || activity.length === 0 ? (
                <p className="text-sm text-gray-500">No recent activity</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activity.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-sm border-b border-gray-100 pb-2 last:border-0">
                      <span className="text-lg">
                        {item.type === 'user_registered' ? '👤' :
                         item.type === 'job_posted' ? '💼' : '📩'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">
                          {item.type === 'user_registered' ? 'New registration' :
                           item.type === 'job_posted' ? 'Job posted' : 'Application submitted'}
                        </span>
                        <span className="text-gray-500"> — {item.detail}</span>
                        {item.meta && <span className="text-gray-400 text-xs ml-1">({item.meta})</span>}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div>
            <input type="text" placeholder="Search by email or role..." value={search} onChange={(e) => setSearch(e.target.value)} className="input mb-4 max-w-md" />
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Verified</th>
                    <th className="pb-2 pr-4">Registered</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterItems(users, ['email', 'role']).map((u: any) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium">{u.email}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                          u.role === 'EMPLOYER' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{u.role}</span>
                      </td>
                      <td className="py-2 pr-4">
                        {u.email_verified ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-2">
                        {u.role !== 'ADMIN' && (
                          <button onClick={() => { if (window.confirm(`Delete ${u.email}?`)) deleteMutation.mutate(u.id); }} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {tab === 'candidates' && (
          <div>
            <input type="text" placeholder="Search by name, email, or job title..." value={search} onChange={(e) => setSearch(e.target.value)} className="input mb-4 max-w-md" />
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Job Title</th>
                    <th className="pb-2 pr-4">Emirate</th>
                    <th className="pb-2 pr-4">Experience</th>
                    <th className="pb-2 pr-4">Registered</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterItems(candidates, ['full_name', 'email', 'job_title']).map((c: any) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium">{c.full_name}</td>
                      <td className="py-2 pr-4 text-gray-500">{c.email}</td>
                      <td className="py-2 pr-4">{c.job_title || '—'}</td>
                      <td className="py-2 pr-4">{c.current_emirate?.replace(/_/g, ' ') || '—'}</td>
                      <td className="py-2 pr-4">{c.total_experience_years ? `${c.total_experience_years}y` : '—'}</td>
                      <td className="py-2 pr-4 text-gray-500">{new Date(c.registered_at).toLocaleDateString()}</td>
                      <td className="py-2">
                        <button onClick={() => { if (window.confirm(`Delete candidate ${c.full_name}?`)) deleteMutation.mutate(c.user_id); }} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employers Tab */}
        {tab === 'employers' && (
          <div>
            <input type="text" placeholder="Search by company name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input mb-4 max-w-md" />
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4">Company</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Industry</th>
                    <th className="pb-2 pr-4">Plan</th>
                    <th className="pb-2 pr-4">Reveals</th>
                    <th className="pb-2 pr-4">Registered</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterItems(employers, ['company_name', 'email', 'industry']).map((emp: any) => (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium">{emp.company_name}</td>
                      <td className="py-2 pr-4 text-gray-500">{emp.email}</td>
                      <td className="py-2 pr-4">{emp.industry || '—'}</td>
                      <td className="py-2 pr-4">
                        <select value={emp.plan_type || 'DEMO'} onChange={(e) => subMutation.mutate({ employerId: emp.id, planType: e.target.value })} className="text-xs px-2 py-1 rounded border border-gray-200 bg-white cursor-pointer">
                          <option value="DEMO">DEMO</option>
                          <option value="PROFESSIONAL">PROFESSIONAL</option>
                          <option value="ENTERPRISE">ENTERPRISE</option>
                        </select>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">
                        {emp.contact_reveals_used || 0}/{emp.contact_reveals_limit === -1 ? '∞' : (emp.contact_reveals_limit || 0)}
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{new Date(emp.registered_at).toLocaleDateString()}</td>
                      <td className="py-2">
                        <button onClick={() => { if (window.confirm(`Delete ${emp.company_name}?`)) deleteMutation.mutate(emp.user_id); }} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {tab === 'jobs' && (
          <div>
            <input type="text" placeholder="Search by title or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="input mb-4 max-w-md" />
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4">Title</th>
                    <th className="pb-2 pr-4">Company</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Views</th>
                    <th className="pb-2 pr-4">Apps</th>
                    <th className="pb-2 pr-4">Posted</th>
                    <th className="pb-2 pr-4">Expires</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterItems(jobs, ['title', 'company_name']).map((job: any) => (
                    <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium max-w-[200px] truncate">{job.title}</td>
                      <td className="py-2 pr-4 text-gray-500">{job.company_name}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>{job.status}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{job.views_count}</td>
                      <td className="py-2 pr-4 text-gray-500">{job.applications_count}</td>
                      <td className="py-2 pr-4 text-gray-500">{new Date(job.created_at).toLocaleDateString()}</td>
                      <td className="py-2 pr-4 text-gray-500">{job.expires_at ? new Date(job.expires_at).toLocaleDateString() : '—'}</td>
                      <td className="py-2">
                        <select value={job.status} onChange={(e) => jobStatusMutation.mutate({ jobId: job.id, status: e.target.value })} className="text-xs px-2 py-1 rounded border border-gray-200 bg-white cursor-pointer">
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PAUSED">PAUSED</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="EXPIRED">EXPIRED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
