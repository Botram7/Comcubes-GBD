import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEOHead, generateDirectoryStructuredData } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, ArrowLeft } from "lucide-react";

import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";
import { Pagination } from "@/components/Pagination";
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
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-primary " style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <SearchBar onSearchResults={handleSearchResults} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                
                <span className="text-sm text-gray-600 ">Loading...</span>
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
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <SearchBar onSearchResults={handleSearchResults} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              </div>
              
              <span className="text-sm text-gray-600">Error</span>
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
      <SEOHead
        title={`Industries Directory (Page ${currentPage}) | Browse 400+ Global Industries - COMCUBES`}
        description={`Browse page ${currentPage} of global industries in COMCUBES Directory. Find specialized industries across all business sectors including technology, healthcare, finance, manufacturing, and more.`}
        keywords={[
          'business industries',
          'global industries directory',
          'specialized industries',
          'technology industry',
          'healthcare industry',
          'financial industry',
          'manufacturing industry',
          'retail industry',
          'energy industry',
          'automotive industry',
          'telecommunications industry',
          'construction industry',
          'agriculture industry',
          'entertainment industry',
          'professional services',
          'consulting industry',
          'logistics industry',
          'transportation industry',
          'hospitality industry',
          'education industry'
        ]}
        ogType="website"
        jsonLd={generateDirectoryStructuredData('industries', Array.isArray(industries) ? industries : [])}
        canonicalUrl={`${window.location.origin}/industries?page=${currentPage}`}
        additionalMeta={[
          { name: 'page', content: currentPage.toString() },
          { name: 'total-pages', content: totalPages.toString() },
          { name: 'total-items', content: total.toString() }
        ]}
      />
      <header className="bg-white  shadow-sm border-b border-gray-200  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-primary " style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
            </div>
            
            <div className="flex-1 flex justify-center mx-2 md:mx-8">
              <div className="flex items-center space-x-2 md:space-x-4 max-w-2xl w-full">
                <div className="flex-1">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="hidden sm:flex items-center gap-2 flex-shrink-0"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <span className="text-xs md:text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Banner Ads */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <BannerAd position="left" />
          </div>

          {/* Main Content */}
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
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 ">All Industries</h2>
              <p className="text-gray-600  mt-2">
                Browse {total} specialized industries across all business sectors. Click on any industry to view its top companies.
              </p>
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

          {/* Right Banner Ads */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <BannerAd position="right" />
          </div>
        </div>
      </main>

      <footer className="bg-white  border-t border-gray-200  mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 ">
            <p>&copy; 2024 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring 20 sectors, {total}+ industries, and 8,000+ companies worldwide.</p>
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