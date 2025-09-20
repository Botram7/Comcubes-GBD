import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { AnimatedExplainer } from "@/components/AnimatedExplainer";
import { SEOHead, createBusinessDirectoryStructuredData } from "@/components/SEOHead";
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

import type { Sector, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";
import { getImageForEntity } from "@/lib/constants";
import comcubesLogo from "@assets/default_1752716413946.png";
import comcubesMonochrome from "@assets/default-monochrome_1752717527516.png";
import comcubesIcon from "@assets/2de77b64-4c39-4ddb-aa7a-0afd37edfe34_1752720571406.png";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2">
                <Target className="h-8 w-8 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">Error Loading Data</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Failed to load data. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const sectorCount = Array.isArray(sectors) ? sectors.length : 20;
  const industryCount = (industriesData as any)?.total || 400;
  const companyCount = (companiesData as any)?.total || 7400;

  return (
    <div className="min-h-screen bg-white  ">
      <AffiliateDisclosureBanner />
      <SEOHead 
        title="COMCUBES - Global Business Directory | Find Companies, Industries & Business Sectors"
        description="Discover thousands of companies across all business sectors and industries worldwide. COMCUBES is your comprehensive global business directory for everything and anything business."
        keywords={[
          'business directory', 'global companies', 'business sectors', 'industries', 
          'company listings', 'business search', 'commercial directory', 'worldwide businesses', 
          'corporate directory', 'industry directory', 'business database', 'company finder',
          'business networking', 'B2B directory', 'commercial cubes', 'global business search',
          'business intelligence', 'company profiles', 'industry analysis', 'business sectors list'
        ]}
        canonicalUrl={`${window.location.origin}/`}
        structuredData={createBusinessDirectoryStructuredData()}
      />
      {/* Header with Theme Toggle */}
      <header className="absolute top-0 right-0 z-50 p-4">
        
      </header>
      
      {/* Hero Section */}
      <section className="bg-gray-50 py-9 md:py-14">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mb-[18px] md:mb-[22px] flex justify-center">
            <img 
              src={heroLogo} 
              alt="COMCUBES Global Business Directory" 
              className="w-80 h-[104px] md:w-[500px] md:h-[166px] object-contain"
            />
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 600 }}>
            Global Business Directory
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            Navigate the world's most comprehensive business ecosystem. Discover 20 major business sectors,
            explore 400+ specialized industries, and connect with 7,400+ leading global companies—all organized
            in an intuitive hierarchical structure designed for business professionals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={handleExploreBusinessSectors}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
            >
              Explore Business Sectors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => setLocation('/search')}
              variant="outline"
              className="px-8 py-3 rounded-lg font-medium border-2 hover:bg-gray-50"
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
            {Array.isArray(sectors) && sectors.length > 0 ? sectors.slice(0, 10).map((sector: Sector) => (
              <Card 
                key={sector.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 bg-white overflow-hidden"
                onClick={() => handleSectorClick(sector)}
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
            >
              View All 20 Sectors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

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
            <Card className="text-center p-4 md:p-8 bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600 " />
              </div>
              <div className="text-3xl font-bold text-gray-900  mb-2">{sectorCount}</div>
              <div className="text-gray-600  font-medium mb-1">Business Sectors</div>
              <div className="text-sm text-gray-500">Major global business categories</div>
            </Card>

            <Card className="text-center p-4 md:p-8 bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900  mb-2">400+</div>
              <div className="text-gray-600  font-medium mb-1">Specialized Industries</div>
              <div className="text-sm text-gray-500">Detailed industry classifications</div>
            </Card>

            <Card className="text-center p-4 md:p-8 bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900  mb-2">7,400+</div>
              <div className="text-gray-600  font-medium mb-1">Global Companies</div>
              <div className="text-sm text-gray-500">Leading organizations worldwide</div>
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
              The most organized and comprehensive business directory designed for professionals,
              researchers, and decision makers worldwide.
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


      {/* Call to Action Section */}
      <section className="bg-blue-600 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Explore the Global Business Ecosystem?
          </h2>
          <p className="text-base md:text-lg text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who rely on COMCUBES for comprehensive
            business intelligence and industry insights.
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
                </div>
                <span className="text-xl font-bold" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</span>
              </div>
              <p className="text-gray-400 text-sm">
                Global Business Directory for comprehensive business intelligence.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
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
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 COMCUBES. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
