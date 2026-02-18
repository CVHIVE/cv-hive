import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { adminService } from '../services/admin';

type Tab = 'registers' | 'candidates' | 'employers' | 'cvs' | 'jobs';

interface UserRow {
  id: string;
  email: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

interface CandidateRow {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  job_title?: string;
  current_emirate?: string;
  visa_status?: string;
  total_experience_years?: number;
  availability_status?: string;
  cv_url?: string;
  registered_at: string;
}

interface EmployerRow {
  id: string;
  user_id: string;
  email: string;
  company_name: string;
  industry?: string;
  registered_at: string;
}

interface JobRow {
  id: string;
  title: string;
  company_name: string;
  industry?: string;
  job_type: string;
  emirate: string;
  status: string;
  views_count: number;
  applications_count: number;
  created_at: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'registers', label: 'New Registers' },
  { key: 'candidates', label: 'Candidates' },
  { key: 'employers', label: 'Employers' },
  { key: 'cvs', label: 'CVs' },
  { key: 'jobs', label: 'Jobs' },
];

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('registers');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [employers, setEmployers] = useState<EmployerRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState<{ userId: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, c, e, j] = await Promise.all([
        adminService.getUsers(),
        adminService.getCandidates(),
        adminService.getEmployers(),
        adminService.getJobs(),
      ]);
      setUsers(u);
      setCandidates(c);
      setEmployers(e);
      setJobs(j);
    } catch {
      toast.error('Failed to load admin data');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetModal || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      await adminService.resetPassword(resetModal.userId, newPassword);
      toast.success(`Password reset for ${resetModal.email}`);
      setResetModal(null);
      setNewPassword('');
    } catch {
      toast.error('Failed to reset password');
    }
    setResetting(false);
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(userId);
      toast.success(`Deleted ${email}`);
      loadData();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const q = search.toLowerCase();

  const filteredUsers = users.filter(
    (u) => u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  );

  const filteredCandidates = candidates.filter(
    (c) =>
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.job_title || '').toLowerCase().includes(q) ||
      (c.current_emirate || '').toLowerCase().includes(q)
  );

  const filteredEmployers = employers.filter(
    (e) =>
      e.company_name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.industry || '').toLowerCase().includes(q)
  );

  const candidatesWithCV = filteredCandidates.filter((c) => c.cv_url);

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(q) ||
      j.company_name.toLowerCase().includes(q) ||
      (j.industry || '').toLowerCase().includes(q) ||
      j.emirate.toLowerCase().includes(q)
  );

  if (loading) {
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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">
          {users.length} users &middot; {candidates.length} candidates &middot; {employers.length} employers &middot; {jobs.length} jobs
        </p>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(''); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                tab === t.key
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
              <span className="ml-1 text-xs text-gray-400">
                {t.key === 'registers' && `(${users.length})`}
                {t.key === 'candidates' && `(${candidates.length})`}
                {t.key === 'employers' && `(${employers.length})`}
                {t.key === 'cvs' && `(${candidates.filter((c) => c.cv_url).length})`}
                {t.key === 'jobs' && `(${jobs.length})`}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, email, role, job title..."
            className="input w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* New Registers Tab */}
        {tab === 'registers' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Verified</th>
                  <th className="pb-3 pr-4">Registered</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        u.role === 'EMPLOYER' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {u.email_verified ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-500">No</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setResetModal({ userId: u.id, email: u.email })}
                          className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                        >
                          Reset Password
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(u.id, u.email)}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Candidates Tab */}
        {tab === 'candidates' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Job Title</th>
                  <th className="pb-3 pr-4">Emirate</th>
                  <th className="pb-3 pr-4">Visa</th>
                  <th className="pb-3 pr-4">Experience</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium">{c.full_name}</td>
                    <td className="py-3 pr-4">{c.email}</td>
                    <td className="py-3 pr-4">{c.job_title || '—'}</td>
                    <td className="py-3 pr-4">{(c.current_emirate || '—').replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4">{(c.visa_status || '—').replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4">{c.total_experience_years != null ? `${c.total_experience_years} yrs` : '—'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => setResetModal({ userId: c.user_id, email: c.email })}
                        className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No candidates found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Employers Tab */}
        {tab === 'employers' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Company</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Industry</th>
                  <th className="pb-3 pr-4">Registered</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployers.map((e) => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium">{e.company_name}</td>
                    <td className="py-3 pr-4">{e.email}</td>
                    <td className="py-3 pr-4">{e.industry || '—'}</td>
                    <td className="py-3 pr-4 text-gray-500">
                      {new Date(e.registered_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setResetModal({ userId: e.user_id, email: e.email })}
                        className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEmployers.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No employers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* CVs Tab */}
        {tab === 'cvs' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Job Title</th>
                  <th className="pb-3 pr-4">Emirate</th>
                  <th className="pb-3">CV</th>
                </tr>
              </thead>
              <tbody>
                {candidatesWithCV.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium">{c.full_name}</td>
                    <td className="py-3 pr-4">{c.email}</td>
                    <td className="py-3 pr-4">{c.job_title || '—'}</td>
                    <td className="py-3 pr-4">{(c.current_emirate || '—').replace(/_/g, ' ')}</td>
                    <td className="py-3">
                      <a
                        href={`${API_BASE}${c.cv_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Download CV
                      </a>
                    </td>
                  </tr>
                ))}
                {candidatesWithCV.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No CVs uploaded yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Jobs Tab */}
        {tab === 'jobs' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Company</th>
                  <th className="pb-3 pr-4">Industry</th>
                  <th className="pb-3 pr-4">Emirate</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Views</th>
                  <th className="pb-3 pr-4">Apps</th>
                  <th className="pb-3">Posted</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((j) => (
                  <tr key={j.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium">{j.title}</td>
                    <td className="py-3 pr-4">{j.company_name}</td>
                    <td className="py-3 pr-4">{j.industry || '—'}</td>
                    <td className="py-3 pr-4">{j.emirate.replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4">{j.job_type.replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        j.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        j.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{j.views_count}</td>
                    <td className="py-3 pr-4 text-gray-500">{j.applications_count}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(j.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && (
                  <tr><td colSpan={9} className="py-8 text-center text-gray-400">No jobs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set a new password for <strong>{resetModal.email}</strong>
            </p>
            <input
              type="text"
              placeholder="New password (min 6 characters)"
              className="input w-full mb-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setResetModal(null); setNewPassword(''); }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetting || newPassword.length < 6}
                className="btn btn-primary"
              >
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
