import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuthStore } from '../store/authStore';
import { subscriptionService } from '../services/subscriptions';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Basic',
    key: 'BASIC',
    price: 'Free',
    period: '',
    description: 'For small businesses getting started',
    features: [
      'Browse candidate profiles',
      'Up to 10 CV downloads / month',
      'Basic search filters',
      'Email support',
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
      'Everything in Basic',
      'Up to 100 CV downloads / month',
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
      'Unlimited CV downloads',
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
    if (planKey === 'BASIC') return;

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

  const currentPlan = subscription?.plan_type || 'BASIC';

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
                  ) : isEmployer && plan.key !== 'BASIC' ? (
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
                    <Link to="/signup">
                      <button
                        className={`w-full py-3 rounded-lg font-semibold transition ${
                          plan.highlighted
                            ? 'bg-white text-blue-600 hover:bg-gray-100'
                            : 'btn btn-primary'
                        }`}
                      >
                        {plan.key === 'BASIC' ? 'Get Started' : plan.cta}
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

      <Footer />
    </div>
  );
}
