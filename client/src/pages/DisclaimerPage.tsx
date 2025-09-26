import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import { useEffect } from "react";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";

export default function DisclaimerPage() {
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 py-2 sm:py-0 min-h-16">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" onClick={() => setLocation('/')}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 mr-2 sm:mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
            </div>
            <Button 
              onClick={handleBackToHome}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 ml-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Disclaimer</h1>
              <p className="text-gray-600 mb-8">Last Updated: July 21, 2025</p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Affiliate Disclosure</h2>
              <p className="text-gray-700 mb-4">
                Comcubes Global Business Directory (Comcubes GBD) is a participant in various affiliate marketing programs. This means that we may earn a commission or referral fee when you click on links on our website that direct you to third-party websites and subsequently make a purchase or complete a qualifying action.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">How it Works</h3>
                    <p className="text-amber-700 text-sm">
                      These affiliate links are included within our company listings (for companies with which we have an affiliate relationship) and in dedicated banner advertisements across the site.
                    </p>
                  </div>
                </div>
              </div>

              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li className="mb-3">
                  <strong>No Extra Cost to You:</strong> Please be assured that any commission we earn comes at no additional cost to you. The price of the product or service remains the same whether you purchase it through our affiliate link or directly from the vendor.
                </li>
                <li className="mb-3">
                  <strong>Purpose:</strong> These commissions help us to maintain and operate Comcubes GBD, providing you with a free and comprehensive global business directory.
                </li>
                <li className="mb-3">
                  <strong>Independence:</strong> Our participation in affiliate programs does not influence the objectivity of our directory listings or the content we provide. We strive to present accurate and useful information to our users.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Use of Third-Party Logos and Trademarks</h2>
              <p className="text-gray-700 mb-4">
                Comcubes GBD displays company names and logos for identification purposes only, to help you easily recognize and navigate to the official websites of the businesses listed in our directory.
              </p>
              <p className="text-gray-700 mb-4">
                The use of these logos and trademarks does not imply any endorsement, sponsorship, partnership, or affiliation between Comcubes GBD and the respective trademark owners. We are an independent business directory.
              </p>
              <p className="text-gray-700 mb-6">
                All trademarks and logos are the property of their respective owners.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. General Information & External Links</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Accuracy</h3>
                  <p className="text-gray-700">
                    While we strive to ensure the information on Comcubes GBD is accurate and up-to-date, we make no warranties or representations of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">External Websites</h3>
                  <p className="text-gray-700">
                    Our website contains links to other websites that are not operated by us (e.g., official company websites, affiliate partners). We have no control over the content, products, services, or privacy practices of these third-party sites and assume no responsibility for them. We strongly advise you to review the Terms of Service and Privacy Policies of any third-party websites you visit.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">External Link Notice</h3>
                    <p className="text-blue-700 text-sm">
                      When you click on external links, you will be leaving Comcubes GBD and entering third-party websites. Please review their policies and terms before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. No Professional Advice</h2>
              <p className="text-gray-700 mb-6">
                The information provided on Comcubes GBD is for general informational purposes only and does not constitute professional, financial, legal, or business advice. You should consult with appropriate professionals for specific advice tailored to your situation.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Changes to This Disclaimer</h2>
              <p className="text-gray-700 mb-6">
                We may update this Disclaimer from time to time. We will notify you of any changes by posting the new Disclaimer on this page. You are advised to review this Disclaimer periodically for any changes.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
                <h3 className="font-semibold text-gray-800 mb-3">Important Notice</h3>
                <p className="text-gray-700 text-sm">
                  By using Comcubes Global Business Directory, you acknowledge that you have read and understood this Disclaimer and agree to its terms. If you do not agree with any part of this Disclaimer, please discontinue use of our website immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* SEO Analyzer Component */}
    </div>
  );
}