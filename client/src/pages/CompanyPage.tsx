import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { Company, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";
import comcubesDefaultLogo from "@/assets/comcubes-default.png";

export default function CompanyPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top when component mounts or page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const { data: companyData, isLoading, error } = useQuery({
    queryKey: [`/api/companies?page=${currentPage}&limit=20`],
    staleTime: 30000,
  });

  const handleCompanyClick = (company: Company) => {
    if (company.websiteUrl) {
      window.open(company.websiteUrl, '_blank');
    }
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
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
            <p className="mt-4 text-gray-600">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !companyData) {
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
                <h1 className="text-2xl font-bold text-gray-900">Error Loading Companies</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Failed to load company data. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((companyData.total || 0) / 20);

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src={comcubesDefaultLogo} 
                alt="COMCUBES Global Business Directory" 
                className="h-8 w-auto"
              />
            </div>
            
            <SearchBar onSearchResults={handleSearchResults} />

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Page {currentPage + 21} of 421
              </span>
            </div>
          </div>
        </div>
      </header>

      <Breadcrumbs 
        items={[
          { label: "Home", onClick: () => setLocation("/") },
          { label: "Business Sectors", onClick: () => setLocation("/sectors") },
          { label: "All Companies" }
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
                  onItemClick={handleCompanyClick} 
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">All Companies</h2>
              <p className="text-gray-600 mt-2">
                Browse {companyData.total} companies across all industries and sectors
              </p>
            </div>

            <BusinessGrid items={companyData.companies || []} type="company" onItemClick={handleCompanyClick} />

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring 22 sectors, 398 industries, and 7,400+ companies worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
