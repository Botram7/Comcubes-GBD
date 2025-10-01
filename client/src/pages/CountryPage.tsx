import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import { BannerAd } from "@/components/BannerAd";
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
  const countrySlug = params?.slug || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, countrySlug]);

  const { data: countryData, isLoading: isLoadingCountry, error: countryError } = useQuery<CountryWithStats>({
    queryKey: [`/api/geography/countries/${countrySlug}`],
    enabled: !!countrySlug,
    staleTime: Infinity,
  });

  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery<CompaniesResponse>({
    queryKey: [`/api/geography/countries/${countrySlug}/companies`, currentPage],
    enabled: !!countrySlug,
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

  const isLoading = isLoadingCountry || isLoadingCompanies;
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

  const companies = companiesData?.companies || [];
  const totalCompanies = countryData.stats.totalCompanies;
  const totalPages = Math.ceil(totalCompanies / 20);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Geography", href: "/geography" },
    { label: countryData.name },
  ];

  const metaDescription = `Explore ${totalCompanies.toLocaleString()} businesses in ${countryData.name}. Browse companies by sector and industry in this comprehensive ${countryData.name} business directory.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateDisclosureBanner />
      <SEOHead
        title={`${countryData.name} ${countryData.flagEmoji} Business Directory - ${totalCompanies} Companies | COMCUBES`}
        description={metaDescription}
        canonicalUrl={`https://comcubes.com/geography/country/${countryData.slug}`}
        ogType="website"
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
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
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
              <BannerAd className="sticky top-24" position="left" />
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
                <BannerAd className="sticky top-24" position="left" />
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
                    <span>📄 Page {currentPage} of {totalPages}</span>
                  </div>
                </div>

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
