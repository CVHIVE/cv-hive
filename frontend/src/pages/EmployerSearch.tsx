import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useSearchCandidates } from '../hooks/useCandidates';
import type { CandidateSearchFilters, Emirate, VisaStatus, AvailabilityStatus } from '../types';

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

export default function EmployerSearch() {
  const [filters, setFilters] = useState<CandidateSearchFilters>({ page: 1, limit: 20 });
  const [jobTitleInput, setJobTitleInput] = useState('');
  const { data, isLoading } = useSearchCandidates(filters);

  const handleSearch = () => {
    setFilters({ ...filters, jobTitle: jobTitleInput || undefined, page: 1 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
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

                <button
                  onClick={() => { setFilters({ page: 1, limit: 20 }); setJobTitleInput(''); }}
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
                  {data?.candidates.map((c) => (
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
                        </div>
                        <Link to={`/candidates/${c.profile_slug}`} className="flex-shrink-0">
                          <button className="btn btn-primary text-sm px-4">View Profile</button>
                        </Link>
                      </div>
                    </div>
                  ))}
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
