export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🇦🇪 CV Hive</h3>
            <p className="text-gray-400">
              UAE's leading CV library platform connecting job seekers with employers.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/signup" className="hover:text-white">Create Profile</a></li>
              <li><a href="/login" className="hover:text-white">Upload CV</a></li>
              <li><a href="#" className="hover:text-white">Career Tips</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/employers" className="hover:text-white">Search Candidates</a></li>
              <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="/contact" className="hover:text-white">Contact Sales</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
              <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 CV Hive. All rights reserved. Made with ❤️ in UAE</p>
        </div>
      </div>
    </footer>
  );
}
