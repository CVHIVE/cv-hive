import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  icon: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'cv-tips-uae',
    title: 'How to Write a Winning CV for the UAE Job Market',
    excerpt: 'Your CV is your first impression. Learn what UAE employers look for and avoid common mistakes that get your application rejected.',
    category: 'CV Tips',
    readTime: '5 min',
    icon: '📄',
    content: [
      'The UAE job market is highly competitive, with candidates from around the world applying for the same roles. Your CV needs to stand out from hundreds of other applicants.',
      'Keep it to 2 pages maximum. UAE employers receive hundreds of applications per role and typically spend 6-10 seconds on an initial CV scan. Be concise and impactful.',
      'Include a professional photo. Unlike some Western markets, the UAE job market expects a professional headshot on your CV. Choose a recent, well-lit photo with a plain background.',
      'Lead with a strong professional summary. Write 2-3 lines highlighting your total experience, key skills, and what you bring. Avoid generic statements like "hard-working team player".',
      'Tailor your CV for each role. Use keywords from the job description. If the listing says "project management", make sure those exact words appear in your CV.',
      'Include your visa status. Employers want to know if you need sponsorship or are already on a family/freelance visa. This is standard practice in the UAE.',
      'List achievements, not just duties. Instead of "Managed a team", write "Led a team of 12 engineers, delivering 3 projects worth AED 5M ahead of schedule".',
      'Add your location and nationality. These are commonly expected on UAE CVs and help employers understand your availability and logistics.',
    ],
  },
  {
    id: 'interview-prep',
    title: '10 Interview Tips That Get You Hired in the UAE',
    excerpt: 'From dress code to cultural awareness, prepare for interviews the UAE way and leave a lasting impression.',
    category: 'Interviews',
    readTime: '6 min',
    icon: '🎯',
    content: [
      'Research the company thoroughly. Understand their industry, recent news, and company culture. UAE employers value candidates who show genuine interest.',
      'Dress formally unless told otherwise. Business attire is the norm in Dubai and Abu Dhabi. For men, a suit is standard. For women, conservative business dress is expected.',
      'Be punctual — arrive 10-15 minutes early. Traffic in UAE cities can be unpredictable. Plan your route and account for parking time.',
      'Prepare for competency-based questions. "Tell me about a time when..." questions are standard. Use the STAR method: Situation, Task, Action, Result.',
      'Know your salary expectations. Research market rates using our Salary Guide. Be ready to discuss your package expectations including housing, transport, and other allowances.',
      'Understand the benefits structure. UAE packages often include housing allowance, transport allowance, annual flights home, health insurance, and end-of-service gratuity. Know what to negotiate.',
      'Be ready to discuss your visa situation. Employers need to know if you require a new visa, are on a visit visa, or can start immediately.',
      'Show cultural awareness. The UAE is a multicultural workplace. Demonstrate your ability to work with diverse teams and respect local customs.',
      'Follow up within 24 hours. Send a brief thank-you email referencing something specific from the interview. This is appreciated and shows professionalism.',
      'Be patient with the process. UAE hiring can take 2-6 weeks. Multiple interview rounds with different stakeholders are common, especially for senior roles.',
    ],
  },
  {
    id: 'work-visa-guide',
    title: 'UAE Work Visa Guide: Everything You Need to Know',
    excerpt: 'Navigate the UAE visa process with confidence. From employment visas to golden visas, understand your options.',
    category: 'Visa & Legal',
    readTime: '7 min',
    icon: '🛂',
    content: [
      'The standard UAE employment visa is sponsored by your employer. They handle the application, medical test, Emirates ID, and labour card. The process typically takes 2-4 weeks.',
      'You\'ll need the following documents: passport (valid for 6+ months), passport-size photos, educational certificates (attested), and a job offer letter.',
      'Educational certificate attestation is required for most professions. Your degree must be attested by your home country\'s foreign affairs ministry, then the UAE embassy, and finally the UAE MOFA.',
      'The Golden Visa is available for skilled professionals, investors, entrepreneurs, and exceptional talents. It offers 5-10 year residency without employer sponsorship.',
      'Freelance visas are available in select free zones. They allow you to work independently, sponsor yourself, and take on multiple clients.',
      'The probation period is typically 6 months. During this time, either party can terminate the contract with 14 days\' notice (or as specified in the contract).',
      'End-of-service gratuity is mandatory. After 1+ year of service, you\'re entitled to 21 days of basic salary per year for the first 5 years, and 30 days per year after that.',
      'Health insurance is compulsory. Your employer must provide health insurance coverage. In Abu Dhabi, this extends to dependents as well.',
    ],
  },
  {
    id: 'salary-negotiation',
    title: 'How to Negotiate Your Salary in the UAE',
    excerpt: 'Stop leaving money on the table. Learn proven strategies to negotiate a competitive package in the UAE market.',
    category: 'Career Growth',
    readTime: '5 min',
    icon: '💰',
    content: [
      'Research thoroughly before any negotiation. Use salary guides, talk to recruiters, and check job listings with published salary ranges. Knowing the market rate gives you leverage.',
      'Consider the full package, not just the base salary. UAE compensation typically includes: basic salary, housing allowance (25-35% of salary), transport allowance, annual flight tickets, health insurance, and bonuses.',
      'Never reveal your current salary first. When asked, redirect with: "I\'m looking for a package in the range of AED X-Y based on the market and my experience."',
      'Time your negotiation correctly. The best time to negotiate is after receiving a verbal offer but before signing. This is when you have maximum leverage.',
      'Justify every ask with evidence. Don\'t say "I want more money." Say "Based on my 8 years of experience in project management and the market rate for similar roles in Dubai, I believe AED X is appropriate."',
      'If they can\'t move on salary, negotiate other benefits: additional annual leave, flexible working hours, professional development budget, relocation assistance, or a signing bonus.',
      'Get everything in writing. The UAE takes written contracts seriously. Ensure all agreed terms — salary breakdown, allowances, benefits — are documented in your offer letter.',
      'Know when to walk away. If the offer is significantly below market rate and they won\'t negotiate, it may signal how they value employees. Trust your research.',
    ],
  },
  {
    id: 'linkedin-tips',
    title: 'Optimise Your LinkedIn for the UAE Job Market',
    excerpt: 'Over 80% of UAE recruiters use LinkedIn to find candidates. Make sure your profile is working for you.',
    category: 'Job Search',
    readTime: '5 min',
    icon: '💼',
    content: [
      'Use a professional headline that includes your target role, not just your current title. Example: "Senior Project Manager | Construction & Infrastructure | PMP Certified | Dubai".',
      'Write a compelling About section in first person. Include your experience summary, key achievements, and what you\'re looking for. Mention "UAE" and your target emirate.',
      'Turn on "Open to Work" — but only to recruiters if you\'re currently employed. This signals your availability without broadcasting to your current employer.',
      'Add your location as your target UAE emirate, even if you\'re still abroad. Recruiters filter by location, and this ensures you appear in UAE searches.',
      'Request recommendations from previous managers and colleagues. UAE recruiters value social proof and are more likely to reach out to profiles with endorsements.',
      'Join UAE-specific LinkedIn groups. Groups like "Jobs in Dubai", "UAE Professionals Network", and industry groups in the Gulf increase your visibility.',
      'Post content regularly. Share industry insights, comment on relevant posts, and engage with companies you want to work for. Active profiles get 5x more views.',
      'Connect with UAE-based recruiters proactively. Send a brief, personalised connection request mentioning your target role and industry.',
    ],
  },
  {
    id: 'first-job-uae',
    title: 'Moving to the UAE: Your First 30 Days',
    excerpt: 'A practical guide to settling in the UAE — from opening a bank account to finding accommodation.',
    category: 'Relocation',
    readTime: '6 min',
    icon: '🌴',
    content: [
      'Your employer will handle the visa process. Once you arrive, you\'ll typically do a medical test and Emirates ID registration within the first week.',
      'Open a bank account as soon as you get your Emirates ID. Major banks include Emirates NBD, FAB, ADCB, and Mashreq. You\'ll need your passport, visa, Emirates ID, and salary certificate.',
      'Get a UAE phone number immediately. Du and Etisalat are the two providers. A prepaid SIM costs around AED 50 and requires your passport and Emirates ID.',
      'Download essential apps: RTA (Dubai transport), SEHA (healthcare), Al Hosn (health records), GDRFAD (visa services), and Careem/Uber for rides.',
      'Housing: Expect to pay 30-40% of your salary on rent in Dubai. Popular areas for professionals: Dubai Marina, JLT, Business Bay, Downtown, and Sports City. Abu Dhabi: Al Reem Island, Corniche, and Saadiyat.',
      'Understand the rental system. Most landlords require 1-4 cheques per year. Some accept monthly payments through property management companies. Register your tenancy contract via Ejari (Dubai) or Tawtheeq (Abu Dhabi).',
      'Summer temperatures reach 45-50°C. Most activities are indoors from June to September. Malls, indoor gyms, and cinemas will become your best friends during summer.',
      'Build your professional network early. Attend industry meetups, join professional associations, and participate in networking events. The UAE business community is highly social and relationship-driven.',
    ],
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(ARTICLES.map((a) => a.category)))];

export default function CareerAdvice() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filtered = selectedCategory === 'All' ? ARTICLES : ARTICLES.filter((a) => a.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Career Advice & UAE Job Tips | CV Hive</title>
        <meta name="description" content="Expert career advice for the UAE job market. CV tips, interview preparation, salary negotiation, visa guides, and more." />
      </Helmet>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-green-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              UAE Career Resources
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">Career Advice</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Expert tips and guides to help you succeed in the UAE job market — from writing the perfect CV to negotiating your salary.
            </p>
          </div>
        </section>

        {/* Filter */}
        <section className="py-8 border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((article) => (
                <div
                  key={article.id}
                  className={`bg-white border rounded-xl transition-all duration-200 ${
                    expandedArticle === article.id ? 'border-primary/30 shadow-lg md:col-span-2' : 'border-gray-200 hover:border-primary/20 hover:shadow-md'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{article.icon}</span>
                        <div>
                          <span className="text-xs font-medium text-primary bg-primary-50 px-2 py-0.5 rounded-full">{article.category}</span>
                          <span className="text-xs text-gray-400 ml-2">{article.readTime} read</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{article.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{article.excerpt}</p>

                    {expandedArticle === article.id && (
                      <div className="space-y-3 mb-4 border-t border-gray-100 pt-4">
                        {article.content.map((para, i) => (
                          <p key={i} className="text-gray-600 text-sm leading-relaxed">{para}</p>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                      className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      {expandedArticle === article.id ? 'Show less' : 'Read more'}
                      <svg className={`w-3.5 h-3.5 transition-transform ${expandedArticle === article.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Take the Next Step?</h2>
            <p className="text-gray-500 mb-8">
              Put these tips into practice. Build your CV, search for jobs, and start your UAE career journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cv-builder" className="btn btn-primary px-8">Build Your CV</Link>
              <Link to="/jobs" className="btn btn-secondary px-8">Search Jobs</Link>
              <Link to="/salary-guide" className="btn btn-secondary px-8">Salary Guide</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
