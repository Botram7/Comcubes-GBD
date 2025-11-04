import { Link } from 'wouter';
import { TrendingUp, Mail, FileText, Shield, DollarSign, AlertCircle } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              About COMCUBES
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your comprehensive global business directory for everything and anything business.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/sectors">
                  <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Business Sectors
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/geography">
                  <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Geography
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/list-company">
                  <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    List Your Company
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Legal & Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy">
                  <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service">
                  <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Terms of Service
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/disclaimer">
                  <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Disclaimer
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Us
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Advertise */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Business Opportunities
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/advertise">
                  <a className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                    <DollarSign className="h-4 w-4" />
                    Advertise with Us
                  </a>
                </Link>
              </li>
              <li className="text-xs text-gray-500 leading-relaxed pt-2">
                Reach thousands of business professionals worldwide with strategic ad placements.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} COMCUBES. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Everything and Anything Business
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
