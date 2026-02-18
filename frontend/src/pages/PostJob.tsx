import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useCreateJob } from '../hooks/useJobs';
import type { CreateJobPayload, Emirate, JobType } from '../types';

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Construction & Engineering',
  'Hospitality & Tourism', 'Education', 'Marketing & Advertising', 'Real Estate',
  'Oil & Gas', 'Retail', 'Legal', 'HR & Recruitment', 'Logistics & Supply Chain',
  'Media & Communications', 'Government',
];

const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const EMIRATE_OPTIONS: { value: Emirate; label: string }[] = [
  { value: 'DUBAI', label: 'Dubai' },
  { value: 'ABU_DHABI', label: 'Abu Dhabi' },
  { value: 'SHARJAH', label: 'Sharjah' },
  { value: 'AJMAN', label: 'Ajman' },
  { value: 'RAS_AL_KHAIMAH', label: 'Ras Al Khaimah' },
  { value: 'FUJAIRAH', label: 'Fujairah' },
  { value: 'UMM_AL_QUWAIN', label: 'Umm Al Quwain' },
];

export default function PostJob() {
  const navigate = useNavigate();
  const { mutate: createJob, isPending } = useCreateJob();
  const [form, setForm] = useState<CreateJobPayload>({
    title: '',
    description: '',
    industry: '',
    jobType: 'FULL_TIME',
    emirate: 'DUBAI',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJob(form, {
      onSuccess: () => navigate('/employer-dashboard'),
    });
  };

  const set = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Post a Job</h1>

        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                className="input w-full"
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                <select
                  className="input w-full"
                  required
                  value={form.industry}
                  onChange={(e) => set('industry', e.target.value)}
                >
                  <option value="">Select Industry</option>
                  {INDUSTRY_OPTIONS.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                <select
                  className="input w-full"
                  value={form.jobType}
                  onChange={(e) => set('jobType', e.target.value)}
                >
                  {JOB_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emirate *</label>
              <select
                className="input w-full"
                value={form.emirate}
                onChange={(e) => set('emirate', e.target.value)}
              >
                {EMIRATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min (AED)</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g. 15000"
                  value={form.salaryMin || ''}
                  onChange={(e) => set('salaryMin', Number(e.target.value) || undefined)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max (AED)</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g. 30000"
                  value={form.salaryMax || ''}
                  onChange={(e) => set('salaryMax', Number(e.target.value) || undefined)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience (years)</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g. 3"
                  value={form.experienceMin || ''}
                  onChange={(e) => set('experienceMin', Number(e.target.value) || undefined)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Experience (years)</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g. 8"
                  value={form.experienceMax || ''}
                  onChange={(e) => set('experienceMax', Number(e.target.value) || undefined)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
              <input
                className="input w-full"
                placeholder="e.g. React, Node.js, TypeScript"
                value={form.skills || ''}
                onChange={(e) => set('skills', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea
                className="input w-full h-48"
                required
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the role, responsibilities, requirements, and benefits..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/employer-dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="btn btn-primary px-8">
                {isPending ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
