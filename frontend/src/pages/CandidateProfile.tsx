import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { usePublicProfile } from '../hooks/useCandidates';

export default function CandidateProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { data: profile, isLoading, error } = usePublicProfile(slug || '');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
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
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl">
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

            {profile.cv_url && (
              <div className="mt-6">
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Download CV
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
