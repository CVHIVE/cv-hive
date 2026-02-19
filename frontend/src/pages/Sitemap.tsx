import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const sections = [
  {
    title: 'Job Seekers',
    links: [
      { label: 'Search Jobs', to: '/jobs' },
      { label: 'Job Alerts', to: '/job-alerts' },
      { label: 'My Applications', to: '/my-applications' },
      { label: 'Saved Jobs', to: '/saved-jobs' },
      { label: 'Candidate Dashboard', to: '/dashboard' },
      { label: 'CV Builder', to: '/cv-builder' },
      { label: 'Create Profile', to: '/signup' },
      { label: 'Login', to: '/login' },
    ],
  },
  {
    title: 'Employers',
    links: [
      { label: 'Pricing', to: '/pricing' },
      { label: 'Post a Job', to: '/post-job' },
      { label: 'Search Candidates', to: '/search' },
      { label: 'CV Database', to: '/cv-database' },
      { label: 'Employer Dashboard', to: '/employer-dashboard' },
      { label: 'Employer Settings', to: '/employer-settings' },
      { label: 'Bookmarked Candidates', to: '/bookmarked-candidates' },
      { label: 'Register Employer', to: '/register-employer' },
    ],
  },
  {
    title: 'Browse Jobs by Emirate',
    links: [
      { label: 'All Emirates', to: '/jobs/emirate' },
      { label: 'Jobs in Dubai', to: '/jobs/emirate/dubai' },
      { label: 'Jobs in Abu Dhabi', to: '/jobs/emirate/abu-dhabi' },
      { label: 'Jobs in Sharjah', to: '/jobs/emirate/sharjah' },
      { label: 'Jobs in Ajman', to: '/jobs/emirate/ajman' },
      { label: 'Jobs in Ras Al Khaimah', to: '/jobs/emirate/ras-al-khaimah' },
      { label: 'Jobs in Fujairah', to: '/jobs/emirate/fujairah' },
      { label: 'Jobs in Umm Al Quwain', to: '/jobs/emirate/umm-al-quwain' },
    ],
  },
  {
    title: 'Browse Jobs by Industry',
    links: [
      { label: 'All Industries', to: '/jobs/industry' },
      { label: 'Accounting & Finance', to: '/jobs/industry/accounting-finance' },
      { label: 'Banking', to: '/jobs/industry/banking' },
      { label: 'Construction', to: '/jobs/industry/construction' },
      { label: 'Education', to: '/jobs/industry/education' },
      { label: 'Engineering', to: '/jobs/industry/engineering' },
      { label: 'Healthcare', to: '/jobs/industry/healthcare' },
      { label: 'Hospitality & Tourism', to: '/jobs/industry/hospitality-tourism' },
      { label: 'Information Technology', to: '/jobs/industry/information-technology' },
      { label: 'Marketing & advertising', to: '/jobs/industry/marketing-advertising' },
      { label: 'Oil & Gas', to: '/jobs/industry/oil-gas' },
      { label: 'Real Estate', to: '/jobs/industry/real-estate' },
      { label: 'Retail', to: '/jobs/industry/retail' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Salary Guide', to: '/salary-guide' },
      { label: 'Career Advice', to: '/career-advice' },
      { label: 'Gratuity Calculator', to: '/gratuity-calculator' },
      { label: 'Company Directory', to: '/companies' },
      { label: 'Help & FAQ', to: '/help' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookies Policy', to: '/cookies' },
    ],
  },
];

export default function Sitemap() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Sitemap | CV Hive</title>
        <meta name="description" content="Browse all pages and sections of CV Hive — UAE's leading job portal. Find pages for job seekers, employers, and more." />
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">Sitemap</h1>
            <p className="text-gray-400 text-lg">All pages on CV Hive, organized by section.</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{section.title}</h2>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="text-sm text-primary hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
