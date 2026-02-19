import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const faqs = [
  {
    category: 'Job Seekers',
    questions: [
      {
        q: 'How do I create a profile on CV Hive?',
        a: 'Click "Sign Up" on the homepage and select "Job Seeker". Fill in your details, verify your email, and complete your profile with your experience, skills, and CV. A complete profile increases your visibility to employers.',
      },
      {
        q: 'How do I upload my CV?',
        a: 'Go to your Candidate Dashboard, then click "Upload CV" in the profile section. We accept PDF and DOC/DOCX files up to 5MB. You can also build a CV from scratch using our free CV Builder.',
      },
      {
        q: 'Is it free to use CV Hive as a job seeker?',
        a: 'Yes! Creating a profile, uploading your CV, searching for jobs, applying to positions, setting up job alerts, and using the CV Builder are all completely free for job seekers.',
      },
      {
        q: 'How do I set up job alerts?',
        a: 'Navigate to Job Alerts from your dashboard sidebar. You can create alerts based on keywords, industry, location (emirate), and job type. You\'ll receive email notifications when matching jobs are posted.',
      },
      {
        q: 'Can I hide my profile from employers?',
        a: 'Yes. In your Candidate Dashboard settings, you can toggle profile visibility off. This hides your profile from employer searches while keeping your account active for applying to jobs.',
      },
      {
        q: 'How do I use the CV Builder?',
        a: 'Go to CV Builder from the navigation menu. Our 8-step wizard guides you through personal details, experience, education, skills, languages, and more. When finished, you can download your CV as a professionally formatted PDF.',
      },
      {
        q: 'How do I track my job applications?',
        a: 'Visit "My Applications" from your dashboard sidebar. You can see all jobs you\'ve applied to, their current status (Applied, Reviewed, Shortlisted, Interview, Offered, Rejected), and withdraw applications if needed.',
      },
    ],
  },
  {
    category: 'Employers',
    questions: [
      {
        q: 'How do I register as an employer?',
        a: 'Click "Register as Employer" and provide your company details including company name, industry, and contact information. After email verification, you\'ll have access to the employer dashboard.',
      },
      {
        q: 'What plans are available for employers?',
        a: 'We offer three plans: Demo (free 24-hour trial with browse-only access), Professional (AED 499/month with 100 contact reveals), and Enterprise (AED 1,499/month with 500 contact reveals). Visit our Pricing page for full details.',
      },
      {
        q: 'How do contact reveals work?',
        a: 'When you find a candidate you\'re interested in, you can "reveal" their contact details (email, phone) using one of your monthly reveals. Each reveal counts once per candidate — revealing the same candidate again doesn\'t use additional credits.',
      },
      {
        q: 'How do I post a job?',
        a: 'From your Employer Dashboard, click "Post a Job". Fill in the job title, description, requirements, salary range, location, and job type. Job postings are pay-per-post at AED 99 each via Stripe.',
      },
      {
        q: 'Can I search for candidates?',
        a: 'Yes! With a Professional or Enterprise plan, you can search our CV database using filters like industry, emirate, experience level, visa status, availability, and salary range. You can also bookmark candidates for later.',
      },
      {
        q: 'How do I manage applications?',
        a: 'Go to the Applications tab in your Employer Dashboard. Select a job to view all applicants. You can update their status (Reviewed, Shortlisted, etc.), view their full profiles, and download their CVs.',
      },
      {
        q: 'Can I export candidate data?',
        a: 'Yes, Enterprise plan users can export search results as CSV files for use in their own applicant tracking systems.',
      },
    ],
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a reset link valid for 1 hour. Follow the link to set a new password.',
      },
      {
        q: 'How do I change my email or password?',
        a: 'Go to your dashboard settings. You can change your password from the Settings section. For email changes, please contact our support team.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'Go to the Subscription tab in your Employer Dashboard and click "Cancel Subscription". Your plan will remain active until the end of your current billing period.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe. All payments are in AED.',
      },
      {
        q: 'How do I delete my account?',
        a: 'You can delete your account from the Settings section of your dashboard. Please note that account deletion is permanent and removes all your data including profile, applications, and job listings.',
      },
    ],
  },
  {
    category: 'General',
    questions: [
      {
        q: 'What visa statuses does CV Hive support?',
        a: 'We support all UAE visa categories: Employment Visa, Own Visa (Golden/Investor), Spouse Visa, Freelance Permit, Visit Visa, and Cancelled Visa. Employers can filter candidates by visa status.',
      },
      {
        q: 'Which Emirates are covered?',
        a: 'CV Hive covers all seven Emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain.',
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. We use industry-standard encryption, secure authentication with JWT tokens, and process payments through Stripe (PCI-DSS compliant). We never share your personal data without consent. See our Privacy Policy for details.',
      },
      {
        q: 'How do I contact support?',
        a: 'Visit our Contact page or email support@cvhive.ae. We aim to respond to all enquiries within 24 hours during business days.',
      },
    ],
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredFaqs = faqs.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(search.toLowerCase()) ||
        q.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Help & FAQ | CV Hive</title>
        <meta name="description" content="Frequently asked questions about CV Hive. Get help with your account, job searching, employer tools, CV uploads, and more." />
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">Help & FAQ</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Find answers to common questions about using CV Hive.
            </p>
            <div className="max-w-xl mx-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for help..."
                className="w-full px-5 py-3.5 rounded-xl text-gray-900 bg-white border-0 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found. Try a different search term or <Link to="/contact" className="text-primary hover:underline">contact us</Link>.</p>
            </div>
          )}

          {filteredFaqs.map((cat) => (
            <div key={cat.category} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                {cat.category}
              </h2>
              <div className="space-y-2">
                {cat.questions.map((item, i) => {
                  const key = `${cat.category}-${i}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900 pr-4">{item.q}</span>
                        <svg
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-slate-50 rounded-2xl p-8 text-center mt-8">
            <h3 className="font-semibold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-sm text-gray-600 mb-4">Our support team is happy to help.</p>
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
