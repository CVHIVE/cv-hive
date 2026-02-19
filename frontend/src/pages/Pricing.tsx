import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuthStore } from '../store/authStore';
import { subscriptionService } from '../services/subscriptions';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Demo',
    key: 'DEMO',
    price: 'Free',
    period: '(24 hours)',
    description: 'Explore the platform before committing',
    features: [
      'Browse candidate profiles (view only)',
      'Search with all filters',
      'View company directory',
      'No contact reveals',
      'No job posting',
      'Expires after 24 hours',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    key: 'PROFESSIONAL',
    price: 'AED 499',
    period: '/month',
    description: 'For growing companies hiring regularly',
    features: [
      'Everything in Demo',
      'Up to 100 contact reveals / month',
      'Advanced search filters',
      'Candidate bookmarking',
      'Priority support',
      'Company profile listing',
    ],
    cta: 'Subscribe',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    key: 'ENTERPRISE',
    price: 'AED 1,499',
    period: '/month',
    description: 'For large organizations with high-volume hiring',
    features: [
      'Everything in Professional',
      'Unlimited contact reveals',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
      'Bulk candidate export',
      'SLA guarantee',
    ],
    cta: 'Subscribe',
    highlighted: false,
  },
];

export default function Pricing() {
  const { isAuthenticated, user } = useAuthStore();
  const isEmployer = isAuthenticated && user?.role === 'EMPLOYER';
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const subStatus = searchParams.get('subscription');
    if (subStatus === 'cancelled') {
      toast('Payment was cancelled. You can try again anytime.', { icon: '⚠️' });
      searchParams.delete('subscription');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionService.getStatus(),
    enabled: isEmployer,
  });

  const handleSubscribe = async (planKey: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in as an employer to subscribe');
      return;
    }
    if (user?.role !== 'EMPLOYER') {
      toast.error('Subscriptions are for employer accounts');
      return;
    }
    if (planKey === 'DEMO') return;

    setLoadingPlan(planKey);
    try {
      const result = await subscriptionService.createCheckout(planKey);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = subscription?.plan_type || 'DEMO';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-blue-100">
            Free for job seekers. Flexible plans for employers.
          </p>
        </div>
      </section>

      <section className="py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrent = isEmployer && currentPlan === plan.key;
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 flex flex-col relative ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white shadow-xl scale-105'
                      : 'bg-white border border-gray-200 shadow-sm'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      Current Plan
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className={`text-sm ${plan.highlighted ? 'text-blue-200' : 'text-gray-500'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <span className={`mr-2 ${plan.highlighted ? 'text-blue-200' : 'text-green-500'}`}>
                          &#10003;
                        </span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button disabled className="w-full py-3 rounded-lg font-semibold bg-gray-300 text-gray-600 cursor-not-allowed">
                      Current Plan
                    </button>
                  ) : isEmployer && plan.key !== 'DEMO' ? (
                    <button
                      onClick={() => handleSubscribe(plan.key)}
                      disabled={loadingPlan === plan.key}
                      className={`w-full py-3 rounded-lg font-semibold transition ${
                        plan.highlighted
                          ? 'bg-white text-blue-600 hover:bg-gray-100'
                          : 'btn btn-primary'
                      }`}
                    >
                      {loadingPlan === plan.key ? 'Redirecting...' : plan.cta}
                    </button>
                  ) : (
                    <Link to={plan.key !== 'DEMO' ? `/register-employer?plan=${plan.key}` : '/register-employer'}>
                      <button
                        className={`w-full py-3 rounded-lg font-semibold transition ${
                          plan.highlighted
                            ? 'bg-white text-blue-600 hover:bg-gray-100'
                            : 'btn btn-primary'
                        }`}
                      >
                        {plan.key !== 'DEMO' ? 'Sign Up' : 'Get Started'}
                      </button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Job seekers note */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-green-50 border border-green-200 rounded-xl px-8 py-6">
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Job Seekers — Always Free
              </h3>
              <p className="text-green-700">
                Create your profile, upload your CV, and get discovered by employers at no cost.
              </p>
              <Link to="/signup" className="inline-block mt-4">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
                  Create Free Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CV Search Demo */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">See How CV Search Works</h2>
            <p className="text-gray-600">Preview our powerful candidate search filters</p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Demo Filters */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-semibold text-gray-800">Search Filters</h3>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Job Title / Keywords</label>
                    <input className="input" placeholder="e.g. Software Engineer" disabled />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Visa Status</label>
                    <select className="input" disabled><option>All Visa Types</option></select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Emirate</label>
                    <select className="input" disabled><option>All Emirates</option></select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Distance</label>
                    <select className="input" disabled><option>Within 25 miles</option></select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Industry</label>
                    <select className="input" disabled><option>Technology</option></select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Experience (years)</label>
                    <div className="flex gap-2">
                      <input className="input w-1/2" placeholder="Min" disabled />
                      <input className="input w-1/2" placeholder="Max" disabled />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Salary Range (AED)</label>
                    <div className="flex gap-2">
                      <input className="input w-1/2" placeholder="Min" disabled />
                      <input className="input w-1/2" placeholder="Max" disabled />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Availability</label>
                    <select className="input" disabled><option>Immediate</option></select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Education Level</label>
                    <select className="input" disabled><option>Bachelor's Degree</option></select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">CV Updated</label>
                    <select className="input" disabled><option>Last 30 days</option></select>
                  </div>
                </div>
              </div>

              {/* Demo Results - Blurred */}
              <div className="lg:col-span-3 space-y-4">
                <p className="text-sm text-gray-500">247 candidates found</p>
                {[
                  { name: 'A****** M.', title: 'Senior Software Engineer', exp: '8 yrs', loc: 'Dubai' },
                  { name: 'F****** H.', title: 'Marketing Manager', exp: '6 yrs', loc: 'Abu Dhabi' },
                  { name: 'R** P.', title: 'Financial Analyst', exp: '4 yrs', loc: 'Dubai' },
                  { name: 'S**** A.', title: 'UX Designer', exp: '5 yrs', loc: 'Sharjah' },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{c.name}</h4>
                      <p className="text-gray-500 text-sm">{c.title}</p>
                      <div className="flex gap-3 text-xs text-gray-400 mt-1">
                        <span>{c.exp} exp</span>
                        <span>{c.loc}</span>
                        <span>Own Visa</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="bg-gray-200 text-gray-400 text-xs px-4 py-2 rounded-lg text-center">View Profile</div>
                      <div className="bg-gray-200 text-gray-400 text-xs px-4 py-2 rounded-lg text-center">Reveal</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100 via-transparent to-transparent flex items-end justify-center pb-8 pointer-events-none">
              <Link to="/register-employer?plan=PROFESSIONAL" className="pointer-events-auto">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition text-lg">
                  Subscribe to Search Candidates
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
