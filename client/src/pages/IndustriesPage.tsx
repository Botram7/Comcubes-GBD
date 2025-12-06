import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, ArrowLeft } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData, BRAND_KEYWORDS } from "@/components/SEOHead";
import { ReadMore } from "@/components/ReadMore";

import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import { Pagination } from "@/components/Pagination";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { BannerAd } from "@/components/BannerAd";
import type { Industry, SearchResults, PaginatedResponse } from "@/lib/types";
import { useState, useEffect } from "react";

export default function IndustriesPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top when component mounts or page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Reset search results when page changes
  useEffect(() => {
    setSearchResults(null);
  }, [currentPage]);

  const { data: industriesData, isLoading, error } = useQuery({
    queryKey: ["/api/industries", currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/industries?page=${currentPage}&limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch industries');
      }
      return response.json();
    },
    staleTime: 0,
  });

  // Get sectors count for SEO metadata
  const { data: sectors = [] } = useQuery<any[]>({
    queryKey: ["/api/sectors"],
    staleTime: 300000,
  });

  const handleIndustryClick = (industry: Industry) => {
    setLocation(`/industry/${encodeURIComponent(industry.name)}`);
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white  shadow-sm border-b border-gray-200  sticky top-0 z-50">
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
            <p className="mt-4 text-gray-600 ">Loading industries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white  shadow-sm border-b border-gray-200  sticky top-0 z-50">
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
                Failed to load industries. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const paginatedData = industriesData as any;
  const industries = paginatedData?.industries || [];
  const totalPages = paginatedData?.totalPages || 1;
  const total = paginatedData?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateDisclosureBanner />
      <SEOHead 
        title={`Browse ${total || '400+'} Specialized Industries Directory | COMCUBES Global Business Directory`}
        description={`Explore ${total || '400+'} specialized industries across ${sectors?.length || 20} business sectors on COMCUBES (Comcube). Each industry showcases leading companies with detailed profiles, website access, and professional opportunities. Find businesses in technology, healthcare, finance, manufacturing, and more.`}
        keywords={[
          ...BRAND_KEYWORDS.slice(0, 5),
          "industries directory", "business industries", "industry listings", "specialized industries",
          "industry categories", "business specializations", "professional services", "industrial sectors",
          "industry database", "commercial industries", "business verticals", "global industries",
          "industry classification", "business sectors", "professional industries", "commercial specialties"
        ]}
        canonicalUrl="https://comcubes.com/industries"
        ogTitle={`${total || '400+'} Industries Directory | COMCUBES`}
        ogDescription={`Browse ${total || '400+'} specialized industries across ${sectors?.length || 20} business sectors worldwide.`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Global Industries Directory - COMCUBES",
          "description": `Comprehensive directory of ${total || '400+'} specialized industries with leading companies worldwide on COMCUBES business directory`,
          "url": "https://comcubes.com/industries",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": industries?.slice(0, 20).map((industry: any, index: number) => ({
              "@type": "ListItem", 
              "position": index + 1,
              "item": {
                "@type": "Thing",
                "name": industry.name,
                "url": `https://comcubes.com/industry/${encodeURIComponent(industry.name)}`,
                "description": `Specialized industry in ${industry.sectorName} sector`
              }
            })) || []
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://comcubes.com/" },
              { "@type": "ListItem", "position": 2, "name": "All Industries", "item": "https://comcubes.com/industries" }
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

              {/* Keep Home button and page info for desktop only */}
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
                <span className="text-xs md:text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
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
          { label: "All Industries" }
        ]} 
      />

      <main className="main-content-with-sticky-footer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="left" />
          </div>
          
          <div className="flex-1">
            {searchResults ? (
              <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 ">Search Results</h2>
              <p className="text-gray-600  mt-2">
                Found {searchResults.sectors.length + searchResults.industries.length + searchResults.companies.length} results
              </p>
            </div>

            {searchResults.sectors.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900  mb-4">Sectors</h3>
                <BusinessGrid 
                  items={searchResults.sectors} 
                  type="sector" 
                  onItemClick={(sector) => setLocation(`/sector/${encodeURIComponent(sector.name)}`)} 
                />
              </div>
            )}

            {searchResults.industries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900  mb-4">Industries</h3>
                <BusinessGrid 
                  items={searchResults.industries} 
                  type="industry" 
                  onItemClick={(item) => handleIndustryClick(item as Industry)} 
                />
              </div>
            )}

            {searchResults.companies.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900  mb-4">Companies</h3>
                <BusinessGrid 
                  items={searchResults.companies} 
                  type="company" 
                  showClaimButtons={true}
                  onItemClick={(company) => {
                    if ((company as any).websiteUrl) {
                      window.open((company as any).websiteUrl, '_blank');
                    }
                  }} 
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Global Industries Directory</h1>
              
              <ReadMore className="prose max-w-none text-gray-700">
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    Welcome to COMCUBES' comprehensive directory of {total || '400+'} specialized industries. Whether you're researching career opportunities, exploring business niches, comparing market players, or discovering new services—this directory connects you to the specific industries that matter most to your goals.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Understanding Industry Specializations</h2>
                  <p>
                    While business sectors represent broad categories of economic activity, industries are the specialized fields within those sectors. For example, the Technology sector contains industries like Artificial Intelligence, Cloud Computing, Cybersecurity, and Software Development. The Healthcare sector includes Hospital Systems, Pharmaceutical Manufacturing, Medical Devices, and Telemedicine. This granular organization helps you find exactly what you're looking for without wading through unrelated businesses.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">How Professionals Use This Directory</h2>
                  <p className="mb-3">
                    Different users find value in our industry directory for different reasons:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Job Seekers:</strong> Identify all major players in your target industry. Research companies before interviews, discover employers you hadn't considered, and understand the competitive landscape in your field.</li>
                    <li><strong>Business Development Professionals:</strong> Find potential partners, suppliers, or competitors within specific industries. Conduct market analysis and identify industry leaders for benchmarking.</li>
                    <li><strong>Investors & Analysts:</strong> Research industry compositions, compare company portfolios, and identify emerging sectors with growth potential.</li>
                    <li><strong>Students & Researchers:</strong> Gather data for academic projects, study industry structures, and access real-world examples for case studies and presentations.</li>
                    <li><strong>Consumers & Shoppers:</strong> Discover brands and services within specific industries—whether you're looking for luxury fashion brands, organic food producers, or eco-friendly manufacturers.</li>
                  </ul>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Navigating Our Industry Database</h2>
                  <p>
                    Our directory presents {total || '400+'} industries organized alphabetically and paginated for easy browsing. Each industry card shows its parent sector and company count. Click any industry to access its dedicated page featuring up to 20 leading companies in that field, complete with website links, business descriptions, and additional intelligence when available. Use the search bar above to quickly jump to specific industries, or browse page by page to discover new business fields you may not have known existed.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">From Broad Sectors to Specific Companies</h2>
                  <p>
                    COMCUBES follows a logical hierarchy: {sectors?.length || 20} Business Sectors → {total || '400+'} Specialized Industries → 7,400+ Global Companies. This structure mirrors how businesses actually organize themselves in the real world. Start with a sector if you're exploring broadly (like "What's in Technology?"), drill into industries when you have a specific interest (like "Cloud Computing providers"), then access individual companies when you need specific information (like "Amazon Web Services").
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">What Makes Each Industry Page Valuable</h2>
                  <p>
                    Every industry page in our directory provides curated listings of leading companies in that field. You'll find established industry giants, innovative disruptors, and specialized service providers—all selected for their market presence and relevance. Company profiles include official website links for direct access, business descriptions to understand their offerings, and when available, additional data like headquarters location, founding year, and geographic presence. This saves hours of research time by consolidating industry information in one place.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Start Exploring Industries</h2>
                  <p>
                    Browse the industries below to discover specialized business fields across the global economy. Each card represents a distinct industry with its own market dynamics, key players, and opportunities. Whether you're looking for established industries like Banking and Pharmaceuticals or emerging fields like Artificial Intelligence and Renewable Energy, you'll find them organized clearly in this directory.
                  </p>

                  <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <span className="flex items-center gap-2">🏭 {total || '400+'} Specialized Industries</span>
                      <span className="flex items-center gap-2">📊 {sectors?.length || 20} Business Sectors</span>
                      <span className="flex items-center gap-2">🌍 7,400+ Global Companies</span>
                      <span className="flex items-center gap-2">📄 Page {currentPage} of {totalPages}</span>
                    </div>
                  </div>
                </div>
              </ReadMore>
            </div>

            <BusinessGrid items={industries} type="industry" onItemClick={(item) => handleIndustryClick(item as Industry)} />

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            <div className="mt-12 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Navigation Guide</h3>
                <p className="text-blue-700 text-sm">
                  • Click on any industry above to view its top 20 companies<br/>
                  • Use the search bar to find specific industries or companies<br/>
                  • Visit company websites by clicking on company names
                </p>
              </div>
            </div>
          </>
        )}
          </div>
          
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="right" />
          </div>
        </div>
      </main>

      <footer className="bg-white  border-t border-gray-200  mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 ">
            <p>&copy; 2025 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring 20 sectors, {total}+ industries, and 7,400+ companies worldwide.</p>
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