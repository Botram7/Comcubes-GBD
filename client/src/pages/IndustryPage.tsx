import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import comcubesIcon from "@assets/2de77b64-4c39-4ddb-aa7a-0afd37edfe34_1752720571406.png";
import { BannerAd } from "@/components/BannerAd";
import type { Company, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

export default function IndustryPage() {
  const { industryName } = useParams();
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  const decodedIndustryName = decodeURIComponent(industryName || "");

  // Scroll to top when component mounts or industry changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [industryName]);

  const { data: companies, isLoading, error } = useQuery({
    queryKey: [`/api/industries/${encodeURIComponent(decodedIndustryName)}/companies`],
    enabled: !!industryName,
    staleTime: Infinity,
  });

  const handleCompanyClick = (company: Company) => {
    if (company.websiteUrl) {
      window.open(company.websiteUrl, '_blank');
    }
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  // Get sector name from first company for breadcrumbs
  const sectorName = companies && companies.length > 0 ? companies[0].sectorName : "";

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
            <p className="mt-4 text-gray-600">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !companies) {
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
                <h1 className="text-2xl font-bold text-gray-900">Industry Not Found</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                The requested industry could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
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

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Companies in {decodedIndustryName}</span>
            </div>
          </div>
        </div>
      </header>

      <Breadcrumbs 
        items={[
          { label: "Home", onClick: () => setLocation("/") },
          { label: "Business Sectors", onClick: () => setLocation("/sectors") },
          { label: sectorName, onClick: () => setLocation(`/sector/${encodeURIComponent(sectorName)}`) },
          { label: decodedIndustryName }
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
              <h2 className="text-3xl font-bold text-gray-900">{decodedIndustryName}</h2>
              <p className="text-gray-600 mt-2">
                Companies in {decodedIndustryName} industry ({companies.length} companies)
              </p>
            </div>

            <BusinessGrid items={companies} type="company" onItemClick={handleCompanyClick} />
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
            <p>&copy; 2024 Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring 22 sectors, 398 industries, and 7,400+ companies worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
