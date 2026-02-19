import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useSearchJobs } from '../hooks/useJobs';
import { jobUrl } from '../utils/jobSlug';

const INDUSTRIES: Record<string, { title: string; description: string; icon: string }> = {
  'accountancy': { title: 'Accountancy', description: 'Find accounting, audit, tax and finance jobs across the UAE.', icon: '📊' },
  'admin-office-support': { title: 'Admin & Office Support', description: 'Discover administrative, reception, and office management roles.', icon: '🏢' },
  'automotive': { title: 'Automotive', description: 'Explore automotive sales, engineering, and service jobs.', icon: '🚗' },
  'aviation-aerospace': { title: 'Aviation & Aerospace', description: 'Browse aviation, airline, and aerospace industry positions.', icon: '✈️' },
  'cleaning-facilities': { title: 'Cleaning & Facilities', description: 'Find cleaning, maintenance, and facilities management jobs.', icon: '🧹' },
  'consulting': { title: 'Consulting', description: 'Discover management consulting, strategy, and advisory roles.', icon: '💼' },
  'construction-engineering': { title: 'Construction & Engineering', description: 'Explore construction, civil engineering, and project management jobs.', icon: '🏗️' },
  'customer-service': { title: 'Customer Service', description: 'Find customer support, call centre, and client relations roles.', icon: '🎧' },
  'design-creative': { title: 'Design & Creative', description: 'Browse graphic design, UX/UI, and creative director positions.', icon: '🎨' },
  'education': { title: 'Education', description: 'Discover teaching, training, and academic roles across the UAE.', icon: '📚' },
  'engineering': { title: 'Engineering', description: 'Find mechanical, electrical, and chemical engineering jobs.', icon: '⚙️' },
  'environmental': { title: 'Environmental', description: 'Explore sustainability, environmental science, and green energy jobs.', icon: '🌿' },
  'finance-banking': { title: 'Finance & Banking', description: 'Browse banking, investment, insurance, and fintech roles.', icon: '🏦' },
  'government': { title: 'Government', description: 'Find public sector and government agency positions.', icon: '🏛️' },
  'healthcare': { title: 'Healthcare', description: 'Discover medical, nursing, pharmaceutical, and healthcare roles.', icon: '🏥' },
  'hospitality-tourism': { title: 'Hospitality & Tourism', description: 'Explore hotel, restaurant, travel, and tourism industry jobs.', icon: '🏨' },
  'hr-recruitment': { title: 'HR & Recruitment', description: 'Find human resources, talent acquisition, and recruitment roles.', icon: '👥' },
  'insurance': { title: 'Insurance', description: 'Browse insurance underwriting, claims, and brokerage jobs.', icon: '🛡️' },
  'legal': { title: 'Legal', description: 'Discover legal counsel, paralegal, and compliance positions.', icon: '⚖️' },
  'logistics-supply-chain': { title: 'Logistics & Supply Chain', description: 'Find logistics, warehousing, and supply chain management roles.', icon: '📦' },
  'manufacturing': { title: 'Manufacturing', description: 'Explore manufacturing, production, and quality control jobs.', icon: '🏭' },
  'marketing-advertising': { title: 'Marketing & Advertising', description: 'Browse digital marketing, brand management, and advertising roles.', icon: '📈' },
  'media-communications': { title: 'Media & Communications', description: 'Find journalism, PR, broadcasting, and content creation jobs.', icon: '📺' },
  'oil-gas': { title: 'Oil & Gas', description: 'Discover petroleum engineering, drilling, and energy sector jobs.', icon: '🛢️' },
  'procurement-purchasing': { title: 'Procurement & Purchasing', description: 'Explore procurement, purchasing, and vendor management roles.', icon: '📋' },
  'real-estate': { title: 'Real Estate', description: 'Find property sales, leasing, and real estate development jobs.', icon: '🏠' },
  'retail': { title: 'Retail', description: 'Browse retail management, sales, and merchandising positions.', icon: '🛍️' },
  'sales-business-development': { title: 'Sales & Business Development', description: 'Discover sales, account management, and business development roles.', icon: '🤝' },
  'science-research': { title: 'Science & Research', description: 'Find scientific research, laboratory, and R&D positions.', icon: '🔬' },
  'security-safety': { title: 'Security & Safety', description: 'Explore security, HSE, and occupational safety roles.', icon: '🔒' },
  'telecoms': { title: 'Telecoms', description: 'Browse telecommunications and network engineering jobs.', icon: '📡' },
  'technology': { title: 'Technology', description: 'Find software development, IT, cybersecurity, and tech leadership roles.', icon: '💻' },
};

// Map slug back to the industry filter value used by job search
const SLUG_TO_FILTER: Record<string, string> = {
  'accountancy': 'Accountancy',
  'admin-office-support': 'Admin & Office Support',
  'automotive': 'Automotive',
  'aviation-aerospace': 'Aviation & Aerospace',
  'cleaning-facilities': 'Cleaning & Facilities',
  'consulting': 'Consulting',
  'construction-engineering': 'Construction & Engineering',
  'customer-service': 'Customer Service',
  'design-creative': 'Design & Creative',
  'education': 'Education',
  'engineering': 'Engineering',
  'environmental': 'Environmental',
  'finance-banking': 'Finance & Banking',
  'government': 'Government',
  'healthcare': 'Healthcare',
  'hospitality-tourism': 'Hospitality & Tourism',
  'hr-recruitment': 'HR & Recruitment',
  'insurance': 'Insurance',
  'legal': 'Legal',
  'logistics-supply-chain': 'Logistics & Supply Chain',
  'manufacturing': 'Manufacturing',
  'marketing-advertising': 'Marketing & Advertising',
  'media-communications': 'Media & Communications',
  'oil-gas': 'Oil & Gas',
  'procurement-purchasing': 'Procurement & Purchasing',
  'real-estate': 'Real Estate',
  'retail': 'Retail',
  'sales-business-development': 'Sales & Business Development',
  'science-research': 'Science & Research',
  'security-safety': 'Security & Safety',
  'telecoms': 'Telecoms',
  'technology': 'Technology',
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// List page - shows all industries
export function IndustryJobsList() {
  const industries = Object.entries(INDUSTRIES);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Browse Jobs by Industry | UAE Jobs | CV Hive</title>
        <meta name="description" content="Browse UAE job listings by industry. Find jobs in technology, healthcare, finance, construction, hospitality, and 25+ more sectors." />
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">Jobs by Industry</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Browse {industries.length} industry sectors across the UAE. Find opportunities in your field.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map(([slug, info]) => (
              <Link
                key={slug}
                to={`/jobs/industry/${slug}`}
                className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{info.title} Jobs</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{info.description.split('.')[0]}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Detail page - shows jobs for a specific industry
export default function IndustryJobs() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? INDUSTRIES[slug] : null;
  const filterValue = slug ? SLUG_TO_FILTER[slug] : '';

  const { data, isLoading } = useSearchJobs({
    industry: filterValue || undefined,
    page: 1,
    limit: 20,
  });

  if (!industry) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Industry Not Found</h1>
            <p className="text-gray-500 mb-4">The industry you're looking for doesn't exist.</p>
            <Link to="/jobs/industry" className="btn btn-primary">Browse All Industries</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const jobs = data?.jobs || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{industry.title} Jobs in UAE | CV Hive</title>
        <meta name="description" content={`Find ${industry.title.toLowerCase()} jobs in the UAE. ${industry.description} Browse ${total}+ live vacancies on CV Hive.`} />
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-4xl mb-4 block">{industry.icon}</span>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">{industry.title} Jobs</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{industry.description}</p>
            {!isLoading && <p className="text-primary-200 mt-4 text-sm">{total} jobs found</p>}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No {industry.title.toLowerCase()} jobs available right now.</p>
              <Link to="/jobs" className="btn btn-primary">Search All Jobs</Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {jobs.map((job: any) => (
                  <Link
                    key={job.id}
                    to={jobUrl(job)}
                    className="block p-5 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-sm text-primary font-medium">{job.company_name}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                          {job.emirate && <span className="flex items-center gap-1">📍 {job.emirate.replace(/_/g, ' ')}</span>}
                          {job.job_type && <span className="bg-gray-100 px-2 py-0.5 rounded">{job.job_type.replace(/_/g, ' ')}</span>}
                          {(job.salary_min || job.salary_max) && (
                            <span>AED {job.salary_min?.toLocaleString()}{job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : ''}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(job.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {total > 20 && (
                <div className="text-center mt-8">
                  <Link
                    to={`/jobs?industry=${encodeURIComponent(filterValue)}`}
                    className="btn btn-primary"
                  >
                    View All {total} {industry.title} Jobs
                  </Link>
                </div>
              )}
            </>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Browse Other Industries</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(INDUSTRIES)
                .filter(([s]) => s !== slug)
                .slice(0, 12)
                .map(([s, info]) => (
                  <Link
                    key={s}
                    to={`/jobs/industry/${s}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                  >
                    {info.title}
                  </Link>
                ))}
              <Link to="/jobs/industry" className="text-xs px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
                View All →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
