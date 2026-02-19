import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { usePublicProfile } from '../hooks/useCandidates';
import { useAuthStore } from '../store/authStore';
import { candidateService } from '../services/candidates';
import toast from 'react-hot-toast';
import type { RevealedContact } from '../types';

export default function CandidateProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { data: profile, isLoading, error } = usePublicProfile(slug || '');
  const { isAuthenticated, user } = useAuthStore();
  const [revealing, setRevealing] = useState(false);
  const [revealedData, setRevealedData] = useState<RevealedContact | null>(null);
  const isEmployer = isAuthenticated && (user?.role === 'EMPLOYER' || user?.role === 'ADMIN');

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

  const handleReveal = async () => {
    if (!profile?.id) return;
    setRevealing(true);
    try {
      const result = await candidateService.revealContact(profile.id);
      setRevealedData(result);
      toast.success('Contact details revealed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reveal contact');
    } finally {
      setRevealing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>{profile ? `${profile.full_name} | CV Hive` : 'Candidate Profile | CV Hive'}</title>
        <meta name="description" content="View candidate profile on CV Hive." />
      </Helmet>
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
          </div>
        )}

        {error && (
          <div className="card text-center py-12 text-gray-500">
            Profile not found or is not publicly visible.
          </div>
        )}

        {profile && (
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary font-bold text-3xl">
                {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                <p className="text-gray-600 text-lg">{profile.job_title || 'No title specified'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 block mb-1">Location</span>
                <span className="font-medium">{profile.current_emirate.replace(/_/g, ' ')}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 block mb-1">Visa Status</span>
                <span className="font-medium">{profile.visa_status.replace(/_/g, ' ')}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 block mb-1">Experience</span>
                <span className="font-medium">
                  {profile.total_experience_years != null ? `${profile.total_experience_years} years` : '—'}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 block mb-1">Availability</span>
                <span className="font-medium">{profile.availability_status.replace(/_/g, ' ')}</span>
              </div>
              {profile.salary_min != null && profile.salary_max != null && (
                <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2">
                  <span className="text-gray-500 block mb-1">Expected Salary</span>
                  <span className="font-medium">
                    AED {profile.salary_min.toLocaleString()} – {profile.salary_max.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Revealed contact info */}
            {revealedData && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3">Contact Details</h3>
                <div className="space-y-2 text-sm">
                  {revealedData.email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${revealedData.email}`} className="text-primary hover:underline">{revealedData.email}</a>
                    </div>
                  )}
                  {revealedData.phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${revealedData.phone}`} className="text-primary hover:underline">{revealedData.phone}</a>
                    </div>
                  )}
                  {revealedData.cv_url && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <a href={`${API_BASE}${revealedData.cv_url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Download CV</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reveal button for employers */}
            {isEmployer && !revealedData && (
              <div className="mt-6">
                <button
                  onClick={handleReveal}
                  disabled={revealing}
                  className="btn btn-primary"
                >
                  {revealing ? 'Revealing...' : 'Reveal Contact Details'}
                </button>
                <p className="text-xs text-gray-500 mt-2">Uses 1 contact reveal from your plan</p>
              </div>
            )}
            {!isAuthenticated && (
              <div className="mt-6">
                <p className="text-sm text-gray-500">Log in as an employer to reveal contact details.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
