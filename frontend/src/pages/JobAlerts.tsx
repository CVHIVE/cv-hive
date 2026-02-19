import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import CandidateNav from '../components/candidate/CandidateNav';
import { jobAlertService } from '../services/jobAlerts';
import toast from 'react-hot-toast';

const EMIRATES = ['DUBAI', 'ABU_DHABI', 'SHARJAH', 'AJMAN', 'RAS_AL_KHAIMAH', 'FUJAIRAH', 'UMM_AL_QUWAIN'];
const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP'];
const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'];

export default function JobAlerts() {
  const queryClient = useQueryClient();
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['job-alerts'],
    queryFn: () => jobAlertService.getAlerts(),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', industry: '', jobType: '', emirate: '', salaryMin: '', frequency: 'WEEKLY',
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => jobAlertService.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Job alert created!');
      setShowForm(false);
      setForm({ title: '', industry: '', jobType: '', emirate: '', salaryMin: '', frequency: 'WEEKLY' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create alert'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      jobAlertService.updateAlert(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobAlertService.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Alert deleted');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: form.title || undefined,
      industry: form.industry || undefined,
      jobType: form.jobType || undefined,
      emirate: form.emirate || undefined,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      frequency: form.frequency,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <CandidateNav />
            </div>
          </aside>
          <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Job Alerts</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : 'Create Alert'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h3 className="font-semibold mb-4">New Job Alert</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title Keywords</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Technology" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select className="input" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
                  <option value="">Any</option>
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emirate</label>
                <select className="input" value={form.emirate} onChange={(e) => setForm({ ...form, emirate: e.target.value })}>
                  <option value="">Any</option>
                  {EMIRATES.map((e) => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (AED)</label>
                <input type="number" className="input" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} placeholder="e.g. 15000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select className="input" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={createMutation.isPending} className="btn btn-primary">
                  {createMutation.isPending ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
          </div>
        ) : !alerts || alerts.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <p className="mb-2">No job alerts yet.</p>
            <p className="text-sm">Create an alert to get notified when matching jobs are posted.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: any) => (
              <div key={alert.id} className={`card ${!alert.is_active ? 'opacity-60' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold">{alert.title || 'All Jobs'}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${alert.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {alert.is_active ? 'Active' : 'Paused'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-700">
                        {alert.frequency}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      {alert.industry && <span>Industry: {alert.industry}</span>}
                      {alert.job_type && <span>Type: {alert.job_type.replace(/_/g, ' ')}</span>}
                      {alert.emirate && <span>Emirate: {alert.emirate.replace(/_/g, ' ')}</span>}
                      {alert.salary_min && <span>Min Salary: AED {alert.salary_min.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleMutation.mutate({ id: alert.id, isActive: !alert.is_active })}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200"
                    >
                      {alert.is_active ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(alert.id)}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
