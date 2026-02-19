import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              CV Hive ("we", "our", "us") is committed to protecting the privacy and personal data of our users.
              This Privacy Policy explains how we collect, use, store, and share your personal data when you use
              our recruitment platform at cvhive.ae (the "Platform"). This policy complies with UAE Federal
              Decree-Law No. 45 of 2021 on the Protection of Personal Data and other applicable UAE regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.1 Candidates</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name, email address, phone number</li>
              <li>CV/resume file (PDF, DOC, DOCX)</li>
              <li>Employment history, education, skills, and qualifications</li>
              <li>Visa status, current emirate, availability</li>
              <li>Salary expectations and job preferences</li>
              <li>Profile visibility preferences</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.2 Employers</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Company name, business email address</li>
              <li>Company logo, description, website, industry</li>
              <li>Payment information (processed securely via Stripe — we do not store card details)</li>
              <li>Subscription plan and usage data</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.3 Automatically Collected</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address, browser type, device information</li>
              <li>Pages visited, time spent, and interaction data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Data</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create and manage your account</li>
              <li>Enable Candidates to apply for jobs and be discovered by Employers</li>
              <li>Enable Employers to post jobs and search for suitable Candidates</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send transactional emails (verification, password reset, application updates)</li>
              <li>Send job alert notifications based on your preferences</li>
              <li>Improve the Platform and user experience</li>
              <li>Comply with legal obligations and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Legal Basis for Processing</h2>
            <p>We process your personal data on the following legal bases:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Consent:</strong> You consent to us processing your data when you create an account and accept these terms.</li>
              <li><strong>Contractual necessity:</strong> Processing is necessary to deliver the services you signed up for.</li>
              <li><strong>Legitimate interest:</strong> We may process data for internal analytics if it does not override your rights.</li>
              <li><strong>Legal obligation:</strong> We may process data to comply with UAE laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing</h2>
            <p>We may share your personal data with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Employers</strong> (when a Candidate's profile is set to "Public" or they apply to a job)</li>
              <li><strong>Stripe</strong> for payment processing (Employers only)</li>
              <li><strong>Email service providers</strong> for transactional communications</li>
              <li><strong>Law enforcement</strong> when required by UAE law</li>
            </ul>
            <p>
              We do not sell your personal data to third parties. We do not share your data with advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Profile Visibility &amp; Candidate Control</h2>
            <p>
              Candidates can control their profile visibility at any time from their dashboard settings.
              When set to "Private", your profile will be hidden from Employer search results. You may still
              apply for jobs. When set to "Public", registered Employers with an active subscription can view
              your profile and, subject to their plan limits, reveal your contact details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Active accounts:</strong> We retain your data for as long as your account is active.</li>
              <li><strong>Demo accounts:</strong> Data is automatically deleted after the 24-hour demo period expires.</li>
              <li><strong>Deleted accounts:</strong> Personal data is permanently removed within 30 days of account deletion.</li>
              <li><strong>Legal requirements:</strong> Certain data may be retained longer where required by UAE law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data,
              including encryption, secure authentication (JWT), password hashing, and access controls.
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Your Rights</h2>
            <p>Under UAE data protection law, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent at any time</li>
              <li>Object to processing for direct marketing purposes</li>
              <li>Data portability (receive your data in a structured format)</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <strong>support@cvhive.ae</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and preferences. We do not use advertising
              or tracking cookies. By using the Platform, you consent to the use of essential cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. International Data Transfers</h2>
            <p>
              Your data is primarily stored and processed within services accessible from the UAE. Where data
              is transferred to processors outside the UAE, we ensure appropriate safeguards are in place in
              accordance with UAE data protection requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Children's Privacy</h2>
            <p>
              The Platform is not intended for individuals under the age of 18. We do not knowingly collect
              personal data from children. If you believe we have inadvertently collected data from a minor,
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered Users of material
              changes via email or a notice on the Platform. The "Last updated" date at the top reflects the
              most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your data rights,
              please contact us at:
            </p>
            <p className="font-medium">support@cvhive.ae</p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
