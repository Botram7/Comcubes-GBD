import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";
import { useEffect } from "react";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";
import { SEOAnalyzer } from "@/components/SEOAnalyzer";

export default function TermsOfServicePage() {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
              <p className="text-gray-600 mb-8">Last Updated: July 21, 2025</p>

              <p className="text-gray-700 mb-6">
                Welcome to Comcubes Global Business Directory ("Comcubes GBD," "we," "us," or "our"), an online platform providing a global business directory. By accessing or using our website, located at https://www.comcubes.com, you ("User," "you") agree to be bound by these Terms of Service ("Terms"). Please read them carefully. If you do not agree with any part of these Terms, you must not use our website.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Comcubes GBD, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and our Disclaimer. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Purpose of Comcubes GBD</h2>
              <p className="text-gray-700 mb-4">
                Comcubes GBD is designed to be a comprehensive global business directory. Our purpose is to provide users with a structured, intuitive, and direct access point to discover leading organizations worldwide, organized hierarchically by major business sectors and specialized industries. We aim to facilitate immediate business connections by directing users to the official websites of listed companies.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Use of Third-Party Trademarks and Logos (Nominative Fair Use)</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li className="mb-3">
                  <strong>Identification Purpose Only:</strong> Comcubes GBD displays the names and logos of various global companies ("Third-Party Trademarks") within our directory listings. These Third-Party Trademarks are used solely for the purpose of accurately identifying the respective companies and their associated products or services within our directory.
                </li>
                <li className="mb-3">
                  <strong>No Endorsement or Affiliation Implied:</strong> The use of Third-Party Trademarks on Comcubes GBD does not imply, suggest, or constitute any sponsorship, endorsement, partnership, affiliation, or official relationship between Comcubes GBD and the owners of these trademarks. We are an independent directory.
                </li>
                <li className="mb-3">
                  <strong>Referential Use:</strong> Our use of these logos and names is considered "nominative fair use" as it is reasonably necessary to refer to the companies in our directory, and there is no other practical way to identify them without using their trademarks.
                </li>
                <li className="mb-3">
                  <strong>Accurate Representation:</strong> We endeavor to display the official and unmodified logos of companies and link them directly to their respective official websites.
                </li>
                <li className="mb-3">
                  <strong>Trademark Owner's Rights:</strong> All Third-Party Trademarks displayed on our website are the property of their respective owners. Their inclusion on Comcubes GBD does not transfer any rights, title, or interest in those trademarks to Comcubes GBD or its users. If you are a trademark owner and believe your mark is being used inappropriately, please contact us immediately at contact-cgbd@comcubes.com. We are committed to promptly addressing valid concerns.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Affiliate Links and Monetization</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li className="mb-3">
                  <strong>Affiliate Relationships:</strong> Comcubes GBD participates in various affiliate marketing programs. This means that when you click on certain links on our website that direct you to third-party websites (including links associated with company listings and banner ads), and you subsequently make a purchase or take another action on those third-party sites, we may earn a commission or referral fee.
                </li>
                <li className="mb-3">
                  <strong>No Additional Cost:</strong> These commissions are earned at no additional cost to you. The price you pay for products or services through our affiliate links is the same as if you went directly to the third-party website.
                </li>
                <li className="mb-3">
                  <strong>Disclosure:</strong> Our participation in affiliate programs is a means of monetizing our website to support its operation and maintenance. Your support by using these links is appreciated. For more detailed information, please refer to our separate Disclaimer.
                </li>
                <li className="mb-3">
                  <strong>Third-Party Responsibility:</strong> We are not responsible for the products, services, privacy practices, or content of any third-party websites or affiliate partners. Your interactions with any third-party websites linked from Comcubes GBD are solely between you and that third party.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Intellectual Property Rights</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li className="mb-3">
                  <strong>Our Content:</strong> All content on Comcubes GBD, excluding Third-Party Trademarks (as defined in Section 3), including text, graphics, logos, icons, images, audio clips, digital downloads, and data compilations, is the property of Comcubes GBD or its content suppliers and protected by international copyright laws.
                </li>
                <li className="mb-3">
                  <strong>Limited License:</strong> You are granted a limited, non-exclusive, non-transferable, revocable license to access and use Comcubes GBD for your personal, non-commercial use, strictly in accordance with these Terms.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li className="mb-2">Use Comcubes GBD for any unlawful purpose or in any way that violates any applicable local, national, or international law or regulation.</li>
                <li className="mb-2">Attempt to gain unauthorized access to any portion or feature of Comcubes GBD.</li>
                <li className="mb-2">Use any "deep-link," "page-scrape," "robot," "spider," or other automatic device, program, algorithm or methodology, or any similar or equivalent manual process, to access, acquire, copy or monitor any portion of Comcubes GBD.</li>
                <li className="mb-2">Engage in any activity that interferes with or disrupts Comcubes GBD (or the servers and networks which are connected to the Service).</li>
                <li className="mb-2">Scrape, collect, or store any information about other users or companies displayed on Comcubes GBD, except as explicitly permitted by these Terms.</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Disclaimers and Limitation of Liability</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li className="mb-3">
                  <strong>"As Is" Basis:</strong> Comcubes GBD is provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </li>
                <li className="mb-3">
                  <strong>Accuracy of Information:</strong> While we strive to provide accurate and up-to-date information, Comcubes GBD does not warrant the completeness, reliability, or accuracy of any information on the website, including company details, industry classifications, or the availability of companies' products/services.
                </li>
                <li className="mb-3">
                  <strong>Third-Party Links:</strong> We are not responsible for the content, privacy policies, or practices of any third-party websites or services linked to from Comcubes GBD. Your use of such links is at your own risk.
                </li>
                <li className="mb-3">
                  <strong>No Guarantee of Connection:</strong> Comcubes GBD facilitates connections by linking to company websites; however, we do not guarantee any specific outcomes, business opportunities, or interactions resulting from your use of our directory.
                </li>
                <li className="mb-3">
                  <strong>Limitation of Liability:</strong> To the fullest extent permitted by applicable law, in no event shall Comcubes GBD, its affiliates, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to defend, indemnify, and hold harmless Comcubes GBD and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of: (a) your use and access of the Service; (b) a breach of these Terms; or (c) any activity undertaken by you or any person using your account.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Governing Law and Jurisdiction</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Lagos, Nigeria.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Severability</h2>
              <p className="text-gray-700 mb-4">
                If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to These Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms, please contact us at:
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
      <SEOAnalyzer />
    </div>
  );
}