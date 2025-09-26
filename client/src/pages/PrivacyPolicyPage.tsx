import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import comcubesIcon from "@assets/Artboard 2_1758848442771.png";
import { useEffect } from "react";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";

export default function PrivacyPolicyPage() {
  const [, setLocation] = useLocation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBackToHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-40 h-40" />
              </div>
              <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
            </div>
            <Button 
              onClick={handleBackToHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
              <p className="text-gray-600 mb-8">Last Updated: July 21, 2025</p>

              <p className="text-gray-700 mb-6">
                Welcome to Comcubes Global Business Directory ("Comcubes GBD," "we," "us," or "our"). This Privacy Policy outlines how we collect, use, and protect information when you visit our website, located at https://www.comcubes.com.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We are committed to maintaining your privacy. Currently, Comcubes GBD does not directly collect any personal identifying information from our users (such as names, email addresses, or contact details) through user accounts, registration forms, contact forms, or newsletter subscriptions.
              </p>
              <p className="text-gray-700 mb-4">
                However, like most websites, we automatically collect certain non-personal information about your visit for analytical purposes and to improve our services. This may include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li className="mb-2">
                  <strong>Usage Data:</strong> Information about how you interact with our website, such as the pages you visit, the time spent on those pages, clicks on links (including affiliate links), search queries, and general browse patterns.
                </li>
                <li className="mb-2">
                  <strong>Technical Data:</strong> Information about your device and internet connection, such as your IP address, browser type and version, operating system, referral source, and device identifiers.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Collect Information</h2>
              <p className="text-gray-700 mb-4">
                We collect the non-personal information mentioned above through:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li className="mb-3">
                  <strong>Cookies and Similar Technologies:</strong> We may use cookies, web beacons, and other tracking technologies to enhance your browse experience, analyze site traffic, and understand user behavior. Cookies are small data files stored on your device that help us remember your preferences and recognize you on repeat visits.
                </li>
                <li className="mb-3">
                  <strong>Third-Party Analytics Services:</strong> We use third-party analytics services (e.g., Google Analytics) to help us understand website traffic and usage trends. These services may collect and process data as described in their own privacy policies.
                </li>
                <li className="mb-3">
                  <strong>Affiliate Tracking:</strong> When you click on an affiliate link on our website, a cookie may be placed on your browser by the affiliate partner to track your referral and attribute any subsequent purchase to Comcubes GBD. This is typically done without collecting your personal identifying information but tracks the referral source.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                The non-personal information we collect is used solely for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li className="mb-2">
                  <strong>To Operate and Maintain Our Website:</strong> Ensuring our directory functions correctly and is accessible to you.
                </li>
                <li className="mb-2">
                  <strong>To Improve Our Services:</strong> Understanding how users interact with our site allows us to enhance content, layout, and functionality.
                </li>
                <li className="mb-2">
                  <strong>To Analyze Website Performance:</strong> Monitoring traffic patterns, popular content, and the effectiveness of our listings and affiliate links.
                </li>
                <li className="mb-2">
                  <strong>For Affiliate Program Compliance:</strong> To track and attribute referrals made through our affiliate links, which allows us to earn commissions from our partners.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Sharing Your Information</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal identifying information to outside parties.
              </p>
              <p className="text-gray-700 mb-4">
                We may share aggregated or anonymized non-personal data with third-party service providers (e.g., analytics providers) for the purposes outlined in Section 3. This data cannot be used to personally identify you.
              </p>
              <p className="text-gray-700 mb-4">
                Information collected via affiliate tracking cookies is shared directly with the respective affiliate program providers, as necessary for tracking and commission purposes. This data typically includes non-personal identifiers and details about the referral event.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Third-Party Links</h2>
              <p className="text-gray-700 mb-4">
                Our website contains links to third-party websites, including the official websites of companies listed in our directory and those of our affiliate partners. These third-party sites have their own independent privacy policies. We have no responsibility or liability for the content and activities of these linked sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can choose to disable cookies through your individual browser options. However, doing so may affect your ability to interact with certain features on our website or other websites. Please refer to your browser's documentation for more information on how to manage cookies.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement reasonable security measures to protect the non-personal information we collect. However, no method of transmission over the Internet or method of electronic storage is 100% secure. Therefore, while we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our website is not intended for children under the age of 13. We do not knowingly collect any personal identifying information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Mail className="h-5 w-5" />
                  <a href="mailto:contact-cgbd@comcubes.com" className="font-medium hover:underline">
                    contact-cgbd@comcubes.com
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* SEO Analyzer Component */}
    </div>
  );
}