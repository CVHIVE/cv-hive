import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useRegister } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { candidateService } from '../services/candidates';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';
import type { Emirate, VisaStatus } from '../types';

const STEPS = [
  'Account', 'Upload CV', 'Personal Details', 'Job Preferences',
  'Additional Info', 'Privacy', 'Verification',
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

const VISA_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: 'OWN_VISA', label: 'Own Visa' },
  { value: 'EMPLOYMENT_VISA', label: 'Employment Visa' },
  { value: 'SPOUSE_VISA', label: 'Spouse Visa' },
  { value: 'FREELANCE_PERMIT', label: 'Freelance Permit' },
  { value: 'VISIT_VISA', label: 'Visit Visa' },
];

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Construction & Engineering',
  'Hospitality & Tourism', 'Education', 'Marketing & Advertising', 'Real Estate',
  'Oil & Gas', 'Retail', 'Legal', 'HR & Recruitment', 'Logistics & Supply Chain',
  'Media & Communications', 'Government',
];

export default function Signup() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { mutateAsync: register, isPending: isRegistering } = useRegister();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  // CV upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [cvFilename, setCvFilename] = useState('');
  const [uploading, setUploading] = useState(false);

  // Personal details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentEmirate, setCurrentEmirate] = useState<Emirate>('DUBAI');
  const [visaStatus, setVisaStatus] = useState<VisaStatus>('OWN_VISA');

  // Job preferences
  const [desiredJobTitles, setDesiredJobTitles] = useState('');
  const [industry, setIndustry] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [preferredEmirate, setPreferredEmirate] = useState('');

  // Additional info
  const [education, setEducation] = useState('');
  const [totalExperience, setTotalExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('IMMEDIATE');

  // Privacy
  const [cvVisibility, setCvVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  const [saving, setSaving] = useState(false);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error('Please agree to the Terms & Privacy Policy'); return; }
    try {
      await register({ email, password });
      setStep(2);
    } catch {}
  };

  const handleUploadCV = async () => {
    if (!cvFile) return;
    setUploading(true);
    try {
      await candidateService.uploadCV(cvFile);
      setCvUploaded(true);
      setCvFilename(cvFile.name);
      toast.success('CV uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCV = async () => {
    try {
      await candidateService.removeCV();
      setCvUploaded(false);
      setCvFilename('');
      setCvFile(null);
      if (fileRef.current) fileRef.current.value = '';
      toast.success('CV removed');
    } catch (err: any) {
      toast.error('Failed to remove CV');
    }
  };

  const saveProfile = async (data: Record<string, any>) => {
    setSaving(true);
    try {
      await candidateService.updateProfile(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
      setSaving(false);
      return false;
    }
    setSaving(false);
    return true;
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveProfile({
      fullName, phone, currentEmirate, visaStatus,
    });
    if (ok) setStep(4);
  };

  const handleStep4 = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, any> = { desiredJobTitles, industry };
    if (salaryMin) data.salaryMin = Number(salaryMin);
    if (salaryMax) data.salaryMax = Number(salaryMax);
    if (preferredEmirate) data.preferredEmirate = preferredEmirate;
    const ok = await saveProfile(data);
    if (ok) setStep(5);
  };

  const handleStep5 = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, any> = { education, skills, noticePeriod };
    if (totalExperience) data.totalExperience = Number(totalExperience);
    const ok = await saveProfile(data);
    if (ok) setStep(6);
  };

  const handleStep6 = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveProfile({
      cvVisibility,
      profileVisible: cvVisibility === 'PUBLIC',
    });
    if (ok) setStep(7);
  };

  const handleResendVerification = async () => {
    try {
      await authService.resendVerification();
      toast.success('Verification email sent');
    } catch {
      toast.error('Failed to resend');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              return (
                <div key={label} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                      isDone ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isDone ? '\u2713' : stepNum}
                  </div>
                  <span className={`text-xs text-center hidden sm:block ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="card">
          {/* STEP 1: Account Creation */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-1">Create Your Account</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email and create a password to get started</p>

              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Min 8 characters" required minLength={8} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  I agree to the Terms of Service & Privacy Policy
                </label>
                <button type="submit" disabled={isRegistering} className="btn btn-primary w-full">
                  {isRegistering ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-sm text-gray-600 mb-3">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
                <Link to="/pricing" className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg transition text-sm">
                  Recruiter? Click here
                </Link>
              </div>
            </>
          )}

          {/* STEP 2: Upload CV */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-1">Upload Your CV</h2>
              <p className="text-gray-500 text-sm mb-6">Upload your CV so employers can find you. Supports PDF, DOC, DOCX.</p>

              {cvUploaded ? (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6 text-center">
                  <div className="text-green-600 text-4xl mb-2">&#10003;</div>
                  <p className="font-semibold text-green-800">CV Uploaded</p>
                  <p className="text-sm text-green-700 mt-1">{cvFilename}</p>
                  <div className="flex justify-center gap-3 mt-4">
                    <button onClick={handleRemoveCV} className="btn btn-secondary text-sm">Remove</button>
                    <button onClick={() => { handleRemoveCV(); }} className="btn btn-primary text-sm">Replace</button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <div className="text-gray-400 text-5xl mb-3">&#128196;</div>
                    <p className="text-gray-600 font-medium">Click to select your CV</p>
                    <p className="text-gray-400 text-sm mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                  </label>
                  {cvFile && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700">{cvFile.name}</p>
                      <button onClick={handleUploadCV} disabled={uploading} className="btn btn-primary mt-2">
                        {uploading ? 'Uploading...' : 'Upload CV'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-gray-700">
                  Skip for now
                </button>
                <button onClick={() => setStep(3)} className="btn btn-primary" disabled={!cvUploaded && !cvFile}>
                  Continue
                </button>
              </div>

              <div className="mt-4 text-center">
                <Link to="/pricing" className="text-sm text-blue-600 hover:underline">Recruiter? Click here</Link>
              </div>
            </>
          )}

          {/* STEP 3: Personal Details */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-1">Personal Details</h2>
              <p className="text-gray-500 text-sm mb-6">Tell us about yourself</p>

              <form onSubmit={handleStep3} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" required minLength={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+971 50 123 4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                  <select value={currentEmirate} onChange={(e) => setCurrentEmirate(e.target.value as Emirate)} className="input">
                    {EMIRATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visa Status</label>
                  <select value={visaStatus} onChange={(e) => setVisaStatus(e.target.value as VisaStatus)} className="input">
                    {VISA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
                  <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Continue'}</button>
                </div>
              </form>
            </>
          )}

          {/* STEP 4: Job Preferences */}
          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold mb-1">Job Preferences</h2>
              <p className="text-gray-500 text-sm mb-6">What kind of roles are you looking for?</p>

              <form onSubmit={handleStep4} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desired Job Titles</label>
                  <input type="text" value={desiredJobTitles} onChange={(e) => setDesiredJobTitles(e.target.value)} className="input" placeholder="e.g. Software Engineer, Product Manager" />
                  <p className="text-xs text-gray-400 mt-1">Separate multiple titles with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input">
                    <option value="">Select an industry</option>
                    {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (AED)</label>
                    <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className="input" placeholder="e.g. 10000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary (AED)</label>
                    <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className="input" placeholder="e.g. 25000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                  <select value={preferredEmirate} onChange={(e) => setPreferredEmirate(e.target.value)} className="input">
                    <option value="">Any</option>
                    {EMIRATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setStep(3)} className="btn btn-secondary">Back</button>
                  <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Continue'}</button>
                </div>
              </form>
            </>
          )}

          {/* STEP 5: Additional Info */}
          {step === 5 && (
            <>
              <h2 className="text-2xl font-bold mb-1">Additional Information</h2>
              <p className="text-gray-500 text-sm mb-6">Help employers understand your background</p>

              <form onSubmit={handleStep5} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} className="input" placeholder="e.g. Bachelor's in Computer Science" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Experience (years)</label>
                  <input type="number" value={totalExperience} onChange={(e) => setTotalExperience(e.target.value)} className="input" min="0" placeholder="e.g. 5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="input" placeholder="e.g. React, Node.js, Project Management" />
                  <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                  <select value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} className="input">
                    <option value="IMMEDIATE">Immediately available</option>
                    <option value="ONE_MONTH">1 Month</option>
                    <option value="TWO_TO_THREE_MONTHS">2-3 Months</option>
                    <option value="NOT_LOOKING">Not currently looking</option>
                  </select>
                </div>
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setStep(4)} className="btn btn-secondary">Back</button>
                  <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Continue'}</button>
                </div>
              </form>
            </>
          )}

          {/* STEP 6: Privacy Settings */}
          {step === 6 && (
            <>
              <h2 className="text-2xl font-bold mb-1">Privacy Settings</h2>
              <p className="text-gray-500 text-sm mb-6">Control who can see your profile</p>

              <form onSubmit={handleStep6} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">CV Visibility</label>
                  <div className="space-y-3">
                    <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${cvVisibility === 'PUBLIC' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                      <input type="radio" name="visibility" checked={cvVisibility === 'PUBLIC'} onChange={() => setCvVisibility('PUBLIC')} className="mt-1" />
                      <div>
                        <div className="font-semibold">Public</div>
                        <p className="text-sm text-gray-500">Your profile is visible to all registered employers searching for candidates</p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${cvVisibility === 'PRIVATE' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                      <input type="radio" name="visibility" checked={cvVisibility === 'PRIVATE'} onChange={() => setCvVisibility('PRIVATE')} className="mt-1" />
                      <div>
                        <div className="font-semibold">Private</div>
                        <p className="text-sm text-gray-500">Your profile is hidden from search. You can still apply to jobs.</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setStep(5)} className="btn btn-secondary">Back</button>
                  <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Continue'}</button>
                </div>
              </form>
            </>
          )}

          {/* STEP 7: Verification */}
          {step === 7 && (
            <>
              <div className="text-center py-4">
                <div className="text-6xl mb-4">&#9993;</div>
                <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
                <p className="text-gray-600 mb-2">We've sent a verification link to:</p>
                <p className="font-semibold text-lg text-blue-600 mb-6">{email}</p>
                <p className="text-sm text-gray-500 mb-6">Check your inbox and click the link to activate your account.</p>

                <div className="space-y-3">
                  <button onClick={handleResendVerification} className="btn btn-secondary w-full">
                    Resend Verification Email
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="btn btn-primary w-full">
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
