import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { useJob, useApplyToJob, useSaveJob } from '../hooks/useJobs';
import { useAuthStore } from '../store/authStore';
import { extractJobId, jobUrl } from '../utils/jobSlug';
import api from '../services/api';

export default function JobDetail() {
  const { id: slugParam } = useParams<{ id: string }>();
  const id = extractJobId(slugParam || '');
  const { data: job, isLoading } = useJob(id || '');
  const { mutate: apply, isPending: isApplying } = useApplyToJob();
  const { mutate: save } = useSaveJob();
  const { isAuthenticated, user } = useAuthStore();
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  const { data: similarJobs } = useQuery({
    queryKey: ['jobs', id, 'similar'],
    queryFn: () => api.get(`/jobs/${id}/similar`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <Link to="/jobs" className="text-primary hover:underline">Back to job search</Link>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    apply({ id: job.id, coverLetter: coverLetter || undefined }, {
      onSuccess: () => setShowApplyForm(false),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>{job.title} at {job.company_name} | CV Hive</title>
        <meta name="description" content={`Apply for ${job.title} at ${job.company_name} in ${job.emirate?.replace(/_/g, ' ')}. View salary, requirements, and apply on CV Hive.`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: job.title,
            description: job.description,
            datePosted: job.created_at,
            ...(job.expires_at && { validThrough: job.expires_at }),
            employmentType: job.job_type === 'FULL_TIME' ? 'FULL_TIME' : job.job_type === 'PART_TIME' ? 'PART_TIME' : job.job_type === 'CONTRACT' ? 'CONTRACTOR' : job.job_type === 'INTERNSHIP' ? 'INTERN' : 'OTHER',
            hiringOrganization: {
              '@type': 'Organization',
              name: job.company_name,
              sameAs: `${window.location.origin}/companies/${job.company_slug || ''}`,
            },
            jobLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                addressLocality: job.emirate?.replace(/_/g, ' '),
                addressCountry: 'AE',
              },
            },
            ...(!job.salary_hidden && job.salary_min && job.salary_max && {
              baseSalary: {
                '@type': 'MonetaryAmount',
                currency: 'AED',
                value: {
                  '@type': 'QuantitativeValue',
                  minValue: job.salary_min,
                  maxValue: job.salary_max,
                  unitText: 'MONTH',
                },
              },
            }),
            ...(job.industry && { industry: job.industry }),
            ...(job.skills && { skills: job.skills }),
          })}
        </script>
      </Helmet>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Link to="/jobs" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <p className="text-lg text-gray-700 font-medium mb-4">{job.company_name}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                  {job.emirate.replace(/_/g, ' ')}
                </span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  {job.job_type.replace(/_/g, ' ')}
                </span>
                {!job.salary_hidden && job.salary_min && job.salary_max && (
                  <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    AED {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                  </span>
                )}
                {job.industry && (
                  <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {job.industry}
                  </span>
                )}
              </div>

              {job.experience_min != null && (
                <p className="text-sm text-gray-600 mb-4">
                  Experience: {job.experience_min} - {job.experience_max} years
                </p>
              )}

              {job.skills && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.split(',').map((s: string) => (
                      <span key={s} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Job Description</h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Apply Section */}
            {showApplyForm && (
              <div className="card mt-6">
                <h3 className="font-semibold mb-3">Apply to this job</h3>
                <textarea
                  className="input w-full h-32 mb-4"
                  placeholder="Cover letter (optional) - Tell the employer why you're a great fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <div className="flex space-x-2">
                  <button onClick={handleApply} disabled={isApplying} className="btn btn-primary">
                    {isApplying ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button onClick={() => setShowApplyForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              {isAuthenticated && user?.role === 'CANDIDATE' && job.status === 'ACTIVE' && (
                <div className="space-y-3 mb-6">
                  {!showApplyForm && (
                    <button
                      onClick={() => setShowApplyForm(true)}
                      className="btn btn-primary w-full"
                    >
                      Apply Now
                    </button>
                  )}
                  <button
                    onClick={() => save(job.id)}
                    className="btn btn-secondary w-full"
                  >
                    Save Job
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="mb-6">
                  <Link to="/login" className="btn btn-primary w-full block text-center">
                    Login to Apply
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    <Link to="/signup" className="text-primary hover:underline">Or create an account</Link>
                  </p>
                </div>
              )}

              <h3 className="font-semibold mb-3">Company Info</h3>
              <div className="text-sm space-y-2 text-gray-600">
                <p><span className="text-gray-500">Company:</span> {job.company_name}</p>
                {job.company_industry && (
                  <p><span className="text-gray-500">Industry:</span> {job.company_industry}</p>
                )}
              </div>

              {/* Employer Response Rate */}
              <div className="border-t mt-4 pt-4">
                <h3 className="font-semibold mb-3">Employer Responsiveness</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Response Rate</span>
                      <span className={`font-medium ${
                        parseFloat(job.response_rate || 0) >= 70 ? 'text-green-600' :
                        parseFloat(job.response_rate || 0) >= 40 ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {parseFloat(job.response_rate || 0).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          parseFloat(job.response_rate || 0) >= 70 ? 'bg-green-500' :
                          parseFloat(job.response_rate || 0) >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(100, parseFloat(job.response_rate || 0))}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Reputation</span>
                      <span className={`font-medium ${
                        parseFloat(job.reputation_score || 0) >= 70 ? 'text-green-600' :
                        parseFloat(job.reputation_score || 0) >= 40 ? 'text-primary' : 'text-gray-500'
                      }`}>
                        {parseFloat(job.reputation_score || 0).toFixed(1)}/100
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {parseFloat(job.reputation_score || 0) >= 70 ? 'Highly responsive employer' :
                       parseFloat(job.reputation_score || 0) >= 40 ? 'Good track record' :
                       parseFloat(job.reputation_score || 0) > 0 ? 'Building reputation' : 'New employer'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <h3 className="font-semibold mb-3">Job Stats</h3>
                <div className="text-sm space-y-2 text-gray-600">
                  <p><span className="text-gray-500">Views:</span> {job.views_count}</p>
                  <p><span className="text-gray-500">Applications:</span> {job.applications_count}</p>
                  <p><span className="text-gray-500">Posted:</span> {new Date(job.created_at).toLocaleDateString()}</p>
                  {job.expires_at && (
                    <p><span className="text-gray-500">Expires:</span> {new Date(job.expires_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {similarJobs && similarJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Similar Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similarJobs.map((sj: any) => (
                <Link key={sj.id} to={jobUrl(sj)} className="card hover:shadow-md transition block">
                  <h3 className="font-semibold text-primary">{sj.title}</h3>
                  <p className="text-sm text-gray-600">{sj.company_name}</p>
                  <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 mt-1">
                    <span>{sj.emirate?.replace(/_/g, ' ')}</span>
                    <span>{sj.job_type?.replace(/_/g, ' ')}</span>
                    {!sj.salary_hidden && sj.salary_min && sj.salary_max && (
                      <span>AED {sj.salary_min.toLocaleString()} - {sj.salary_max.toLocaleString()}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
