import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { paymentService, PaymentMethod } from '../services/payments';
import toast from 'react-hot-toast';

export default function PaymentMethods() {
  const queryClient = useQueryClient();
  const { data: cards, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentService.getAll(),
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const addMutation = useMutation({
    mutationFn: () =>
      paymentService.add({
        cardNumber,
        expMonth: parseInt(expMonth),
        expYear: parseInt(expYear),
        cardholderName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Card added successfully');
      setShowAddForm(false);
      setCardNumber('');
      setExpMonth('');
      setExpYear('');
      setCardholderName('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add card');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => paymentService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Default card updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update default');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Card removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove card');
    },
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate();
  };

  const brandColors: Record<string, string> = {
    Visa: 'bg-primary',
    Mastercard: 'bg-red-500',
    Amex: 'bg-gray-700',
    Discover: 'bg-orange-500',
    Card: 'bg-gray-500',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Add Card
            </button>
          )}
        </div>

        {/* Add Card Form */}
        {showAddForm && (
          <div className="card mb-6">
            <h3 className="font-semibold mb-4">Add New Card</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Month
                  </label>
                  <select
                    className="input w-full"
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    required
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Year
                  </label>
                  <select
                    className="input w-full"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    required
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="btn btn-primary"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add Card'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Card List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
          </div>
        ) : !cards || cards.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No payment methods</h3>
            <p className="text-gray-500 mb-4">Add a card to start posting jobs and subscribing to plans.</p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary"
              >
                Add Your First Card
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card: PaymentMethod) => (
              <div
                key={card.id}
                className={`card flex items-center justify-between ${
                  card.is_default ? 'ring-2 ring-primary-400' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${
                      brandColors[card.card_brand] || 'bg-gray-500'
                    }`}
                  >
                    {card.card_brand.slice(0, 4).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {card.card_brand} ending in {card.card_last4}
                      </span>
                      {card.is_default && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {card.cardholder_name} &middot; Expires{' '}
                      {String(card.card_exp_month).padStart(2, '0')}/{card.card_exp_year}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!card.is_default && (
                    <button
                      onClick={() => setDefaultMutation.mutate(card.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(card.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h3 className="font-semibold text-primary-800 mb-1">Payment Info</h3>
          <ul className="text-sm text-primary-700 space-y-1">
            <li>&#8226; Job posting: AED 100 per listing (28 days active)</li>
            <li>&#8226; Your default card will be charged when you publish a job</li>
            <li>&#8226; Subscription plans are billed monthly to your default card</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
}
