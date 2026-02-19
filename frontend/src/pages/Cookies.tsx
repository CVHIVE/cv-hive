import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Cookies() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Cookies Policy | CV Hive</title>
        <meta name="description" content="Learn about how CV Hive uses cookies and similar technologies to improve your experience on our platform." />
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="bg-slate-900 text-white py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">Cookies Policy</h1>
            <p className="text-gray-400 text-lg">Last updated: January 2025</p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the website owners. Cookies help us improve your browsing experience and deliver personalised content.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              CV Hive uses cookies for the following purposes:
            </p>

            <div className="space-y-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and session management. You cannot opt out of essential cookies as they are required for the site to operate.
                </p>
                <ul className="mt-3 space-y-1 text-sm text-gray-500">
                  <li><strong>token</strong> — Authentication token for logged-in users</li>
                  <li><strong>cookie_consent</strong> — Records your cookie consent preference</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  These cookies allow us to remember choices you make when using the website, such as your preferred language, location, or search filters. They provide enhanced functionality and personalisation.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We may use analytics cookies to understand how visitors interact with our website. This helps us improve the site's functionality and content. These cookies collect information anonymously and do not identify you personally.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  These cookies may be used to deliver advertisements that are relevant to you. They are also used to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Some cookies on our site are placed by third-party services. These include payment processing (Stripe), analytics tools, and social media features. We do not have control over third-party cookies. Please refer to the respective third-party privacy policies for more information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              You can manage your cookie preferences at any time. Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Delete all cookies from your browser</li>
              <li>Block all cookies from being set</li>
              <li>Allow all cookies</li>
              <li>Block third-party cookies</li>
              <li>Clear all cookies when you close the browser</li>
            </ul>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Please note that restricting cookies may impact the functionality of our website. Some features may not work correctly if cookies are disabled.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period or until you delete them. Our authentication cookies expire after 7 days of inactivity.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We may update this Cookies Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this page periodically.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:support@cvhive.ae" className="text-primary hover:underline">support@cvhive.ae</a>{' '}
              or visit our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
