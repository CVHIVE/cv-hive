import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useSearchCandidates } from '../hooks/useCandidates';
import { candidateService } from '../services/candidates';
import toast from 'react-hot-toast';
import type { CandidateSearchFilters, Emirate, VisaStatus, AvailabilityStatus, RevealedContact } from '../types';

const VISA_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: 'OWN_VISA', label: 'Own Visa' },
  { value: 'EMPLOYMENT_VISA', label: 'Employment Visa' },
  { value: 'SPOUSE_VISA', label: 'Spouse Visa' },
  { value: 'FREELANCE_PERMIT', label: 'Freelance Permit' },
  { value: 'VISIT_VISA', label: 'Visit Visa' },
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

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: 'IMMEDIATE', label: 'Immediate' },
  { value: 'ONE_MONTH', label: '1 Month' },
  { value: 'TWO_TO_THREE_MONTHS', label: '2-3 Months' },
];

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Construction & Engineering',
  'Hospitality & Tourism', 'Education', 'Marketing & Advertising', 'Real Estate',
  'Oil & Gas', 'Retail', 'Legal', 'HR & Recruitment', 'Logistics & Supply Chain',
  'Media & Communications', 'Government',
];

const DISTANCE_OPTIONS = [
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
  { value: 100, label: '100 miles' },
];

export default function EmployerSearch() {
  const [filters, setFilters] = useState<CandidateSearchFilters>({ page: 1, limit: 20 });
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [revealedMap, setRevealedMap] = useState<Record<string, RevealedContact>>({});
  const { data, isLoading } = useSearchCandidates(filters);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

  const handleReveal = async (candidateId: string) => {
    setRevealingId(candidateId);
    try {
      const result = await candidateService.revealContact(candidateId);
      setRevealedMap((prev) => ({ ...prev, [candidateId]: result }));
      toast.success('Contact revealed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reveal contact');
    } finally {
      setRevealingId(null);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, jobTitle: jobTitleInput || undefined, page: 1 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setJobTitleInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Search Candidates</h1>

        {/* Search Bar */}
        <div className="card mb-8">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search by job title or keywords..."
              className="input flex-1"
              value={jobTitleInput}
              onChange={(e) => setJobTitleInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSearch} className="btn btn-primary px-8">Search</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold mb-4">Filters</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Visa Status</h4>
                  <select
                    className="input"
                    value={filters.visaStatus || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, visaStatus: (e.target.value || undefined) as VisaStatus | undefined, page: 1 })
                    }
                  >
                    <option value="">All</option>
                    {VISA_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Emirate</h4>
                  <select
                    className="input"
                    value={filters.emirate || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, emirate: (e.target.value || undefined) as Emirate | undefined, page: 1 })
                    }
                  >
                    <option value="">All</option>
                    {EMIRATE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Availability</h4>
                  <select
                    className="input"
                    value={filters.availability || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, availability: (e.target.value || undefined) as AvailabilityStatus | undefined, page: 1 })
                    }
                  >
                    <option value="">All</option>
                    {AVAILABILITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Industry</h4>
                  <select
                    className="input"
                    value={filters.industry || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, industry: e.target.value || undefined, page: 1 })
                    }
                  >
                    <option value="">All</option>
                    {INDUSTRY_OPTIONS.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Experience (years)</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="input w-1/2"
                      value={filters.experienceMin || ''}
                      onChange={(e) => setFilters({ ...filters, experienceMin: Number(e.target.value) || undefined, page: 1 })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="input w-1/2"
                      value={filters.experienceMax || ''}
                      onChange={(e) => setFilters({ ...filters, experienceMax: Number(e.target.value) || undefined, page: 1 })}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Salary Range (AED)</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="input w-1/2"
                      value={filters.salaryMin || ''}
                      onChange={(e) => setFilters({ ...filters, salaryMin: Number(e.target.value) || undefined, page: 1 })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="input w-1/2"
                      value={filters.salaryMax || ''}
                      onChange={(e) => setFilters({ ...filters, salaryMax: Number(e.target.value) || undefined, page: 1 })}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Distance</h4>
                  <select
                    className="input"
                    value={filters.distance || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, distance: Number(e.target.value) || undefined, page: 1 })
                    }
                  >
                    <option value="">Any distance</option>
                    {DISTANCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="btn btn-secondary w-full text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {data?.pagination.total ?? 0} candidate{data?.pagination.total !== 1 ? 's' : ''} found
                </p>

                {data?.candidates.length === 0 && (
                  <div className="card text-center py-12 text-gray-500">
                    No candidates match your filters. Try adjusting your search.
                  </div>
                )}

                <div className="space-y-4">
                  {data?.candidates.map((c) => {
                    const revealed = revealedMap[c.id];
                    return (
                      <div key={c.id} className="card hover:shadow-md transition">
                        <div className="flex items-start space-x-4">
                          <div className="w-14 h-14 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xl">
                            {c.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{c.full_name}</h3>
                            <p className="text-gray-600">{c.job_title || 'No title specified'}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                              {c.total_experience_years != null && <span>{c.total_experience_years} years exp</span>}
                              <span>{c.current_emirate.replace(/_/g, ' ')}</span>
                              <span>{c.visa_status.replace(/_/g, ' ')}</span>
                              <span>{c.availability_status.replace(/_/g, ' ')}</span>
                            </div>

                            {/* Revealed contact info inline */}
                            {revealed && (
                              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                                <div className="flex flex-wrap gap-4">
                                  {revealed.email && (
                                    <a href={`mailto:${revealed.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                      {revealed.email}
                                    </a>
                                  )}
                                  {revealed.phone && (
                                    <a href={`tel:${revealed.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                      {revealed.phone}
                                    </a>
                                  )}
                                  {revealed.cv_url && (
                                    <a href={`${API_BASE}${revealed.cv_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                      Download CV
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Link to={`/candidates/${c.profile_slug}`}>
                              <button className="btn btn-primary text-sm px-4 w-full">View Profile</button>
                            </Link>
                            {!revealed ? (
                              <button
                                onClick={() => handleReveal(c.id)}
                                disabled={revealingId === c.id}
                                className="btn btn-secondary text-sm px-4"
                              >
                                {revealingId === c.id ? 'Revealing...' : 'Reveal'}
                              </button>
                            ) : (
                              <button disabled className="btn btn-secondary text-sm px-4 opacity-60">
                                Revealed
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-8">
                    <button
                      disabled={filters.page === 1}
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                      className="btn btn-secondary text-sm"
                    >
                      Previous
                    </button>
                    <span className="flex items-center text-sm text-gray-600">
                      Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <button
                      disabled={data.pagination.page >= data.pagination.totalPages}
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                      className="btn btn-secondary text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
