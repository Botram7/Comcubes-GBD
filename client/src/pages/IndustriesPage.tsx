import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, ArrowLeft } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import type { Industry, SearchResults, PaginatedResponse } from "@/lib/types";
import { useState, useEffect } from "react";
import comcubesDefaultLogo from "@/assets/comcubes-default.png";

export default function IndustriesPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top when component mounts or page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const { data: industriesData, isLoading, error } = useQuery({
    queryKey: ["/api/industries", { page: currentPage, limit: 20 }],
    staleTime: Infinity,
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
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <img 
                src={comcubesDefaultLogo} 
                alt="COMCUBES Global Business Directory" 
                className="h-8 w-auto"
              />
              <SearchBar onSearchResults={handleSearchResults} />
              <span className="text-sm text-gray-600">Loading...</span>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <img 
                src={comcubesDefaultLogo} 
                alt="COMCUBES Global Business Directory" 
                className="h-8 w-auto"
              />
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
                Failed to load industries. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const paginatedData = industriesData as PaginatedResponse<Industry>;
  const industries = paginatedData?.industries || [];
  const totalPages = paginatedData?.totalPages || 1;
  const total = paginatedData?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <img 
              src={comcubesDefaultLogo} 
              alt="COMCUBES Global Business Directory" 
              className="h-8 w-auto"
            />
            
            <SearchBar onSearchResults={handleSearchResults} />

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
              <span className="text-sm text-gray-600">Page {currentPage + 1} of 421</span>
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
              <h2 className="text-3xl font-bold text-gray-900">All Industries</h2>
              <p className="text-gray-600 mt-2">
                Browse {total} specialized industries across all business sectors. Click on any industry to view its top companies.
              </p>
            </div>

            <BusinessGrid items={industries} type="industry" onItemClick={handleIndustryClick} />

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
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring 20 sectors, {total}+ industries, and 8,000+ companies worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}