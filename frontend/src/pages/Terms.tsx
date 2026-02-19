import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Terms & Conditions | CV Hive</title>
        <meta name="description" content="CV Hive terms and conditions of use for job seekers and employers in the UAE." />
      </Helmet>
      <Header />

      <div className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to CV Hive ("we", "our", "us"). CV Hive is an online recruitment platform operated in the
              United Arab Emirates ("UAE"). By accessing or using our website and services at cvhive.ae (the "Platform"),
              you agree to be bound by these Terms &amp; Conditions ("Terms"). If you do not agree with any part of these
              Terms, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Definitions</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>"Candidate"</strong> means any individual who registers to search and apply for job opportunities.</li>
              <li><strong>"Employer"</strong> means any company, recruiter, or organisation that registers to post vacancies or search for candidates.</li>
              <li><strong>"User"</strong> means any person accessing the Platform, including Candidates and Employers.</li>
              <li><strong>"Content"</strong> means any text, data, files, images, CVs, job listings, or other material uploaded or submitted through the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Eligibility</h2>
            <p>
              You must be at least 18 years old and legally permitted to work in or recruit within the UAE to use this
              Platform. By registering, you confirm that the information you provide is accurate and up to date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Account Registration</h2>
            <p>
              <strong>Candidates:</strong> may register using a personal email address and must provide accurate personal
              and professional information.
            </p>
            <p>
              <strong>Employers:</strong> must register using a valid business email address. Personal email addresses
              (e.g. Gmail, Yahoo, Hotmail) are not accepted for employer accounts. Employers represent and warrant that
              they are authorised to act on behalf of the company they register.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us
              immediately of any unauthorised access or use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Services</h2>
            <p>CV Hive provides the following services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Job search and application tools for Candidates (free of charge).</li>
              <li>CV upload and profile creation for Candidates.</li>
              <li>Candidate search and contact reveal tools for Employers (subject to subscription plan).</li>
              <li>Job posting tools for Employers with paid subscription plans.</li>
              <li>A Demo plan allowing Employers to explore the Platform for 24 hours at no cost (view-only, no job posting or contact reveals).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Subscriptions &amp; Payments</h2>
            <p>
              Employer subscription plans are billed monthly via Stripe. By subscribing, you authorise us to charge
              the applicable fee to your chosen payment method. All prices are listed in AED. Subscriptions renew
              automatically unless cancelled before the end of the billing period.
            </p>
            <p>
              Demo accounts expire automatically after 24 hours and are subject to deletion. No refunds are issued
              for partial billing periods of paid plans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Platform for any unlawful purpose or in violation of UAE Federal Laws.</li>
              <li>Post false, misleading, or discriminatory job listings.</li>
              <li>Upload content that is defamatory, obscene, or infringes on any third party's intellectual property rights.</li>
              <li>Scrape, harvest, or collect personal data from the Platform without authorisation.</li>
              <li>Attempt to gain unauthorised access to other users' accounts or our systems.</li>
              <li>Use the Platform to send unsolicited commercial messages (spam).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. CV &amp; Data Ownership</h2>
            <p>
              Candidates retain ownership of their CV and personal data. By uploading a CV, you grant CV Hive a
              non-exclusive licence to display your profile to registered Employers in accordance with your
              privacy settings. You may set your profile to "Private" at any time to remove your profile from
              Employer search results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>
              CV Hive acts as an intermediary platform and does not guarantee employment outcomes. We are not
              responsible for the accuracy of information posted by Users, the conduct of any Employer or
              Candidate, or any loss arising from use of the Platform.
            </p>
            <p>
              To the fullest extent permitted by UAE law, CV Hive's total liability shall not exceed the amount
              paid by you in the 12 months prior to the event giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion if we believe you
              have violated these Terms. Upon termination, your right to access the Platform ceases immediately.
              Demo accounts are automatically deleted after expiry.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates.
              Any disputes arising out of or in connection with these Terms shall be subject to the exclusive
              jurisdiction of the courts of Dubai, UAE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify registered Users of material changes
              via email or a notice on the Platform. Continued use of the Platform after changes are posted
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="font-medium">support@cvhive.ae</p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
