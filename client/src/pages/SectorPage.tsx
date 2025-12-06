import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2 } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData, createItemListStructuredData, BRAND_KEYWORDS } from "@/components/SEOHead";

import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { BannerAd } from "@/components/BannerAd";
import type { Industry, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

export default function SectorPage() {
  const { sectorName } = useParams();
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  const decodedSectorName = decodeURIComponent(sectorName || "");

  // Scroll to top when component mounts or sector changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sectorName]);

  const { data: industries = [], isLoading, error } = useQuery({
    queryKey: [`/api/sectors/${encodeURIComponent(decodedSectorName)}/industries`],
    enabled: !!sectorName,
    staleTime: Infinity,
  });

  const handleIndustryClick = (item: any) => {
    setLocation(`/industry/${encodeURIComponent(item.name)}`);
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleCompanyClick = (company: any) => {
    if (company.websiteUrl) {
      window.open(company.websiteUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mr-4" onClick={() => setLocation('/')}>
                  <div className="w-16 h-16 mr-3 flex items-center justify-center">
                    <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
                  </div>
                </div>
                <div className="flex-1 mr-4">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
                <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/search')}
                    className="flex items-center gap-2 flex-shrink-0"
                  >
                    <Building2 className="h-4 w-4" />
                    Advanced Search
                  </Button>
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
            <p className="mt-4 text-gray-600">Loading industries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !Array.isArray(industries) || industries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mr-4" onClick={() => setLocation('/')}>
                  <div className="w-16 h-16 mr-3 flex items-center justify-center">
                    <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
                  </div>
                </div>
                <div className="flex-1 mr-4">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
                <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/search')}
                    className="flex items-center gap-2 flex-shrink-0"
                  >
                    <Building2 className="h-4 w-4" />
                    Advanced Search
                  </Button>
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
                <h1 className="text-2xl font-bold text-gray-900">Sector Not Found</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                The requested sector could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <AffiliateDisclosureBanner />
      <SEOHead 
        title={`${decodedSectorName} Industries & Companies | COMCUBES Global Directory`}
        description={`Explore specialized industries within ${decodedSectorName} sector. Discover top companies, industry leaders, and business opportunities in ${decodedSectorName}. Browse ${Array.isArray(industries) ? industries.length : 20} industries on COMCUBES (Comcube) business directory.`}
        keywords={[
          ...BRAND_KEYWORDS.slice(0, 5),
          `${decodedSectorName.toLowerCase()} sector`, `${decodedSectorName.toLowerCase()} industries`, `${decodedSectorName.toLowerCase()} companies`,
          `${decodedSectorName.toLowerCase()} business`, `${decodedSectorName.toLowerCase()} directory`, `top ${decodedSectorName.toLowerCase()} companies`,
          `${decodedSectorName.toLowerCase()} industry leaders`, `find ${decodedSectorName.toLowerCase()} businesses`,
          "sector industries", "business sectors", "industry listings", "company directory", "business listings"
        ]}
        canonicalUrl={`https://comcubes.com/sector/${encodeURIComponent(decodedSectorName)}`}
        ogTitle={`${decodedSectorName} Industries & Companies | COMCUBES`}
        ogDescription={`Browse ${Array.isArray(industries) ? industries.length : 20} industries in the ${decodedSectorName} sector. Find top companies and business opportunities.`}
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: "https://comcubes.com/" },
          { name: "Business Sectors", url: "https://comcubes.com/sectors" },
          { name: decodedSectorName, url: `https://comcubes.com/sector/${encodeURIComponent(decodedSectorName)}` }
        ])}
        additionalStructuredData={[
          createItemListStructuredData(
            (Array.isArray(industries) ? industries : []).slice(0, 20).map((ind: any) => ({
              name: ind.name,
              url: `https://comcubes.com/industry/${encodeURIComponent(ind.name)}`,
              description: `${ind.name} industry in ${decodedSectorName} sector`
            })),
            `Industries in ${decodedSectorName}`,
            `https://comcubes.com/sector/${encodeURIComponent(decodedSectorName)}`
          )
        ]}
      />
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Main header row */}
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mr-4" onClick={() => setLocation('/')}>
                <div className="w-16 h-16 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
                </div>
              </div>
              
              <div className="flex-1 mr-4">
                <SearchBar onSearchResults={handleSearchResults} />
              </div>

              {/* Keep Advanced Search and info for desktop only */}
              <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
                <span className="text-sm text-gray-600">Industries in {decodedSectorName}</span>
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
          { label: "Home", onClick: () => setLocation("/") },
          { label: "Business Sectors", onClick: () => setLocation("/sectors") },
          { label: decodedSectorName }
        ]} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="left" />
          </div>
          
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
                  onItemClick={(sector) => setLocation(`/sector/${encodeURIComponent(sector.name)}`)} 
                />
              </div>
            )}

            {searchResults.industries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Industries</h3>
                <BusinessGrid 
                  items={searchResults.industries} 
                  type="industry" 
                  onItemClick={handleIndustryClick}
                  currentSector={decodedSectorName}
                />
              </div>
            )}

            {searchResults.companies.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Companies</h3>
                <BusinessGrid 
                  items={searchResults.companies} 
                  type="company" 
                  onItemClick={handleCompanyClick}
                  showClaimButtons={true}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{decodedSectorName} Sector</h1>
              <p className="text-gray-600 mt-2">
                Explore {Array.isArray(industries) ? industries.length : 0} specialized industries within the {decodedSectorName} sector. Each industry features leading companies with detailed profiles, direct website access, and business opportunities. Navigate through industry leaders, emerging companies, and professional networks in this comprehensive sector directory.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <span>🏭 {Array.isArray(industries) ? industries.length : 0} Industries</span>
                <span>🌍 Global Coverage</span>
                <span>📊 Professional Profiles</span>
              </div>
              
              {/* Quick Navigation Links */}
              <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-3">Explore More Business Sectors</h3>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/sectors'); }}
                    className="text-xs px-3 py-1 bg-white border border-blue-300 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    All Business Sectors
                  </button>
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/industries'); }}
                    className="text-xs px-3 py-1 bg-white border border-blue-300 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    All Industries
                  </button>
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/companies'); }}
                    className="text-xs px-3 py-1 bg-white border border-blue-300 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    All Companies
                  </button>
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/search'); }}
                    className="text-xs px-3 py-1 bg-white border border-blue-300 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    Advanced Search
                  </button>
                </div>
              </div>
            </div>

            <BusinessGrid items={industries} type="industry" onItemClick={handleIndustryClick} currentSector={decodedSectorName} />
            
            {/* Related Sectors Navigation */}
            {Array.isArray(industries) && industries.length > 0 && (
              <div className="mt-12 p-4 sm:p-6 bg-gray-50 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Continue Exploring Business Sectors</h3>
                <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                  Discover more business opportunities across different sectors. Each sector contains specialized industries with leading companies worldwide.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/sector/Technology'); }}
                    className="p-3 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left text-sm"
                  >
                    <div className="font-medium text-gray-900">Technology</div>
                    <div className="text-xs text-gray-500">Innovation & Digital</div>
                  </button>
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/sector/Healthcare and Pharmaceuticals'); }}
                    className="p-3 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left text-sm"
                  >
                    <div className="font-medium text-gray-900">Healthcare</div>
                    <div className="text-xs text-gray-500">Medical & Life Sciences</div>
                  </button>
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/sector/Banking and Financial Services'); }}
                    className="p-3 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left text-sm"
                  >
                    <div className="font-medium text-gray-900">Banking & Financial</div>
                    <div className="text-xs text-gray-500">Banking & Finance</div>
                  </button>
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/sector/Manufacturing'); }}
                    className="p-3 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left text-sm"
                  >
                    <div className="font-medium text-gray-900">Manufacturing</div>
                    <div className="text-xs text-gray-500">Production & Industry</div>
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/sectors'); }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All 20 Business Sectors →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
          </div>
          
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="right" />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring 20 sectors, 400+ industries, and 7,400+ companies worldwide.</p>
            <div className="mt-4 flex justify-center space-x-6 text-xs">
              <button onClick={() => setLocation('/privacy-policy')} className="hover:text-gray-900 underline">Privacy Policy</button>
              <button onClick={() => setLocation('/terms-of-service')} className="hover:text-gray-900 underline">Terms of Service</button>
              <button onClick={() => setLocation('/disclaimer')} className="hover:text-gray-900 underline">Disclaimer</button>
              <button onClick={() => setLocation('/affiliate-disclosure')} className="hover:text-gray-900 underline">Affiliate Disclosure</button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* SEO Analyzer Component */}
    </div>
  );
}
