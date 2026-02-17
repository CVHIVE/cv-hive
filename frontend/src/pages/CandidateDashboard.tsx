import { useState, useRef } from 'react';
import Header from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';
import { useCandidateProfile, useUpdateCandidateProfile, useUploadCV } from '../hooks/useCandidates';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateCandidatePayload>({});

  const p = profile || candidate;

  const startEditing = () => {
    setForm({
      fullName: p?.full_name || '',
      phone: p?.phone || '',
      jobTitle: p?.job_title || '',
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
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome back, {p?.full_name || 'Candidate'}!
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Visa Status</div>
            <div className="text-lg font-bold text-blue-600">
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
          <h3 className="font-semibold mb-4">Profile Completeness</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${p?.completeness_score || 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {(p?.completeness_score || 0) < 100
              ? 'Complete your profile to increase visibility to employers.'
              : 'Your profile is complete!'}
          </p>
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Full Name:</span> {p?.full_name || '—'}</div>
              <div><span className="text-gray-500">Phone:</span> {p?.phone || '—'}</div>
              <div><span className="text-gray-500">Job Title:</span> {p?.job_title || '—'}</div>
              <div><span className="text-gray-500">Experience:</span> {p?.total_experience_years != null ? `${p.total_experience_years} years` : '—'}</div>
              <div><span className="text-gray-500">Visa Status:</span> {p?.visa_status ? VISA_LABELS[p.visa_status] : '—'}</div>
              <div><span className="text-gray-500">Emirate:</span> {p?.current_emirate ? EMIRATE_LABELS[p.current_emirate] : '—'}</div>
              <div><span className="text-gray-500">Availability:</span> {p?.availability_status ? AVAILABILITY_LABELS[p.availability_status] : '—'}</div>
              <div><span className="text-gray-500">Salary:</span> {p?.salary_min && p?.salary_max ? `AED ${p.salary_min.toLocaleString()} – ${p.salary_max.toLocaleString()}` : '—'}</div>
              <div><span className="text-gray-500">CV:</span> {p?.cv_url ? 'Uploaded' : 'Not uploaded'}</div>
              <div><span className="text-gray-500">Profile Visible:</span> {p?.profile_visible ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="card hover:shadow-md transition cursor-pointer"
          >
            <h3 className="font-semibold mb-2">Upload CV</h3>
            <p className="text-sm text-gray-600">
              {isUploading ? 'Uploading...' : 'Add or update your resume (PDF, DOC, DOCX — max 5MB)'}
            </p>
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
        </div>
      </div>
    </div>
  );
}
