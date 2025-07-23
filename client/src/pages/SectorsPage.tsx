import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, ArrowLeft } from "lucide-react";

import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";
import { BannerAd } from "@/components/BannerAd";
import type { Sector, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

export default function SectorsPage() {
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
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
              </div>
              <SearchBar onSearchResults={handleSearchResults} />
              <span className="text-sm text-gray-600">Loading...</span>
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
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
              </div>
              <SearchBar onSearchResults={handleSearchResults} />
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
                Failed to load business sectors. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  font-inter ">
      <header className="bg-white  shadow-sm border-b border-gray-200  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
            </div>
            
            <div className="flex-1 flex justify-center mx-8">
              <div className="flex items-center space-x-4 max-w-2xl w-full">
                <div className="flex-1">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 flex-shrink-0">
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
              <span className="text-sm text-gray-600 ">Page 1 of 421</span>
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
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Business Sectors</h2>
                  <p className="text-gray-600 mt-2">
                    Explore {sectors?.length || 20} major business sectors across global industries. Click on any sector to view its specialized industries.
                  </p>
                </div>

                <BusinessGrid items={sectors || []} type="sector" onItemClick={handleSectorClick} />

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

          {/* Right Banner Ads */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <BannerAd position="right" />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring {sectors?.length || 20} sectors, 400+ industries, and 8,000+ companies worldwide.</p>
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