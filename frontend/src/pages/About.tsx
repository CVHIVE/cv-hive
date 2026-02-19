import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>About Us | CV Hive</title>
        <meta name="description" content="Learn about CV Hive — the UAE's job board connecting candidates with employers across all seven Emirates." />
      </Helmet>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">About CV Hive</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Helping people find work and helping companies find talent across the UAE since 2025.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our mission</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  CV Hive was built to make job searching in the UAE simpler, faster, and more transparent. 
                  We believe everyone deserves access to real job opportunities without jumping through hoops.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Whether you're a recent graduate looking for your first role or an experienced professional 
                  seeking new challenges, CV Hive connects you directly with employers across Dubai, Abu Dhabi, 
                  Sharjah, and the wider Emirates.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">What we do</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-gray-600">Free job search and CV upload for all candidates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-gray-600">CV database search for employers to find qualified talent</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-gray-600">Job alerts so you never miss a new opening</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-gray-600">Free CV builder to create a professional resume in minutes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-gray-600">Coverage across all seven Emirates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 sm:py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">What drives us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Transparency</h3>
                <p className="text-gray-500 text-sm">
                  No hidden fees for job seekers. Clear pricing for employers. Honest job listings with real salary information.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Privacy</h3>
                <p className="text-gray-500 text-sm">
                  You control who sees your profile. Your personal information is never shared without your consent.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Simplicity</h3>
                <p className="text-gray-500 text-sm">
                  No unnecessary steps. Upload your CV, search for jobs, apply with one click. That's it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Create your free account today and start your job search, or find the right candidates for your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/signup" className="btn btn-primary text-sm">Register as a candidate</a>
              <a href="/register-employer" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                Register as an employer
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
