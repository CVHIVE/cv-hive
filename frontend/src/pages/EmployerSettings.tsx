import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import api from '../services/api';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

export default function EmployerSettings() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['employer-profile'],
    queryFn: () => api.get('/employers/profile').then((r) => r.data),
  });

  const [form, setForm] = useState({
    companyName: '', industry: '', description: '', website: '',
    companySize: '', foundedYear: '', location: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.company_name || '',
        industry: profile.industry || '',
        description: profile.description || '',
        website: profile.website || '',
        companySize: profile.company_size || '',
        foundedYear: profile.founded_year?.toString() || '',
        location: profile.location || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) => api.put('/employers/profile', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
      toast.success('Profile updated!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const logoMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('logo', file);
      return api.post('/employers/logo', fd).then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
      toast.success('Logo updated!');
    },
    onError: () => toast.error('Failed to upload logo'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      ...form,
      foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
    });
  };

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Company Settings</h1>

        {/* Logo Upload */}
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">Company Logo</h3>
          <div className="flex items-center gap-4">
            {profile?.company_logo_url ? (
              <img src={`${API_BASE}${profile.company_logo_url}`} alt="Logo" className="w-20 h-20 rounded-lg object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary">
                {profile?.company_name?.charAt(0) || 'C'}
              </div>
            )}
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary text-sm"
                disabled={logoMutation.isPending}
              >
                {logoMutation.isPending ? 'Uploading...' : 'Upload Logo'}
              </button>
              <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) logoMutation.mutate(file);
                }}
              />
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card">
          <h3 className="font-semibold mb-4">Company Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Dubai, UAE" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <select className="input" value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })}>
                  <option value="">Select</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="50-200">50-200</option>
                  <option value="200-500">200-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                <input type="number" className="input" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} placeholder="2020" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell candidates about your company..." />
            </div>
            <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <ChangePasswordSection />
      </div>
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
    <div className="card mt-6">
      <h3 className="font-semibold mb-4">Change Password</h3>
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
