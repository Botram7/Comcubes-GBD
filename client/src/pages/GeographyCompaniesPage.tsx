import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BannerAd } from "@/components/BannerAd";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Globe2, Building2, ArrowLeft, ExternalLink } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import type { SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";
import { Pagination } from "@/components/Pagination";

interface CompanyLocation {
  id: number;
  name: string;
  industryName: string;
  countryName: string;
  regionName: string;
  websiteUrl?: string;
}

interface CompaniesData {
  companies: CompanyLocation[];
  total: number;
  page?: number;
  totalPages?: number;
}

export default function GeographyCompaniesPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setCountryFilter(urlParams.get('country') || '');
      setRegionFilter(urlParams.get('region') || '');
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, selectedLetter]);

  // Build query key with filters
  const queryKey = [
    "/api/geography/companies",
    countryFilter,
    regionFilter,
    selectedLetter,
    currentPage
  ];

  const { data, isLoading, error } = useQuery<CompaniesData>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (countryFilter) params.append('country', countryFilter);
      if (regionFilter) params.append('region', regionFilter);
      if (selectedLetter) params.append('letter', selectedLetter);
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
      const response = await fetch(`/api/geography/companies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
    staleTime: Infinity,
  });

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleBackToGeography = () => {
    setLocation('/geography');
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? '' : letter);
    setCurrentPage(1);
  };

  const handleCompanyClick = (company: CompanyLocation) => {
    if (company.websiteUrl) {
      window.open(company.websiteUrl, '_blank');
    }
  };

  const clearFilters = () => {
    setLocation('/geography/companies');
    setSelectedLetter('');
    setCurrentPage(1);
  };

  // Generate alphabet buttons
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Group companies by country
  const groupedCompanies = data?.companies.reduce((acc, company) => {
    if (!acc[company.countryName]) {
      acc[company.countryName] = [];
    }
    acc[company.countryName].push(company);
    return acc;
  }, {} as Record<string, CompanyLocation[]>);

  const totalPages = data?.totalPages || Math.ceil((data?.total || 0) / 20);

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
                Failed to load companies. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sticky-footer bg-gray-50 font-inter">
      <AffiliateDisclosureBanner />
      <SEOHead
        title={`Global Companies by Location${countryFilter ? ` - ${countryFilter}` : ''} - COMCUBES Directory`}
        description={`Browse ${data?.total || 7400} companies organized by country and region. Find businesses worldwide with detailed industry classifications and website access.`}
        canonicalUrl="/geography/companies"
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: "/" },
          { name: "Geography", url: "/geography" },
          { name: "Companies", url: "/geography/companies" },
        ])}
      />

      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mr-1 sm:mr-4" onClick={() => setLocation('/')}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
              </div>
              
              <div className="flex-1 mr-2 sm:mr-4 min-w-0">
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
          { label: "Geography", onClick: handleBackToGeography },
          { label: countryFilter || regionFilter || "Companies" }
        ]} 
      />

      <main className="main-content-with-sticky-footer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <div className="hidden lg:block flex-shrink-0">
            <GoogleAdSense 
              format="vertical"
              className="sticky top-24"
              position="companies-page-left-sidebar"
            />
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
              </div>
            ) : (
              <>
                <div className="mb-8">
                  {(countryFilter || regionFilter || selectedLetter) && (
                    <div className="mb-4">
                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        data-testid="button-clear-filters"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        View All Companies
                      </Button>
                    </div>
                  )}

                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {countryFilter ? `Companies in ${countryFilter}` : 
                     regionFilter ? `Companies in ${regionFilter}` :
                     `Global Companies by Location`}
                  </h1>

                  <p className="text-lg text-gray-700 mb-6">
                    Browse {data?.total?.toLocaleString() || '7,400+'} companies organized by country. Use the alphabet filter below to quickly find countries, or browse all companies page by page.
                  </p>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-8">
                    <h3 className="font-semibold text-green-900 mb-2">Quick Stats</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-green-700">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {data?.total?.toLocaleString() || '7,400+'} Companies
                      </span>
                      <span className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4" />
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                  </div>

                  {!countryFilter && !regionFilter && (
                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Country Name</h3>
                      <div className="flex flex-wrap gap-2">
                        {alphabet.map(letter => (
                          <Button
                            key={letter}
                            variant={selectedLetter === letter ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleLetterClick(letter)}
                            className="w-10 h-10 p-0"
                            data-testid={`filter-letter-${letter}`}
                          >
                            {letter}
                          </Button>
                        ))}
                        {selectedLetter && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLetter('');
                              setCurrentPage(1);
                            }}
                            data-testid="clear-letter-filter"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {groupedCompanies && Object.keys(groupedCompanies).length > 0 ? (
                  Object.keys(groupedCompanies).sort().map((countryName) => (
                    <div key={countryName} className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe2 className="h-6 w-6 text-green-600" />
                        {countryName}
                        <Badge variant="secondary" className="ml-2">{groupedCompanies[countryName].length} companies</Badge>
                      </h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {groupedCompanies[countryName].map((company) => (
                          <Card
                            key={company.id}
                            className="hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-green-400 cursor-pointer"
                            onClick={() => handleCompanyClick(company)}
                            data-testid={`card-company-${company.id}`}
                          >
                            <CardContent className="p-4">
                              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 flex items-start gap-1">
                                {company.name}
                                {company.websiteUrl && <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5" />}
                              </h3>

                              <div className="space-y-1">
                                <p className="text-xs text-gray-600 line-clamp-1">
                                  {company.industryName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {company.regionName}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Globe2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Companies Found</h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or browse all companies.
                    </p>
                  </div>
                )}

                {totalPages > 1 && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}

                <div className="my-8 flex justify-center">
                  <GoogleAdSense 
                    format="responsive"
                    className="w-full max-w-4xl"
                    position="companies-page-in-content"
                  />
                </div>
              </>
            )}
          </div>

          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="right" />
          </div>
        </div>
      </main>

      <footer className="sticky-footer mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
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
    </div>
  );
}
