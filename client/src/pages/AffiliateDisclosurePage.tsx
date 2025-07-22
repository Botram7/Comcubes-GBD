import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, HelpCircle, DollarSign, Shield } from "lucide-react";
import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";
import { useEffect } from "react";

export default function AffiliateDisclosurePage() {
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
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Disclosure</h1>
              <p className="text-gray-600 mb-8">Last Updated: July 22, 2025</p>

              <p className="text-gray-700 mb-6">
                Welcome to Comcubes Global Business Directory ("Comcubes GBD," "we," "us," or "our"). This page is dedicated to transparently explaining our use of affiliate links throughout our website, https://www.comcubes.com. Your trust is important to us, and we want you to understand how we operate and generate revenue.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What Are Affiliate Links?</h2>
              <p className="text-gray-700 mb-4">
                Throughout Comcubes GBD, you will find various links that direct you to external websites. Some of these links are "affiliate links." This means that if you click on one of these links and subsequently make a purchase or take a specific action (like signing up for a service) on the third-party website, we may earn a commission or a referral fee from that third party.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How Do Affiliate Links Work?</h2>
              <p className="text-gray-700 mb-4">
                When you click on an affiliate link on our site, a small piece of data (often called a "cookie") may be placed on your browser by the affiliate program partner. This cookie helps the partner track that you were referred from Comcubes GBD. If you then complete a qualifying action (e.g., purchase a product or service), the commission is attributed to us.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Does Using Affiliate Links Cost You More?</h3>
                    <p className="text-green-700 text-sm">
                      <strong>No, absolutely not!</strong> Clicking an affiliate link and making a purchase through it will never cost you anything extra. The price you pay for the product or service on the third-party website is precisely the same as if you had navigated directly to that website without using our link. The commission is paid by the company whose product or service you purchase, as a way of rewarding us for driving traffic and sales to them.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Why Does Comcubes GBD Use Affiliate Links?</h2>
              <p className="text-gray-700 mb-4">
                Comcubes GBD strives to be a comprehensive and valuable resource for professionals, investors, and industry researchers seeking information on global organizations. Maintaining and continually expanding a directory of 7,000+ companies, along with providing a seamless user experience, requires significant resources.
              </p>
              <p className="text-gray-700 mb-4">
                Our participation in affiliate marketing programs is a key way we monetize our website. These commissions help us to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li className="mb-2">Cover the operational costs of our website (hosting, maintenance, development).</li>
                <li className="mb-2">Fund research and content creation to keep our directory current and comprehensive.</li>
                <li className="mb-2">Invest in improving the functionality and user experience of Comcubes GBD.</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Your decision to use our affiliate links helps support our mission and allows us to continue offering our directory services for free to you.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Commitment to You:</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Independence</h3>
                  <p className="text-gray-700">
                    Our primary goal is to provide a valuable and accurate directory. Our affiliate relationships do not influence the inclusion of companies in our directory, their categorization, or the objective information we present about them. We only seek affiliate partnerships with companies that we believe offer relevant and reputable products or services to our audience.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Transparency</h3>
                  <p className="text-gray-700">
                    We are committed to being transparent about our affiliate relationships. This dedicated disclosure page is part of that commitment.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Important Note Regarding Third-Party Websites</h3>
                    <p className="text-blue-700 text-sm">
                      When you click an affiliate link, you will be redirected to a third-party website that is not owned or controlled by Comcubes GBD. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites you visit.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Frequently Asked Questions (FAQ) about Affiliate Links</h2>
              
              <div className="space-y-6 mb-8">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Q1: What exactly is an "affiliate link"?</h3>
                      <p className="text-gray-700 text-sm">
                        <strong>A1:</strong> An affiliate link is a special URL that contains a unique tracking ID. When you click it, it tells the merchant (the company whose product/service you're buying) that you were referred by Comcubes GBD. If you make a purchase, we earn a small commission.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Q2: Will I pay more for a product or service if I use your affiliate link?</h3>
                      <p className="text-gray-700 text-sm">
                        <strong>A2:</strong> No, never. The price of the product or service remains exactly the same for you, whether you use our affiliate link or go directly to the merchant's website. The commission comes from the merchant's marketing budget, not from your pocket.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Q3: Does clicking an affiliate link affect my privacy?</h3>
                      <p className="text-gray-700 text-sm">
                        <strong>A3:</strong> When you click an affiliate link, a cookie may be placed on your browser to track the referral. This cookie typically does not contain personal identifying information about you. It's used solely to attribute the sale to Comcubes GBD. For more details on data collection, please see our Privacy Policy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Q4: Do you only list companies that have affiliate programs?</h3>
                      <p className="text-gray-700 text-sm">
                        <strong>A4:</strong> No. Our directory aims to be comprehensive and includes thousands of major global organizations regardless of whether they have an affiliate program. We only integrate affiliate links for companies for whom we've applied to and been accepted into their programs. Our core mission is unbiased information and connection.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Q5: How can I identify an affiliate link on your website?</h3>
                      <p className="text-gray-700 text-sm">
                        <strong>A5:</strong> While we aim for clear general disclosure on this page and through our Disclaimer, many affiliate links are seamlessly integrated for user convenience (e.g., embedded within company logos/names that link out). By reading this page, you are now aware that links redirecting you to external company websites (especially those leading to product/service pages) may be affiliate links.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any further questions about our affiliate relationships, please feel free to contact us at:
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
    </div>
  );
}