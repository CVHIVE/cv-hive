import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Get Discovered by 500+ UAE Employers
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Create your profile and let top companies find you. Free forever for job seekers.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/signup">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Upload Your CV - It's Free
              </button>
            </Link>
            <Link to="/employers">
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                For Employers
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload CV</h3>
              <p className="text-gray-600">
                Create your profile in 5 minutes. Upload your CV and let us do the rest.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Get Discovered</h3>
              <p className="text-gray-600">
                Top UAE companies search our database daily for talent like you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Hired</h3>
              <p className="text-gray-600">
                Receive interview calls from verified employers. Land your dream job.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CV Hive?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-semibold mb-2">Free Forever</h3>
              <p className="text-sm text-gray-600">
                Always free for job seekers. No hidden costs.
              </p>
            </div>
            
            <div className="card">
              <div className="text-3xl mb-3">🇦🇪</div>
              <h3 className="font-semibold mb-2">UAE Focused</h3>
              <p className="text-sm text-gray-600">
                Built specifically for the UAE job market.
              </p>
            </div>
            
            <div className="card">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-gray-600">
                Control who sees your profile. Your data, your choice.
              </p>
            </div>
            
            <div className="card">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Instant Matching</h3>
              <p className="text-sm text-gray-600">
                Advanced search helps employers find you fast.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals already on CV Hive
          </p>
          <Link to="/signup">
            <button className="btn btn-primary px-8 py-3 text-lg">
              Create Your Profile Now
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
