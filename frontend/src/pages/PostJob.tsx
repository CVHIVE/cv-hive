import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useCreateJob } from '../hooks/useJobs';
import { jobService } from '../services/jobs';
import toast from 'react-hot-toast';
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
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
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
      onSuccess: (job: any) => {
        setCreatedJobId(job.id);
      },
    });
  };

  const handlePay = async () => {
    if (!createdJobId) return;
    setIsRedirecting(true);
    try {
      const result = await jobService.payForJob(createdJobId);
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error('Failed to create checkout session');
        setIsRedirecting(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setIsRedirecting(false);
    }
  };

  const set = (field: string, value: any) => setForm({ ...form, [field]: value });

  // Payment step
  if (createdJobId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Job Created!</h2>
            <p className="text-gray-600 mb-6">
              Your job listing has been saved as a draft. Pay <span className="font-bold text-blue-600">AED 100</span> to publish it and start receiving applications.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2">What you get:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">&#10003;</span>
                  Job listing active for 28 days
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">&#10003;</span>
                  Visible to all job seekers
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">&#10003;</span>
                  Receive and manage applications
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">&#10003;</span>
                  Appears in search results and similar jobs
                </li>
              </ul>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You must respond to applicants within 7 days or the listing will be auto-paused.
                </p>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={isRedirecting}
              className="btn btn-primary w-full text-lg py-3 mb-3"
            >
              {isRedirecting ? 'Redirecting to payment...' : 'Pay AED 100 & Publish'}
            </button>
            <p className="text-xs text-gray-400 mb-3">Secure payment powered by Stripe</p>
            <button
              onClick={() => navigate('/employer-dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Save as draft and pay later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
        <p className="text-gray-600 mb-4">AED 100 per job posting &middot; Active for 28 days</p>

        {/* Expiration & Response Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Important: Job Posting Rules</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>&#8226; Your job listing will <strong>expire after 28 days</strong> from the date of publication.</li>
                <li>&#8226; You must <strong>respond to applicants within 7 days</strong> of their application or the job will be automatically paused.</li>
                <li>&#8226; Your response rate and reputation score are visible to candidates and affect your company's credibility.</li>
              </ul>
            </div>
          </div>
        </div>

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
                {isPending ? 'Creating...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
