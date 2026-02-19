import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CandidateNav from '../components/candidate/CandidateNav';
import { useAuthStore } from '../store/authStore';
import { useCandidateProfile, useUpdateCandidateProfile, useUploadCV, useRemoveCV } from '../hooks/useCandidates';
import { useCandidateApplications, useSavedJobs } from '../hooks/useJobs';
import { jobUrl } from '../utils/jobSlug';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';
import type { UpdateCandidatePayload, VisaStatus, Emirate, AvailabilityStatus } from '../types';

const VISA_LABELS: Record<VisaStatus, string> = {
  EMPLOYMENT_VISA: 'Employment Visa',
  OWN_VISA: 'Own Visa',
  SPOUSE_VISA: 'Spouse Visa',
  FREELANCE_PERMIT: 'Freelance Permit',
  VISIT_VISA: 'Visit Visa',
  CANCELLED_VISA: 'Cancelled Visa',
};

const EMIRATE_LABELS: Record<Emirate, string> = {
  DUBAI: 'Dubai',
  ABU_DHABI: 'Abu Dhabi',
  SHARJAH: 'Sharjah',
  AJMAN: 'Ajman',
  RAS_AL_KHAIMAH: 'Ras Al Khaimah',
  FUJAIRAH: 'Fujairah',
  UMM_AL_QUWAIN: 'Umm Al Quwain',
};

const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  IMMEDIATE: 'Immediate',
  ONE_MONTH: '1 Month',
  TWO_TO_THREE_MONTHS: '2-3 Months',
  NOT_LOOKING: 'Not Looking',
};

export default function CandidateDashboard() {
  const { candidate } = useAuthStore();
  const { data: profile, isLoading } = useCandidateProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateCandidateProfile();
  const { mutate: uploadCV, isPending: isUploading } = useUploadCV();
  const { mutate: removeCV, isPending: isRemoving } = useRemoveCV();
  const { data: applications } = useCandidateApplications();
  const { data: savedJobs } = useSavedJobs();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateCandidatePayload>({});

  const p = profile || candidate;

  const startEditing = () => {
    setForm({
      fullName: p?.full_name || '',
      phone: p?.phone || '',
      jobTitle: p?.job_title || '',
      professionalSummary: p?.professional_summary || '',
      visaStatus: p?.visa_status,
      currentEmirate: p?.current_emirate,
      availabilityStatus: p?.availability_status,
      totalExperience: p?.total_experience_years ?? undefined,
      salaryMin: p?.salary_min ?? undefined,
      salaryMax: p?.salary_max ?? undefined,
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateProfile(form, { onSuccess: () => setEditing(false) });
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadCV(file);
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>My Dashboard | CV Hive</title>
        <meta name="description" content="Manage your CV Hive profile, track applications, and update your settings." />
      </Helmet>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <CandidateNav />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold mb-8">
          Welcome back, {p?.full_name || 'Candidate'}!
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Visa Status</div>
            <div className="text-lg font-bold text-primary">
              {p?.visa_status ? VISA_LABELS[p.visa_status] : '—'}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Location</div>
            <div className="text-lg font-bold text-green-600">
              {p?.current_emirate ? EMIRATE_LABELS[p.current_emirate] : '—'}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Experience</div>
            <div className="text-lg font-bold text-purple-600">
              {p?.total_experience_years != null ? `${p.total_experience_years} years` : '—'}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Availability</div>
            <div className="text-lg font-bold text-orange-600">
              {p?.availability_status ? AVAILABILITY_LABELS[p.availability_status] : '—'}
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Profile Completeness</h3>
            <span className="text-sm font-bold text-primary">{p?.completeness_score || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className={`h-2.5 rounded-full transition-all ${
                (p?.completeness_score || 0) >= 80 ? 'bg-green-500' :
                (p?.completeness_score || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${p?.completeness_score || 0}%` }}
            />
          </div>
          {(p?.completeness_score || 0) < 100 && (() => {
            const missing: { label: string; action: string }[] = [];
            if (!p?.phone) missing.push({ label: 'Add phone number', action: 'phone' });
            if (!p?.job_title) missing.push({ label: 'Add job title', action: 'jobTitle' });
            if (!p?.visa_status) missing.push({ label: 'Set visa status', action: 'visa' });
            if (!p?.current_emirate) missing.push({ label: 'Set your location', action: 'emirate' });
            if (p?.total_experience_years == null) missing.push({ label: 'Add experience', action: 'experience' });
            if (!p?.cv_url) missing.push({ label: 'Upload your CV', action: 'cv' });
            if (!p?.availability_status) missing.push({ label: 'Set availability', action: 'availability' });
            if (missing.length === 0) return null;
            return (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-2">Complete these to boost your visibility:</p>
                <div className="flex flex-wrap gap-2">
                  {missing.map((m) => (
                    <button
                      key={m.action}
                      onClick={m.action === 'cv' ? () => fileInputRef.current?.click() : startEditing}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
          {(p?.completeness_score || 0) >= 100 && (
            <p className="text-sm text-green-600 font-medium">Your profile is complete!</p>
          )}
        </div>

        {/* Profile Details / Edit Form */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Profile Details</h3>
            {!editing ? (
              <button onClick={startEditing} className="btn btn-primary text-sm">
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button onClick={() => setEditing(false)} className="btn btn-secondary text-sm">Cancel</button>
                <button onClick={handleSave} disabled={isUpdating} className="btn btn-primary text-sm">
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  className="input"
                  value={form.fullName || ''}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  className="input"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  className="input"
                  value={form.jobTitle || ''}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <input
                  type="number"
                  className="input"
                  value={form.totalExperience ?? ''}
                  onChange={(e) => setForm({ ...form, totalExperience: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visa Status</label>
                <select
                  className="input"
                  value={form.visaStatus || ''}
                  onChange={(e) => setForm({ ...form, visaStatus: e.target.value as VisaStatus })}
                >
                  {Object.entries(VISA_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emirate</label>
                <select
                  className="input"
                  value={form.currentEmirate || ''}
                  onChange={(e) => setForm({ ...form, currentEmirate: e.target.value as Emirate })}
                >
                  {Object.entries(EMIRATE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  className="input"
                  value={form.availabilityStatus || ''}
                  onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value as AvailabilityStatus })}
                >
                  {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (AED)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    className="input"
                    placeholder="Min"
                    value={form.salaryMin ?? ''}
                    onChange={(e) => setForm({ ...form, salaryMin: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    className="input"
                    placeholder="Max"
                    value={form.salaryMax ?? ''}
                    onChange={(e) => setForm({ ...form, salaryMax: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea
                  className="input min-h-[100px]"
                  rows={4}
                  value={(form as any).professionalSummary || ''}
                  onChange={(e) => setForm({ ...form, professionalSummary: e.target.value } as any)}
                  placeholder="Brief summary of your experience, skills, and career goals..."
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {p?.professional_summary && (
                <div className="md:col-span-2 mb-2">
                  <span className="text-gray-500 block mb-1">Professional Summary:</span>
                  <p className="text-gray-800">{p.professional_summary}</p>
                </div>
              )}
              <div><span className="text-gray-500">Full Name:</span> {p?.full_name || '—'}</div>
              <div><span className="text-gray-500">Phone:</span> {p?.phone || '—'}</div>
              <div><span className="text-gray-500">Job Title:</span> {p?.job_title || '—'}</div>
              <div><span className="text-gray-500">Experience:</span> {p?.total_experience_years != null ? `${p.total_experience_years} years` : '—'}</div>
              <div><span className="text-gray-500">Visa Status:</span> {p?.visa_status ? VISA_LABELS[p.visa_status] : '—'}</div>
              <div><span className="text-gray-500">Emirate:</span> {p?.current_emirate ? EMIRATE_LABELS[p.current_emirate] : '—'}</div>
              <div><span className="text-gray-500">Availability:</span> {p?.availability_status ? AVAILABILITY_LABELS[p.availability_status] : '—'}</div>
              <div><span className="text-gray-500">Salary:</span> {p?.salary_min && p?.salary_max ? `AED ${p.salary_min.toLocaleString()} – ${p.salary_max.toLocaleString()}` : '—'}</div>
              <div>
                <span className="text-gray-500">CV:</span>{' '}
                {p?.cv_url ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-green-600 font-medium">
                      {p.cv_original_filename || 'Uploaded'}
                    </span>
                    <button
                      onClick={() => removeCV()}
                      disabled={isRemoving}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      {isRemoving ? 'Removing...' : 'Remove'}
                    </button>
                  </span>
                ) : 'Not uploaded'}
              </div>
              <div><span className="text-gray-500">Profile Visible:</span> {p?.profile_visible ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card hover:shadow-md transition">
            {p?.cv_url ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-500 text-xl">&#10003;</span>
                  <h3 className="font-semibold">CV Uploaded</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3 truncate">{p.cv_original_filename || 'Your CV'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary text-xs px-3 py-1"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => removeCV()}
                    disabled={isRemoving}
                    className="btn btn-secondary text-xs px-3 py-1"
                  >
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                <h3 className="font-semibold mb-2">Upload CV</h3>
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Uploading...' : 'Add your resume (PDF, DOC, DOCX — max 5MB)'}
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleCVUpload}
            />
          </div>
          <div onClick={startEditing} className="card hover:shadow-md transition cursor-pointer">
            <h3 className="font-semibold mb-2">Edit Profile</h3>
            <p className="text-sm text-gray-600">Update your information and skills</p>
          </div>
          <Link to="/jobs" className="card hover:shadow-md transition block">
            <h3 className="font-semibold mb-2">Find Jobs</h3>
            <p className="text-sm text-gray-600">Browse and apply to UAE job listings</p>
          </Link>
        </div>

        {/* My Applications */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-4">My Applications ({applications?.length || 0})</h3>
          {!applications || applications.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No applications yet. <Link to="/jobs" className="text-primary hover:underline">Browse jobs</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <Link to={jobUrl({ id: app.job_id, title: app.job_title, emirate: app.emirate })} className="font-medium text-primary hover:underline">
                      {app.job_title}
                    </Link>
                    <p className="text-sm text-gray-500">{app.company_name} &middot; {app.emirate?.replace(/_/g, ' ')}</p>
                    {app.employer_response_rate != null && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Employer response rate: <span className={`font-medium ${
                          parseFloat(app.employer_response_rate) >= 70 ? 'text-green-600' :
                          parseFloat(app.employer_response_rate) >= 40 ? 'text-yellow-600' : 'text-gray-500'
                        }`}>{parseFloat(app.employer_response_rate).toFixed(0)}%</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'REVIEWED' ? 'bg-primary-100 text-primary-700' :
                      app.status === 'SHORTLISTED' ? 'bg-purple-100 text-purple-700' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      app.status === 'HIRED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Jobs */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Saved Jobs ({savedJobs?.length || 0})</h3>
          {!savedJobs || savedJobs.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No saved jobs. <Link to="/jobs" className="text-primary hover:underline">Browse jobs</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {savedJobs.slice(0, 5).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <Link to={jobUrl(job)} className="font-medium text-primary hover:underline">
                      {job.title}
                    </Link>
                    <p className="text-sm text-gray-500">{job.company_name} &middot; {job.emirate?.replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Visibility Toggle */}
        <div className="card mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Profile Visibility</h3>
              <p className="text-sm text-gray-500 mt-1">
                {p?.profile_visible
                  ? 'Your profile is visible to employers in search results.'
                  : 'Your profile is hidden from employer search results. You can still apply to jobs.'}
              </p>
            </div>
            <button
              onClick={() => {
                const newVisible = !p?.profile_visible;
                updateProfile({
                  profileVisible: newVisible,
                  cvVisibility: newVisible ? 'PUBLIC' : 'PRIVATE',
                } as any);
              }}
              disabled={isUpdating}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                p?.profile_visible ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  p?.profile_visible ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Status: <span className={`font-medium ${p?.profile_visible ? 'text-green-600' : 'text-red-500'}`}>
              {p?.profile_visible ? 'Visible' : 'Private'}
            </span>
          </p>
        </div>

        {/* Change Password */}
        <ChangePasswordSection />

        {/* Delete Account */}
        <DeleteAccountSection />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-8">
      <h3 className="text-xl font-semibold mb-4">Change Password</h3>
      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input pr-16"
              required
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
              {showCurrent ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input pr-16"
              required
              minLength={8}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
              {showNew ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type={showNew ? 'text' : 'password'}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="input"
            required
            minLength={8}
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setLoading(true);
    try {
      await authService.deleteAccount(password);
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-8 border-red-200">
      <h3 className="text-xl font-semibold mb-2 text-red-600">Delete Account</h3>
      <p className="text-sm text-gray-600 mb-4">
        Permanently delete your account and all associated data including your profile, CV, applications, and saved jobs. This action cannot be undone.
      </p>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 font-medium"
      >
        Delete My Account
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-red-600 mb-2">Confirm Account Deletion</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete your account and all data. Enter your password and type <strong>DELETE</strong> to confirm.
            </p>
            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type DELETE to confirm</label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="input"
                  placeholder="DELETE"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setPassword(''); setConfirmText(''); }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || confirmText !== 'DELETE'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
