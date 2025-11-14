import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, ArrowLeft } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";
import { ReadMore } from "@/components/ReadMore";

import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import { BannerAd } from "@/components/BannerAd";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { getActiveBannerImages, getBannerClickUrl } from "@/config/bannerAds";
import type { Sector, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

export default function SectorsPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: sectors, isLoading, error } = useQuery<Sector[]>({
    queryKey: ["/api/sectors"],
    staleTime: Infinity,
  });

  const handleSectorClick = (sector: Sector) => {
    setLocation(`/sector/${encodeURIComponent(sector.name)}`);
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mr-1 sm:mr-4" onClick={() => setLocation('/')}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                    <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                </div>
                <div className="flex-1 mr-2 sm:mr-4">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
                <div className="hidden sm:flex items-center">
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              </div>
              <div className="sm:hidden mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2 w-full justify-center"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading business sectors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mr-1 sm:mr-4" onClick={() => setLocation('/')}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                    <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                </div>
                <div className="flex-1 mr-2 sm:mr-4">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
                <div className="hidden sm:flex items-center">
                  <span className="text-sm text-gray-600">Error</span>
                </div>
              </div>
              <div className="sm:hidden mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2 w-full justify-center"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">Error Loading Data</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Failed to load business sectors. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sticky-footer bg-gray-50  font-inter ">
      <AffiliateDisclosureBanner />
      <SEOHead 
        title={`Explore ${sectors?.length || 20} Business Sectors | Find Universities, Brands, Companies & More - COMCUBES`}
        description={`Find what you're looking for across ${sectors?.length || 20} sectors: Education (universities), Retail (fashion, shopping), Automotive (car brands), Healthcare, Entertainment, Food & Beverages, and more. 400+ industries, 7,400+ companies worldwide.`}
        keywords={[
          "business sectors", "find universities", "global brands", "shopping brands", 
          "automotive companies", "fashion brands", "healthcare providers", "entertainment companies",
          "food and beverages", "retail stores", "education institutions", "discover businesses",
          "company directory", "brand discovery", "business categories", "industry sectors"
        ]}
        canonicalUrl={`${window.location.origin}/sectors`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Business Sectors Directory",
          "description": `Comprehensive directory of ${sectors?.length || 20} business sectors with specialized industries and companies worldwide`,
          "url": `${window.location.origin}/sectors`,
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": sectors?.map((sector, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Thing",
                "name": sector.name,
                "url": `${window.location.origin}/sector/${encodeURIComponent(sector.name)}`,
                "description": `Business sector focusing on ${sector.name.toLowerCase()}`
              }
            })) || []
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": `${window.location.origin}/` },
              { "@type": "ListItem", "position": 2, "name": "Business Sectors", "item": `${window.location.origin}/sectors` }
            ]
          }
        }}
      />
      <header className="bg-white  shadow-sm border-b border-gray-200  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Main header row */}
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mr-1 sm:mr-4" onClick={() => setLocation('/')}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
              </div>
              
              <div className="flex-1 mr-2 sm:mr-4 min-w-0">
                <SearchBar onSearchResults={handleSearchResults} />
              </div>

              {/* Keep Home button for desktop only */}
              <div className="hidden sm:flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToHome}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </div>
            </div>
            
            {/* Mobile Advanced Search button beneath logo and search */}
            <div className="sm:hidden mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/search')}
                className="flex items-center gap-2 w-full justify-center"
              >
                <Building2 className="h-4 w-4" />
                Advanced Search
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Breadcrumbs 
        items={[
          { label: "Home", onClick: handleBackToHome },
          { label: "Business Sectors" }
        ]} 
      />

      <main className="main-content-with-sticky-footer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Advertisement Banner - 160x600 */}
          <div className="hidden lg:block flex-shrink-0">
            <GoogleAdSense 
              format="vertical"
              className="sticky top-24"
              position="sectors-page-left-sidebar"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {searchResults ? (
              <div className="space-y-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Search Results</h2>
                  <p className="text-gray-600 mt-2">
                    Found {searchResults.sectors.length + searchResults.industries.length + searchResults.companies.length} results
                  </p>
                </div>

                {searchResults.sectors.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Sectors</h3>
                    <BusinessGrid 
                      items={searchResults.sectors} 
                      type="sector" 
                      onItemClick={handleSectorClick} 
                    />
                  </div>
                )}

                {searchResults.industries.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Industries</h3>
                    <BusinessGrid 
                      items={searchResults.industries} 
                      type="industry" 
                      onItemClick={(industry) => setLocation(`/industry/${encodeURIComponent(industry.name)}`)} 
                    />
                  </div>
                )}

                {searchResults.companies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Companies</h3>
                    <BusinessGrid 
                      items={searchResults.companies} 
                      type="company" 
                      onItemClick={(company) => {
                        if ((company as any).websiteUrl) {
                          window.open((company as any).websiteUrl, '_blank');
                        }
                      }} 
                      showClaimButtons={true}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore {sectors?.length || 20} Business Sectors</h1>
                  
                  <ReadMore className="prose max-w-none text-gray-700">
                    <div className="space-y-4">
                      <p className="text-lg leading-relaxed">
                        Welcome to COMCUBES' comprehensive business sector directory. Whether you're a professional conducting market research, a job seeker exploring potential employers, a shopper discovering new brands, a student researching universities, or simply curious about businesses in any field—this is your starting point for navigating the global business landscape.
                      </p>

                      <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">What Are Business Sectors?</h2>
                      <p>
                        Business sectors represent the highest-level categorization of economic activity. Each of our {sectors?.length || 20} major sectors encompasses a broad area of commerce, from Education and Healthcare to Retail, Automotive, and Entertainment. Think of sectors as the main chapters in the story of global business—each one containing specialized industries and thousands of companies operating within that domain.
                      </p>

                      <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">How to Use This Directory</h2>
                      <p>
                        Our hierarchical navigation system makes finding businesses intuitive and efficient. Start by selecting a sector that matches your interest—for example, if you're looking for universities, choose Education; if you're shopping for fashion brands, select Retail; or if you're researching car manufacturers, click on Automotive. Each sector contains 20 specialized industries, and each industry showcases up to 20 leading companies in that field. This structured approach helps you quickly drill down from broad categories to specific businesses.
                      </p>

                      <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Who Benefits from COMCUBES?</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Business Professionals:</strong> Conduct competitive analysis, identify industry players, and research market trends across multiple sectors.</li>
                        <li><strong>Job Seekers:</strong> Explore potential employers in your field, discover companies you didn't know existed, and research organizations before interviews.</li>
                        <li><strong>Shoppers & Consumers:</strong> Find global brands, discover new products, and explore companies offering specific goods or services.</li>
                        <li><strong>Students & Researchers:</strong> Access educational institutions worldwide, study industry structures, and gather business intelligence for projects.</li>
                        <li><strong>Entrepreneurs:</strong> Identify competitors, find suppliers or partners, and understand market landscapes in various industries.</li>
                      </ul>

                      <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">What Makes Our Directory Unique?</h2>
                      <p>
                        COMCUBES offers both breadth and depth. Our curated local directory features 7,400+ carefully selected companies across 400+ industries, organized into {sectors?.length || 20} major sectors. But we don't stop there—our integrated global search powered by Google Custom Search API extends your reach to millions of businesses worldwide. This dual approach means you can browse our expertly organized directory for quality curation, then expand to global search when you need comprehensive coverage.
                      </p>

                      <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Start Your Discovery Journey</h2>
                      <p>
                        Select any sector below to begin exploring. Each sector card shows the breadth of that business area, with visual cues and industry counts to guide your navigation. Whether you're looking for specific companies like Apple in Technology, Harvard University in Education, or Nike in Retail—or simply browsing to discover new businesses—your journey through the global business landscape starts here.
                      </p>

                      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-5">
                        <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                          <span className="flex items-center gap-2">📊 {sectors?.length || 20} Business Sectors</span>
                          <span className="flex items-center gap-2">🏭 400+ Specialized Industries</span>
                          <span className="flex items-center gap-2">🌍 7,400+ Global Companies</span>
                          <span className="flex items-center gap-2">🔍 Advanced Search Available</span>
                        </div>
                      </div>
                    </div>
                  </ReadMore>
                </div>

                <BusinessGrid items={sectors || []} type="sector" onItemClick={handleSectorClick} />

                {/* In-content Advertisement - Responsive */}
                <div className="my-8 flex justify-center">
                  <GoogleAdSense 
                    format="responsive"
                    className="w-full max-w-4xl"
                    position="sectors-page-in-content"
                  />
                </div>

                <div className="mt-12 text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Navigation Guide</h3>
                    <p className="text-blue-700 text-sm">
                      • Select a business sector above to view its 20 specialized industries<br/>
                      • From each industry page, explore the top 20 companies in that field<br/>
                      • Click on company names to visit their official websites
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Advertisement Banner - 160x600 */}
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd 
              className="sticky top-24" 
              position="right"
            />
          </div>
        </div>
      </main>

      <footer className="sticky-footer mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring {sectors?.length || 20} sectors, 400+ industries, and 7,400+ companies worldwide.</p>
            <div className="mt-4 flex justify-center space-x-6 text-xs">
              <button onClick={() => setLocation('/privacy-policy')} className="hover:text-gray-900 underline">Privacy Policy</button>
              <button onClick={() => setLocation('/terms-of-service')} className="hover:text-gray-900 underline">Terms of Service</button>
              <button onClick={() => setLocation('/disclaimer')} className="hover:text-gray-900 underline">Disclaimer</button>
              <button onClick={() => setLocation('/affiliate-disclosure')} className="hover:text-gray-900 underline">Affiliate Disclosure</button>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}