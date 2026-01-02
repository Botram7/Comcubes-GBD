import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { AnimatedExplainer } from "@/components/AnimatedExplainer";
import { ExploreByLocation } from "@/components/ExploreByLocation";
import { SEOHead, createBusinessDirectoryStructuredData, createFAQStructuredData, createOrganizationStructuredData, HOMEPAGE_FAQS, BRAND_KEYWORDS } from "@/components/SEOHead";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { 
  BarChart3, 
  Users, 
  Globe, 
  Target, 
  Search, 
  ArrowRight,
  Building2,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";

import type { Sector, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";
import { getImageForEntity } from "@/lib/constants";
import comcubesLogo from "@assets/default_1752716413946.png";
import comcubesMonochrome from "@assets/default-monochrome_1752717527516.png";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import newComcubesLogo from "@assets/Artboard 5_1753135425496.png";
import heroLogo from "@assets/comcubes-hero-logo.png";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: sectors, isLoading, error } = useQuery({
    queryKey: ["/api/sectors"],
    staleTime: Infinity,
  });

  const { data: industriesData } = useQuery({
    queryKey: ["/api/industries"],
    staleTime: Infinity,
  });

  const { data: companiesData } = useQuery({
    queryKey: ["/api/companies"],
    staleTime: Infinity,
  });

  const handleSectorClick = (sector: Sector) => {
    setLocation(`/sector/${encodeURIComponent(sector.name)}`);
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleExploreBusinessSectors = () => {
    setLocation('/sectors');
  };

  const handleDiscoverIndustries = () => {
    setLocation('/industries');
  };

  const handleStartExploring = () => {
    setLocation('/sectors');
  };

  const handleDiscoverCompanies = () => {
    setLocation('/companies');
  };

  const handleViewAllSectors = () => {
    setLocation('/sectors');
  };

  const sectorCount = Array.isArray(sectors) ? sectors.length : 20;
  const industryCount = (industriesData as any)?.total || 400;
  const companyCount = (companiesData as any)?.total || 7400;

  return (
    <div className="min-h-screen bg-white  ">
      <AffiliateDisclosureBanner />
      <SEOHead 
        title="COMCUBES - Discover Everything Business | Global Companies, Brands & Industries"
        description="Your gateway to everything business. Professionals, researchers, job seekers, shoppers, students—access 7,400+ curated companies across 400+ industries PLUS global search for millions worldwide. From Fortune 500 to local businesses, find exactly what you're looking for. COMCUBES (Comcube, Commercial Cubes) - your trusted business directory."
        keywords={[
          ...BRAND_KEYWORDS,
          'business directory', 'global companies', 'find businesses', 'discover brands', 
          'company search', 'universities worldwide', 'global brands', 'business discovery',
          'find employers', 'shopping brands', 'automotive companies', 'fashion brands',
          'education institutions', 'entertainment companies', 'local businesses', 'company finder',
          'business search', 'worldwide companies', 'industry directory', 'commercial directory',
          'business research', 'company intelligence', 'global search', 'business professionals',
          'global business directory', 'international companies', 'B2B directory', 'corporate directory'
        ]}
        canonicalUrl="https://comcubes.com/"
        ogTitle="COMCUBES - The Global Business Directory | Find Any Business Worldwide"
        ogDescription="Discover 7,400+ companies across 400+ industries. COMCUBES is your gateway to everything business - from Fortune 500 giants to local boutiques."
        structuredData={createBusinessDirectoryStructuredData()}
        additionalStructuredData={[
          createOrganizationStructuredData(),
          createFAQStructuredData(HOMEPAGE_FAQS)
        ]}
      />
      {/* Header with Theme Toggle */}
      <header className="absolute top-0 right-0 z-50 p-4">
        
      </header>
      
      {/* Hero Section */}
      <section className="bg-gray-50 py-9 md:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo */}
          <div className="mb-[18px] md:mb-[22px] flex justify-center">
            <img 
              src={heroLogo} 
              alt="COMCUBES Global Business Directory" 
              className="w-80 h-[104px] md:w-[500px] md:h-[166px] object-contain"
            />
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 600 }}>
            Your Gateway to Discover Everything Business
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            Whether you're a business professional conducting research, a job seeker exploring employers, a shopper discovering global brands, a student researching universities, or simply curious about businesses near you or anywhere in the world—COMCUBES is your gateway. Instantly access our curated directory of 7,400+ companies across 20 major sectors and 400+ specialized industries. Plus, tap into our powerful global search to discover millions of businesses worldwide. From Fortune 500 giants to local boutiques, find exactly what you're looking for.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={handleExploreBusinessSectors}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
              data-testid="button-explore-sectors"
            >
              Explore Business Sectors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => setLocation('/geography')}
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg font-medium"
              data-testid="button-explore-geography"
            >
              <Globe className="mr-2 h-4 w-4" />
              Browse By Location
            </Button>
            
            <Button 
              onClick={() => setLocation('/search')}
              variant="outline"
              className="px-8 py-3 rounded-lg font-medium border-2 hover:bg-gray-50"
              data-testid="button-advanced-search"
            >
              <Search className="mr-2 h-4 w-4" />
              Advanced Search
            </Button>
          </div>
        </div>
      </section>

      {/* Explore by Category */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              Start your journey through the global business landscape. Each sector contains 20
              specialized industries with leading companies in each field.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
            {isLoading || error ? (
              ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Energy', 'Transportation', 'Agriculture', 'Construction', 'Education'].map((sectorName, index) => (
                <Card 
                  key={index} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 bg-white overflow-hidden"
                  onClick={() => setLocation(`/sector/${encodeURIComponent(sectorName)}`)}
                  data-testid={`card-sector-placeholder-${index}`}
                >
                  <div className="aspect-square relative">
                    <img 
                      src={getImageForEntity(sectorName, 'sector')}
                      alt={sectorName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-center">
                      <div className="text-white font-medium text-sm leading-tight">
                        {sectorName}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : Array.isArray(sectors) && sectors.length > 0 ? sectors.slice(0, 10).map((sector: Sector) => (
              <Card 
                key={sector.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 bg-white overflow-hidden"
                onClick={() => handleSectorClick(sector)}
                data-testid={`card-sector-${sector.id}`}
              >
                <div className="aspect-square relative">
                  <img 
                    src={getImageForEntity(sector.name, 'sector')}
                    alt={sector.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <div className="text-white font-medium text-sm leading-tight">
                      {sector.name}
                    </div>
                  </div>
                </div>
              </Card>
            )) : null}
          </div>

          <div className="text-center">
            <Button 
              onClick={handleViewAllSectors}
              variant="outline" 
              className="px-8 py-3"
              data-testid="button-view-all-sectors"
            >
              View All 20 Sectors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Explore by Location */}
      <ExploreByLocation />

      {/* Animated Explainer Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedExplainer />
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <Card 
              className="text-center p-4 md:p-8 bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
              onClick={() => setLocation('/sectors')}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{sectorCount}</div>
              <div className="text-gray-600 font-medium mb-1">Business Sectors</div>
              <div className="text-sm text-gray-500">Major global business categories</div>
              <div className="text-xs text-blue-600 mt-2 font-medium">Browse All Sectors →</div>
            </Card>

            <Card 
              className="text-center p-4 md:p-8 bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-purple-300"
              onClick={() => setLocation('/industries')}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">400+</div>
              <div className="text-gray-600 font-medium mb-1">Specialized Industries</div>
              <div className="text-sm text-gray-500">Detailed industry classifications</div>
              <div className="text-xs text-purple-600 mt-2 font-medium">Browse All Industries →</div>
            </Card>

            <Card 
              className="text-center p-4 md:p-8 bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-green-300"
              onClick={() => setLocation('/companies')}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">7,400+</div>
              <div className="text-gray-600 font-medium mb-1">Global Companies</div>
              <div className="text-sm text-gray-500">Leading organizations worldwide</div>
              <div className="text-xs text-green-600 mt-2 font-medium">Browse All Companies →</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Comcubes GBD?
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              The most organized and comprehensive business directory designed for professionals, researchers, decision makers, students, job seekers, shoppers, and anyone seeking reliable business information worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="p-4 md:p-6 bg-gray-50 border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-sm text-gray-600">
                Comprehensive coverage of businesses across all major global markets and economic zones.
              </p>
            </Card>

            <Card className="p-4 md:p-6 bg-gray-50 border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hierarchical Structure</h3>
              <p className="text-sm text-gray-600">
                Intuitive navigation from broad sectors to specific industries to individual companies.
              </p>
            </Card>

            <Card className="p-4 md:p-6 bg-gray-50 border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Access</h3>
              <p className="text-sm text-gray-600">
                Quick access to company websites and direct contact information for business development.
              </p>
            </Card>

            <Card className="p-4 md:p-6 bg-gray-50 border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Focus</h3>
              <p className="text-sm text-gray-600">
                Curated for business professionals, analysts, and researchers seeking reliable data.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Explore Our Directory Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Explore Our Business Directory
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Navigate through our comprehensive business ecosystem. Start broad with sectors, 
              narrow down to specific industries, or dive directly into company profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Directory Pages */}
            <Card className="p-4 sm:p-6 bg-white shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => { window.scrollTo(0, 0); setLocation('/sectors'); }}
                  className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">All Business Sectors</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => { window.scrollTo(0, 0); setLocation('/industries'); }}
                  className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">All Industries</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => { window.scrollTo(0, 0); setLocation('/companies'); }}
                  className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">All Companies</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Card>

            {/* Featured Sectors */}
            <Card className="p-4 sm:p-6 bg-white shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Popular Sectors</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => { window.scrollTo(0, 0); setLocation('/sector/Technology'); }}
                  className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">Technology</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => setLocation('/sector/Healthcare and Pharmaceuticals')}
                  className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">Healthcare and Pharmaceuticals</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => setLocation('/sector/Banking and Financial Services')}
                  className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">Banking and Financial Services</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Card>

            {/* Tools & Features */}
            <Card className="p-4 sm:p-6 bg-white shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Tools & Features</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => { window.scrollTo(0, 0); setLocation('/search'); }}
                  className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">Advanced Search</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => { window.scrollTo(0, 0); setLocation('/list-company'); }}
                  className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">List Your Company</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => { window.scrollTo(0, 0); setLocation('/contact'); }}
                  className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">Contact Support</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-600 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Explore the Global Business Ecosystem?
          </h2>
          <p className="text-base md:text-lg text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of professionals, researchers, and decision makers worldwide—along with students, job seekers, and shoppers—who rely on COMCUBES for comprehensive business intelligence, research, and discovery.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleStartExploring}
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
            >
              Start Exploring Now
            </Button>
            <Button 
              onClick={handleDiscoverCompanies}
              className="bg-blue-800 text-white border-2 border-white hover:bg-blue-700 hover:border-blue-100 px-8 py-3"
            >
              <Search className="mr-2 h-4 w-4" />
              Discover Companies
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Footer Links - 4 Equal Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Browse Directory</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setLocation('/sectors')} className="hover:text-white text-left">All Business Sectors</button></li>
                <li><button onClick={() => setLocation('/industries')} className="hover:text-white text-left">All Industries</button></li>
                <li><button onClick={() => setLocation('/companies')} className="hover:text-white text-left">All Companies</button></li>
                <li><button onClick={() => setLocation('/search')} className="hover:text-white text-left">Advanced Search</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setLocation('/privacy-policy')} className="hover:text-white text-left">Privacy Policy</button></li>
                <li><button onClick={() => setLocation('/terms-of-service')} className="hover:text-white text-left">Terms of Service</button></li>
                <li><button onClick={() => setLocation('/disclaimer')} className="hover:text-white text-left">Disclaimer</button></li>
                <li><button onClick={() => setLocation('/affiliate-disclosure')} className="hover:text-white text-left">Affiliate Disclosure</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button 
                    onClick={() => setLocation('/contact')} 
                    className="hover:text-white text-left transition-colors"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-3">
                <a 
                  href="https://www.instagram.com/comcubes/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
                  aria-label="Follow us on Instagram"
                  data-testid="link-instagram"
                >
                  <FaInstagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://x.com/comcubes195980" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-black transition-colors"
                  aria-label="Follow us on X (Twitter)"
                  data-testid="link-twitter"
                >
                  <FaXTwitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row items-center justify-center">
              <p className="text-gray-400 text-sm">
                © 2025 COMCUBES. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
