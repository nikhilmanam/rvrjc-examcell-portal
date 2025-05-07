export default function Footer() {
  return (
    <footer className="bg-[#1a237e] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">R.V.R & J.C College of Engineering</h3>
            <p className="text-gray-300">
              Guntur, Andhra Pradesh - 522019
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              <li><a href="/admin/login" className="text-gray-300 hover:text-white transition-colors">Admin Portal</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: examcell@rvrjc.ac.in</li>
              <li>Phone: +91-XXXXXXXXXX</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} R.V.R & J.C College of Engineering. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 