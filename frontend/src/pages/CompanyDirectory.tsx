import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../services/api';

interface Company {
  company_name: string;
  company_slug: string;
  industry: string | null;
  location: string | null;
  company_size: string | null;
  company_logo_url: string | null;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function CompanyDirectory() {
  const [letter, setLetter] = useState('');

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companyDirectory', letter],
    queryFn: () =>
      api.get<Company[]>('/employers/directory', { params: letter ? { letter } : {} }).then((r) => r.data),
    staleTime: 60 * 1000,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-to-r from-purple-600 to-blue-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Company A-Z</h1>
          <p className="text-lg text-purple-100">
            Browse all registered UAE companies
          </p>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Alphabet Filter */}
          <div className="flex flex-wrap justify-center gap-1 mb-8">
            <button
              onClick={() => setLetter('')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition ${
                letter === '' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {ALPHABET.map((l) => (
              <button
                key={l}
                onClick={() => setLetter(l)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition ${
                  letter === l ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
          ) : companies && companies.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {companies.length} compan{companies.length === 1 ? 'y' : 'ies'} found
                {letter ? ` starting with "${letter}"` : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <Link
                    key={company.company_slug}
                    to={`/companies/${company.company_slug}`}
                    className="card hover:shadow-md transition flex items-start gap-4"
                  >
                    {company.company_logo_url ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${company.company_logo_url}`}
                        alt={company.company_name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center flex-shrink-0 text-primary font-bold text-lg">
                        {company.company_name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-primary truncate">{company.company_name}</h3>
                      {company.industry && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded inline-block mt-1">
                          {company.industry}
                        </span>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {[company.location, company.company_size].filter(Boolean).join(' · ') || 'UAE'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {letter
                ? `No companies found starting with "${letter}".`
                : 'No companies registered yet.'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
