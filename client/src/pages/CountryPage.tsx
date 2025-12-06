import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building2, ArrowLeft, LayoutGrid, Layers, List, X } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData, createPlaceStructuredData, BRAND_KEYWORDS } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import { BannerAd } from "@/components/BannerAd";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import type { Company, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

interface Country {
  id: number;
  name: string;
  slug: string;
  code: string;
  flagEmoji: string;
  capital: string | null;
  currency: string | null;
  region: string;
}

interface CountryWithStats {
  id: number;
  name: string;
  slug: string;
  code: string;
  flagEmoji: string;
  capital: string | null;
  currency: string | null;
  region: string;
  regionName?: string;
  regionSlug?: string;
  continentName?: string;
  continentSlug?: string;
  stats: {
    totalCompanies: number;
    sectorBreakdown: Array<{ sectorName: string; count: number }>;
    industryBreakdown: Array<{ industryName: string; count: number }>;
  };
}

interface CompaniesResponse {
  country: Country;
  companies: Company[];
  total: number;
}

export default function CountryPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/geography/country/:slug");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'companies' | 'grouped' | 'industries'>('companies');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const countrySlug = params?.slug || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, countrySlug, selectedIndustry]);

  // Reset page when switching views
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  // Reset filters only when changing country
  useEffect(() => {
    setSelectedIndustry(null);
    setSelectedSector(null);
  }, [countrySlug]);

  const { data: countryData, isLoading: isLoadingCountry, error: countryError } = useQuery<CountryWithStats>({
    queryKey: [`/api/geography/countries/${countrySlug}`],
    enabled: !!countrySlug,
    staleTime: Infinity,
  });

  // Always fetch all companies for filtering purposes (cached with staleTime: Infinity)
  const { data: allCompaniesData, isLoading: isLoadingAllCompanies } = useQuery<CompaniesResponse>({
    queryKey: [`/api/geography/countries/${countrySlug}/companies`],
    enabled: !!countrySlug,
    staleTime: Infinity,
  });

  // Fetch paginated companies for "companies" view (only when no filter)
  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery<CompaniesResponse>({
    queryKey: [`/api/geography/countries/${countrySlug}/companies?page=${currentPage}`, currentPage],
    enabled: !!countrySlug && viewMode === 'companies' && !selectedIndustry,
    staleTime: Infinity,
  });

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleCompanyClick = (company: Company) => {
    if (company.websiteUrl) {
      window.open(company.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const isLoading = isLoadingCountry || (selectedIndustry ? isLoadingAllCompanies : isLoadingCompanies);
  const error = countryError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AffiliateDisclosureBanner />
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity mr-1 sm:mr-4 flex-shrink-0" onClick={() => setLocation('/')}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                    <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                </div>
                <div className="flex-1 mr-2 sm:mr-4">
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
            <p className="mt-4 text-gray-600">Loading country data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !countryData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AffiliateDisclosureBanner />
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity mr-1 sm:mr-4 flex-shrink-0" onClick={() => setLocation('/')}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                    <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                </div>
                <div className="flex-1 mr-2 sm:mr-4">
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
                <h1 className="text-2xl font-bold text-gray-900">Country Not Found</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                The country you're looking for doesn't exist or couldn't be loaded.
              </p>
              <Button 
                onClick={() => setLocation('/geography')} 
                className="mt-4 w-full"
                data-testid="button-back-geography"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Geography
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Filter companies by selected industry and/or sector if active
  let companies: Company[] = [];
  let totalCompanies = countryData.stats.totalCompanies;
  
  if ((selectedIndustry || selectedSector) && allCompaniesData) {
    // When filtering, use all companies and filter by industry and/or sector
    let filteredCompanies = allCompaniesData.companies.filter(c => {
      const matchesIndustry = !selectedIndustry || c.industryName === selectedIndustry;
      const matchesSector = !selectedSector || c.sectorName === selectedSector;
      return matchesIndustry && matchesSector;
    });
    
    // If filtering by industry only (no sector), deduplicate by company name
    // to avoid showing same company multiple times from different sectors
    if (selectedIndustry && !selectedSector) {
      const uniqueCompanies = new Map<string, Company>();
      filteredCompanies.forEach(c => {
        // Keep first occurrence of each company name
        if (!uniqueCompanies.has(c.name)) {
          uniqueCompanies.set(c.name, c);
        }
      });
      companies = Array.from(uniqueCompanies.values());
    } else {
      companies = filteredCompanies;
    }
    
    totalCompanies = companies.length;
  } else {
    // When not filtering, use paginated data
    companies = companiesData?.companies || [];
  }
  
  const totalPages = Math.ceil(totalCompanies / 20);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Geography", href: "/geography" },
    ...(countryData.continentName && countryData.continentSlug 
      ? [{ label: countryData.continentName, href: `/geography/continent/${countryData.continentSlug}` }]
      : []
    ),
    ...(countryData.regionName && countryData.regionSlug 
      ? [{ label: countryData.regionName, href: `/geography/region/${countryData.regionSlug}` }]
      : []
    ),
    { label: countryData.name },
  ];

  const metaDescription = `Explore ${totalCompanies.toLocaleString()} businesses in ${countryData.name}. Browse companies by sector and industry in this comprehensive ${countryData.name} business directory.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateDisclosureBanner />
      <SEOHead
        title={`${countryData.name} ${countryData.flagEmoji} Business Directory - ${totalCompanies} Companies | COMCUBES`}
        description={metaDescription}
        keywords={[
          ...BRAND_KEYWORDS.slice(0, 5),
          `${countryData.name} businesses`, `companies in ${countryData.name}`, `${countryData.name} business directory`,
          `${countryData.name.toLowerCase()} companies`, `find businesses in ${countryData.name}`,
          `${countryData.name} local businesses`, `${countryData.name} services`,
          `businesses near ${countryData.capital || countryData.name}`,
          "country business search", "businesses by country", "international business directory"
        ]}
        canonicalUrl={`https://comcubes.com/geography/country/${countryData.slug}`}
        ogType="website"
        ogTitle={`${countryData.name} ${countryData.flagEmoji} Business Directory | COMCUBES`}
        ogDescription={`Discover ${totalCompanies} companies in ${countryData.name}. Find local businesses, services, and international brands.`}
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: "https://comcubes.com/" },
          { name: "Geography", url: "https://comcubes.com/geography" },
          ...(countryData.continentSlug ? [{ name: countryData.continentName || "Continent", url: `https://comcubes.com/geography/continent/${countryData.continentSlug}` }] : []),
          ...(countryData.regionSlug ? [{ name: countryData.regionName || "Region", url: `https://comcubes.com/geography/region/${countryData.regionSlug}` }] : []),
          { name: countryData.name, url: `https://comcubes.com/geography/country/${countryData.slug}` }
        ])}
        additionalStructuredData={[
          createPlaceStructuredData(
            countryData.name,
            'Country',
            `https://comcubes.com/geography/country/${countryData.slug}`,
            `Business directory for ${countryData.name} with ${totalCompanies} companies`,
            countryData.regionName
          )
        ]}
      />
      
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity mr-1 sm:mr-4 flex-shrink-0" onClick={() => setLocation('/')}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
              </div>
              
              <div className="flex-1 mr-2 sm:mr-4">
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
                {(viewMode === 'companies' || viewMode === 'industries') && (
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {viewMode === 'companies' ? totalPages : Math.ceil((countryData?.stats.industryBreakdown.length || 0) / 20)}
                  </span>
                )}
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

      {searchResults ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            onClick={() => setSearchResults(null)}
            variant="outline"
            className="mb-6 gap-2"
            data-testid="button-clear-search"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {countryData.name}
          </Button>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="hidden lg:block flex-shrink-0">
              <GoogleAdSense 
                format="vertical" 
                className="sticky top-24" 
                position="country-page-left-sidebar"
                contentLoaded={!!searchResults && ((searchResults.sectors?.length || 0) + (searchResults.industries?.length || 0) + (searchResults.companies?.length || 0)) > 0}
                minContentItems={3}
                actualContentItems={(searchResults?.sectors?.length || 0) + (searchResults?.industries?.length || 0) + (searchResults?.companies?.length || 0)}
              />
            </div>

            <div className="flex-1">
              {searchResults.sectors && searchResults.sectors.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Sectors</h3>
                  <BusinessGrid 
                    items={searchResults.sectors} 
                    type="sector" 
                    onItemClick={(sector) => setLocation(`/sector/${encodeURIComponent(sector.name)}`)} 
                  />
                </div>
              )}

              {searchResults.industries && searchResults.industries.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Industries</h3>
                  <BusinessGrid 
                    items={searchResults.industries} 
                    type="industry" 
                    onItemClick={(industry) => setLocation(`/industry/${encodeURIComponent(industry.name)}`)} 
                  />
                </div>
              )}

              {searchResults.companies && searchResults.companies.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Companies</h3>
                  <BusinessGrid 
                    items={searchResults.companies} 
                    type="company" 
                    onItemClick={(company) => handleCompanyClick(company as Company)} 
                    showClaimButtons={true}
                  />
                </div>
              )}
            </div>

            <div className="hidden lg:block flex-shrink-0">
              <BannerAd className="sticky top-24" position="right" />
            </div>
          </div>
        </main>
      ) : (
        <>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs items={breadcrumbs} />

            <div className="flex flex-col lg:flex-row gap-6 mt-6">
              <div className="hidden lg:block flex-shrink-0">
                <GoogleAdSense 
                  format="vertical" 
                  className="sticky top-24" 
                  position="country-page-left-sidebar-2"
                  contentLoaded={!isLoading && !!countryData && totalCompanies > 0}
                  minContentItems={5}
                  actualContentItems={companies.length}
                />
              </div>

              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {countryData.flagEmoji} Companies in {countryData.name}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Explore {totalCompanies.toLocaleString()} businesses in {countryData.name}
                    {countryData.capital && ` - Capital: ${countryData.capital}`}
                    {countryData.currency && ` • ${countryData.currency}`}. 
                    {' '}Discover companies across various sectors and industries in {countryData.region}.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>🏢 {totalCompanies.toLocaleString()} Companies</span>
                    <span>🌍 {countryData.region}</span>
                    {(viewMode === 'companies' || viewMode === 'industries') && (
                      <span>📄 Page {currentPage} of {viewMode === 'companies' ? totalPages : Math.ceil((countryData?.stats.industryBreakdown.length || 0) / 20)}</span>
                    )}
                  </div>
                </div>

                {/* View Toggle Buttons */}
                <div className="mb-6 flex flex-wrap gap-2">
                  <Button
                    variant={viewMode === 'companies' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('companies')}
                    className="flex items-center gap-2"
                    data-testid="button-view-companies"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    All Companies
                  </Button>
                  <Button
                    variant={viewMode === 'grouped' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grouped')}
                    className="flex items-center gap-2"
                    data-testid="button-view-grouped"
                  >
                    <Layers className="h-4 w-4" />
                    Group by Sectors & Industries
                  </Button>
                  <Button
                    variant={viewMode === 'industries' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('industries')}
                    className="flex items-center gap-2"
                    data-testid="button-view-industries"
                  >
                    <List className="h-4 w-4" />
                    Industries
                  </Button>
                </div>

                {/* Industry/Sector Filter Indicator */}
                {(selectedIndustry || selectedSector) && viewMode === 'companies' && (
                  <Alert className="mb-6 bg-blue-50 border-blue-200">
                    <AlertDescription className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-900">
                          Showing companies in 
                          {selectedSector && selectedIndustry && (
                            <> <strong>{selectedIndustry}</strong> industry (<strong>{selectedSector}</strong> sector)</>
                          )}
                          {selectedIndustry && !selectedSector && (
                            <> <strong>{selectedIndustry}</strong> industry</>
                          )}
                          {selectedSector && !selectedIndustry && (
                            <> <strong>{selectedSector}</strong> sector</>
                          )}
                          {' '}in {countryData.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedIndustry(null);
                          setSelectedSector(null);
                        }}
                        className="h-auto p-1 hover:bg-blue-100"
                        data-testid="button-clear-industry-filter"
                      >
                        <X className="h-4 w-4 text-blue-600" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {viewMode === 'companies' && (
                  <>
                    <BusinessGrid 
                      items={companies} 
                      type="company" 
                      onItemClick={(company) => handleCompanyClick(company as Company)}
                      showClaimButtons={true}
                    />

                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}

                {viewMode === 'grouped' && (
                  <>
                    {isLoadingAllCompanies ? (
                      <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading companies...</p>
                      </div>
                    ) : allCompaniesData && (
                      <div className="space-y-6">
                        {countryData.stats.sectorBreakdown
                          .sort((a, b) => b.count - a.count)
                          .map((sector) => {
                            // Get industries for this sector from all companies
                            const allCompanies = allCompaniesData.companies || [];
                            
                            // Find unique industries for this sector
                            const sectorIndustriesMap = new Map<string, number>();
                            allCompanies.forEach(c => {
                              if (c.sectorName === sector.sectorName && c.industryName) {
                                sectorIndustriesMap.set(
                                  c.industryName, 
                                  (sectorIndustriesMap.get(c.industryName) || 0) + 1
                                );
                              }
                            });

                            const sectorIndustries = Array.from(sectorIndustriesMap.entries())
                              .map(([name, count]) => ({ industryName: name, count }))
                              .sort((a, b) => b.count - a.count);

                            if (sectorIndustries.length === 0) return null;

                            return (
                              <Card key={sector.sectorName} className="overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                                  <h3 className="text-xl font-bold text-white flex items-center justify-between">
                                    <span>{sector.sectorName}</span>
                                    <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                                      {sector.count} {sector.count === 1 ? 'company' : 'companies'}
                                    </span>
                                  </h3>
                                </div>
                                <CardContent className="p-6">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sectorIndustries.map((industry) => (
                                      <button
                                        key={industry.industryName}
                                        onClick={() => {
                                          setSelectedIndustry(industry.industryName);
                                          setSelectedSector(sector.sectorName);
                                          setViewMode('companies');
                                          setCurrentPage(1);
                                        }}
                                        className="text-left p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-400"
                                        data-testid={`industry-link-${industry.industryName.toLowerCase().replace(/\s+/g, '-')}`}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <div className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                              {industry.industryName}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              {industry.count} {industry.count === 1 ? 'company' : 'companies'}
                                            </div>
                                          </div>
                                          <Building2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    )}
                  </>
                )}

                {viewMode === 'industries' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {countryData.stats.industryBreakdown
                        .sort((a, b) => b.count - a.count)
                        .slice((currentPage - 1) * 20, currentPage * 20)
                        .map((industry) => {
                          const gradient = [
                            'from-blue-400 to-blue-600',
                            'from-purple-400 to-purple-600',
                            'from-pink-400 to-pink-600',
                            'from-green-400 to-green-600',
                            'from-yellow-400 to-yellow-600',
                            'from-red-400 to-red-600',
                            'from-indigo-400 to-indigo-600',
                            'from-teal-400 to-teal-600'
                          ];
                          const randomGradient = gradient[Math.floor(Math.random() * gradient.length)];

                          return (
                            <Card
                              key={industry.industryName}
                              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => {
                                setSelectedIndustry(industry.industryName);
                                setViewMode('companies');
                                setCurrentPage(1);
                              }}
                              data-testid={`industry-card-${industry.industryName.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div className={`h-32 bg-gradient-to-br ${randomGradient} flex items-center justify-center`}>
                                <Building2 className="h-16 w-16 text-white opacity-80" />
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                                  {industry.industryName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {industry.count} {industry.count === 1 ? 'company' : 'companies'} in {countryData.name}
                                </p>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>

                    <Pagination 
                      currentPage={currentPage}
                      totalPages={Math.ceil(countryData.stats.industryBreakdown.length / 20)}
                      onPageChange={handlePageChange}
                    />
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
        </>
      )}
    </div>
  );
}
