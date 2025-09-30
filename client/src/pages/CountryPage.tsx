import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BannerAd } from "@/components/BannerAd";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Globe2, MapPin, Building2, ArrowLeft, ExternalLink } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import type { SearchResults } from "@/lib/types";
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

interface Company {
  id: number;
  name: string;
  websiteUrl: string | null;
  industryName: string;
  sectorName: string;
  location?: {
    latitude: number | null;
    longitude: number | null;
    confidence: string | null;
  };
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
  const countrySlug = params?.slug || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [countrySlug]);

  const { data: countryData, isLoading, error } = useQuery<CountryWithStats>({
    queryKey: [`/api/geography/countries/${countrySlug}`],
    enabled: !!countrySlug,
    staleTime: Infinity,
  });

  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery<CompaniesResponse>({
    queryKey: [`/api/geography/countries/${countrySlug}/companies`],
    enabled: !!countrySlug,
    staleTime: Infinity,
  });

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AffiliateDisclosureBanner />
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity mr-1 sm:mr-4 flex-shrink-0" onClick={() => setLocation('/')}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
              </div>
              <div className="flex-1 mr-2 sm:mr-0">
                <SearchBar onSearchResults={handleSearchResults} />
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
            <div className="flex items-center h-16">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity mr-1 sm:mr-4 flex-shrink-0" onClick={() => setLocation('/')}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
              </div>
              <div className="flex-1 mr-2 sm:mr-0">
                <SearchBar onSearchResults={handleSearchResults} />
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Country Not Found</h2>
              <p className="text-gray-600 mb-4">The country you're looking for doesn't exist or couldn't be loaded.</p>
              <Button onClick={() => setLocation('/geography')} data-testid="button-back-geography">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Geography
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Geography", href: "/geography" },
    { label: countryData.name },
  ];

  const metaDescription = `Explore ${countryData.stats.totalCompanies.toLocaleString()} businesses in ${countryData.name}. Browse companies by sector and industry in this comprehensive ${countryData.name} business directory.`;

  const companies = companiesData?.companies || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${countryData.name} Business Directory - ${countryData.stats.totalCompanies} Companies | COMCUBES`}
        description={metaDescription}
        canonicalUrl={`https://comcubes.com/geography/country/${countryData.slug}`}
        ogType="website"
      />
      
      <AffiliateDisclosureBanner />

      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity mr-1 sm:mr-4 flex-shrink-0" onClick={() => setLocation('/')}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
              </div>
            </div>
            <div className="flex-1 mr-2 sm:mr-0">
              <SearchBar onSearchResults={handleSearchResults} />
            </div>
          </div>
        </div>
      </header>

      {searchResults ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              onClick={() => setSearchResults(null)}
              variant="outline"
              className="gap-2"
              data-testid="button-clear-search"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {countryData.name}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-2 order-1 lg:order-1">
              <BannerAd position="left" />
            </div>

            <div className="lg:col-span-8 order-2 lg:order-2">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results
                  <span className="ml-2 text-base font-normal text-gray-600">
                    ({(searchResults.sectors?.length || 0) + (searchResults.industries?.length || 0) + (searchResults.companies?.length || 0)} results)
                  </span>
                </h2>

                {searchResults.sectors && searchResults.sectors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Sectors</h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      {searchResults.sectors.map((sector) => (
                        <Card
                          key={sector.id}
                          className="hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => setLocation(`/sector/${encodeURIComponent(sector.name)}`)}
                          data-testid={`card-sector-${sector.id}`}
                        >
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900">{sector.name}</h4>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.industries && searchResults.industries.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Industries</h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      {searchResults.industries.map((industry) => (
                        <Card
                          key={industry.id}
                          className="hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => setLocation(`/industry/${encodeURIComponent(industry.name)}`)}
                          data-testid={`card-industry-${industry.id}`}
                        >
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900">{industry.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{industry.sectorName}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.companies && searchResults.companies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Companies</h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      {searchResults.companies.map((company) => (
                        <Card
                          key={company.id}
                          className="hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => company.websiteUrl && window.open(company.websiteUrl, '_blank', 'noopener,noreferrer')}
                          data-testid={`card-company-${company.id}`}
                        >
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900">{company.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{company.industryName}</p>
                            {company.websiteUrl && (
                              <p className="text-xs text-blue-600 mt-2 truncate">{company.websiteUrl}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {(searchResults.sectors?.length || 0) + (searchResults.industries?.length || 0) + (searchResults.companies?.length || 0) === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600">Try adjusting your search terms</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 order-3 lg:order-3">
              <BannerAd position="right" />
            </div>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-2 order-1 lg:order-1">
              <BannerAd position="left" />
            </div>

            <div className="lg:col-span-8 order-2 lg:order-2">
              <Breadcrumbs items={breadcrumbs} />

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-lg p-6 sm:p-8 mb-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="text-6xl sm:text-7xl">
                      {countryData.flagEmoji}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Companies in {countryData.name}
                    </h1>
                    {countryData.capital && (
                      <p className="text-gray-700 mb-2">
                        <strong>Capital:</strong> {countryData.capital}
                        {countryData.currency && ` • ${countryData.currency}`}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Badge variant="secondary" className="text-sm py-1 px-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {countryData.region}
                      </Badge>
                      <Badge variant="secondary" className="text-sm py-1 px-3">
                        <Building2 className="w-4 h-4 mr-1" />
                        {countryData.stats.totalCompanies.toLocaleString()} {countryData.stats.totalCompanies === 1 ? 'Company' : 'Companies'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {isLoadingCompanies ? (
                <div className="flex items-center justify-center min-h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading companies...</p>
                  </div>
                </div>
              ) : companies.length > 0 ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Companies in {countryData.name}
                    <span className="ml-2 text-lg font-normal text-gray-600">
                      ({companies.length.toLocaleString()})
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {companies.map((company) => (
                      <Card
                        key={company.id}
                        className="hover:shadow-xl transition-all cursor-pointer bg-white"
                        onClick={() => company.websiteUrl && window.open(company.websiteUrl, '_blank', 'noopener,noreferrer')}
                        data-testid={`card-company-${company.id}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 flex-1">
                              {company.name}
                            </h3>
                            {company.websiteUrl && (
                              <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="text-xs">
                                {company.sectorName}
                              </Badge>
                            </div>
                            <p className="text-gray-600">{company.industryName}</p>
                            {company.websiteUrl && (
                              <p className="text-xs text-blue-600 truncate">{company.websiteUrl}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
                    <p className="text-gray-600">There are currently no companies listed for {countryData.name}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2 order-3 lg:order-3">
              <BannerAd position="right" />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
