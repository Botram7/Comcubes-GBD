import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { BannerAd } from "@/components/BannerAd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Globe2, Building2, ArrowLeft, Layers, Loader2 } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import type { SearchResults, Company } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { BusinessGrid, BusinessGridSkeleton } from "@/components/BusinessGrid";

interface CompaniesData {
  companies: Company[];
  total: number;
  page?: number;
  totalPages?: number;
}

const LOAD_MORE_LIMIT = 40;

export default function GeographyCompaniesPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allLoadedCompanies, setAllLoadedCompanies] = useState<Company[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
  }, [selectedLetter]);

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
      params.append('limit', LOAD_MORE_LIMIT.toString());
      
      const response = await fetch(`/api/geography/companies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.companies) {
      setIsLoadingMore(false);
      if (currentPage === 1) {
        setAllLoadedCompanies(data.companies);
      } else {
        setAllLoadedCompanies(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newCompanies = data.companies.filter(c => !existingIds.has(c.id));
          return [...prev, ...newCompanies];
        });
      }
    }
  }, [data, currentPage]);

  const totalPages = data?.totalPages || Math.ceil((data?.total || 0) / LOAD_MORE_LIMIT);
  const hasMore = currentPage < totalPages;

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingMore]);

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleBackToGeography = () => {
    setLocation('/geography');
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? '' : letter);
    setCurrentPage(1);
    setAllLoadedCompanies([]);
  };

  const handleCompanyClick = (item: Company) => {
    if (item.websiteUrl) {
      window.open(item.websiteUrl, '_blank');
    }
  };

  const clearFilters = () => {
    setLocation('/geography/companies');
    setSelectedLetter('');
    setCurrentPage(1);
    setAllLoadedCompanies([]);
    setCountryFilter('');
    setRegionFilter('');
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const companies = allLoadedCompanies;

  // Group companies by country
  const companiesByCountry = companies.reduce((acc, company) => {
    const country = company.countryName || 'Unknown';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(company);
    return acc;
  }, {} as Record<string, Company[]>);

  const countries = Object.keys(companiesByCountry).sort();

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <BusinessGridSkeleton count={20} />
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
          <div className="max-w-md mx-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Data</h1>
            <p className="text-sm text-gray-600">
              Failed to load companies. Please try again later.
            </p>
          </div>
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

              {/* Navigation buttons for desktop */}
              <div className="hidden sm:flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/sectors')}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Layers className="h-4 w-4" />
                  Business Sectors
                </Button>
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
            
            {/* Mobile navigation buttons beneath logo and search */}
            <div className="sm:hidden mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/sectors')}
                className="flex items-center gap-2 flex-1 justify-center"
              >
                <Layers className="h-4 w-4" />
                Sectors
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/search')}
                className="flex items-center gap-2 flex-1 justify-center"
              >
                <Building2 className="h-4 w-4" />
                Search
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
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="left" />
          </div>
          
          <div className="flex-1">
            {searchResults ? (
              <div className="space-y-8">
                <div className="mb-6">
                  <Button
                    variant="ghost"
                    onClick={() => setSearchResults(null)}
                    data-testid="button-clear-search"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Companies
                  </Button>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mt-4">Search Results</h2>
                  <p className="text-gray-600 mt-2">
                    Found {searchResults.sectors.length + searchResults.industries.length + searchResults.companies.length} results
                  </p>
                </div>

                {searchResults.sectors.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Sectors ({searchResults.sectors.length})</h3>
                    <BusinessGrid 
                      items={searchResults.sectors} 
                      type="sector" 
                      onItemClick={(item) => setLocation(`/sector/${encodeURIComponent(item.name)}`)} 
                    />
                  </div>
                )}

                {searchResults.industries.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Industries ({searchResults.industries.length})</h3>
                    <BusinessGrid 
                      items={searchResults.industries} 
                      type="industry" 
                      onItemClick={(item) => setLocation(`/industry/${encodeURIComponent(item.name)}`)} 
                    />
                  </div>
                )}

                {searchResults.companies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Companies ({searchResults.companies.length})</h3>
                    <BusinessGrid 
                      items={searchResults.companies} 
                      type="company" 
                      onItemClick={(item) => handleCompanyClick(item as Company)}
                      showClaimButtons={true}
                    />
                  </div>
                )}

                {searchResults.sectors.length === 0 && 
                 searchResults.industries.length === 0 && 
                 searchResults.companies.length === 0 && (
                  <div className="text-center py-12">
                    <Globe2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                    <p className="text-gray-600">
                      Try a different search term or browse all companies.
                    </p>
                  </div>
                )}
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
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter Companies by Country Name (A-Z)</h3>
                      <p className="text-xs text-gray-600 mb-3">Click a letter to show companies from countries starting with that letter</p>
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

                {companies.length > 0 ? (
                  <>
                    {countries.map((country) => (
                      <div key={country} className="mb-12" data-testid={`country-group-${country.toLowerCase().replace(/\s+/g, '-')}`}>
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-blue-200">
                          <Globe2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                          <h2 className="text-2xl font-bold text-gray-900 flex-1">
                            {country}
                          </h2>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {companiesByCountry[country].length} {companiesByCountry[country].length === 1 ? 'Company' : 'Companies'}
                          </Badge>
                        </div>
                        <BusinessGrid 
                          items={companiesByCountry[country]} 
                          type="company" 
                          onItemClick={(item) => handleCompanyClick(item as Company)}
                          showClaimButtons={true}
                        />
                      </div>
                    ))}

                    {isLoadingMore && (
                      <BusinessGridSkeleton count={20} />
                    )}

                    {hasMore && !isLoadingMore && (
                      <div className="mt-8 flex flex-col items-center gap-3">
                        <p className="text-sm text-gray-500">
                          Showing {companies.length} of {data?.total?.toLocaleString() || '?'} companies
                        </p>
                        <Button
                          onClick={handleLoadMore}
                          variant="outline"
                          size="lg"
                          className="px-8 py-3 text-base font-medium border-green-300 hover:bg-green-50 hover:border-green-400 transition-all"
                        >
                          <Loader2 className="h-4 w-4 mr-2 hidden" />
                          Load More Companies
                        </Button>
                      </div>
                    )}

                    {!hasMore && companies.length > LOAD_MORE_LIMIT && (
                      <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                          All {data?.total?.toLocaleString()} companies loaded
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Globe2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Companies Found</h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or browse all companies.
                    </p>
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

      <footer className="sticky-footer mt-16">
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
    </div>
  );
}
