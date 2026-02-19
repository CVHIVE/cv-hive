import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    try {
      await api.post('/auth/contact', form);
      toast.success("Message sent! We'll get back to you within 1-2 business days.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try emailing us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Contact Us | CV Hive</title>
        <meta name="description" content="Get in touch with CV Hive. Contact our team for support, partnerships, or general enquiries." />
      </Helmet>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Contact us</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have a question, feedback, or need help? We'd love to hear from you.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Email us</h3>
                  <p className="text-gray-500 text-sm mb-1">General enquiries</p>
                  <a href="mailto:info@cvhive.ae" className="text-primary text-sm font-medium hover:underline">info@cvhive.ae</a>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Employer support</h3>
                  <p className="text-gray-500 text-sm mb-1">For recruitment and billing queries</p>
                  <a href="mailto:employers@cvhive.ae" className="text-primary text-sm font-medium hover:underline">employers@cvhive.ae</a>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Office</h3>
                  <p className="text-gray-500 text-sm">
                    Dubai, United Arab Emirates
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Hours</h3>
                  <p className="text-gray-500 text-sm">
                    Sunday – Thursday: 9:00 AM – 6:00 PM<br />
                    Friday – Saturday: Closed
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
                  <h2 className="text-xl font-bold mb-6">Send us a message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="input"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      className="input"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General enquiry</option>
                      <option value="candidate-support">Candidate support</option>
                      <option value="employer-support">Employer support</option>
                      <option value="billing">Billing &amp; payments</option>
                      <option value="partnership">Partnership</option>
                      <option value="bug">Report a bug</option>
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="input min-h-[140px]"
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="btn btn-primary text-sm w-full sm:w-auto"
                  >
                    {sending ? 'Sending...' : 'Send message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
