import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { BannerAd } from "@/components/BannerAd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Globe2, MapPin, Map, ArrowLeft, Building2, Layers } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData, createPlaceStructuredData, BRAND_KEYWORDS } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import type { SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

interface Region {
  id: number;
  name: string;
  slug: string;
  code: string | null;
  description: string | null;
  continentId: number;
}

interface Country {
  id: number;
  name: string;
  slug: string;
  code: string;
  flagEmoji: string;
  capital: string | null;
  currency: string | null;
  region: string;
  companyCount?: number;
}

interface RegionWithStats {
  region: Region;
  stats: {
    totalCountries: number;
    totalCompanies: number;
    topCountries: Array<{ countryName: string; companyCount: number }>;
  };
  countries: Array<Country & { companyCount: number }>;
}

// Country-specific gradient colors (simplified for now)
const countryGradients: Record<string, string> = {
  default: "from-blue-50 to-cyan-100 border-blue-200",
};

export default function RegionPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/geography/region/:slug");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const regionSlug = params?.slug || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [regionSlug]);

  const { data: regionData, isLoading, error} = useQuery<RegionWithStats>({
    queryKey: [`/api/geography/regions/${regionSlug}`],
    enabled: !!regionSlug,
    staleTime: Infinity,
  });

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleCountryClick = (country: Country) => {
    setLocation(`/geography/country/${encodeURIComponent(country.slug)}`);
  };

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
                <div className="flex-1 mr-2 sm:mr-4 min-w-0">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
                <div className="hidden sm:flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setLocation('/sectors')} className="flex items-center gap-2 flex-shrink-0">
                    <Layers className="h-4 w-4" />
                    Business Sectors
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setLocation('/search')} className="flex items-center gap-2 flex-shrink-0">
                    <Building2 className="h-4 w-4" />
                    Advanced Search
                  </Button>
                </div>
              </div>
              <div className="sm:hidden mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setLocation('/sectors')} className="flex items-center gap-2 flex-1 justify-center">
                  <Layers className="h-4 w-4" />
                  Sectors
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLocation('/search')} className="flex items-center gap-2 flex-1 justify-center">
                  <Building2 className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading region data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !regionData) {
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
                <div className="flex-1 mr-2 sm:mr-4 min-w-0">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
                <div className="hidden sm:flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setLocation('/sectors')} className="flex items-center gap-2 flex-shrink-0">
                    <Layers className="h-4 w-4" />
                    Business Sectors
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setLocation('/search')} className="flex items-center gap-2 flex-shrink-0">
                    <Building2 className="h-4 w-4" />
                    Advanced Search
                  </Button>
                </div>
              </div>
              <div className="sm:hidden mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setLocation('/sectors')} className="flex items-center gap-2 flex-1 justify-center">
                  <Layers className="h-4 w-4" />
                  Sectors
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLocation('/search')} className="flex items-center gap-2 flex-1 justify-center">
                  <Building2 className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Region Not Found</h2>
              <p className="text-gray-600 mb-4">The region you're looking for doesn't exist or couldn't be loaded.</p>
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

  const { region, stats, countries } = regionData;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Geography", href: "/geography" },
    { label: region.name },
  ];

  const breadcrumbItems = breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.label,
    ...(crumb.href && { "item": `https://comcubes.com${crumb.href}` }),
  }));

  const metaDescription = region.description || 
    `Explore ${stats.totalCompanies.toLocaleString()} businesses across ${stats.totalCountries} countries in ${region.name}. Discover companies by location in this regional business directory.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${region.name} Business Directory - ${stats.totalCompanies.toLocaleString()} Companies in ${stats.totalCountries} Countries | COMCUBES`}
        description={metaDescription}
        keywords={[
          ...BRAND_KEYWORDS.slice(0, 5),
          `${region.name} businesses`, `companies in ${region.name}`, `${region.name} business directory`,
          `${region.name.toLowerCase()} companies`, `find businesses in ${region.name}`,
          `${region.name} countries`, `${region.name} local businesses`,
          "regional business search", "businesses by region", "international business directory"
        ]}
        canonicalUrl={`https://comcubes.com/geography/region/${region.slug}`}
        ogType="website"
        ogTitle={`${region.name} Business Directory | COMCUBES`}
        ogDescription={`Explore ${stats.totalCompanies.toLocaleString()} companies across ${stats.totalCountries} countries in ${region.name}.`}
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: "https://comcubes.com/" },
          { name: "Geography", url: "https://comcubes.com/geography" },
          { name: region.name, url: `https://comcubes.com/geography/region/${region.slug}` }
        ])}
        additionalStructuredData={[
          createPlaceStructuredData(
            region.name,
            'AdministrativeArea',
            `https://comcubes.com/geography/region/${region.slug}`,
            region.description || `Business directory for ${region.name} with ${stats.totalCompanies.toLocaleString()} companies`
          )
        ]}
      />
      
      <AffiliateDisclosureBanner />

      {/* Header - Consistent with other pages */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Main header row */}
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity mr-1 sm:mr-4 flex-shrink-0" onClick={() => setLocation('/')}>
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
                  onClick={() => setLocation('/')}
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

      {searchResults ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="hidden lg:block flex-shrink-0">
              <BannerAd className="sticky top-24" position="left" />
            </div>
            
            <div className="flex-1">
          <div className="mb-6">
            <Button
              onClick={() => setSearchResults(null)}
              variant="outline"
              className="gap-2"
              data-testid="button-clear-search"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {region.name}
            </Button>
          </div>

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
            
            <div className="hidden lg:block flex-shrink-0">
              <BannerAd className="sticky top-24" position="right" />
            </div>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="hidden lg:block flex-shrink-0">
              <BannerAd className="sticky top-24" position="left" />
            </div>
            
            <div className="flex-1">
              <Breadcrumbs items={breadcrumbs} />

          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-lg p-6 sm:p-8 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Map className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Countries in {region.name}
                </h1>
                <p className="text-gray-700 mb-4">
                  {region.description || `Explore businesses by country within ${region.name}`}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {stats.totalCountries} {stats.totalCountries === 1 ? 'Country' : 'Countries'}
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    <Building2 className="w-4 h-4 mr-1" />
                    {stats.totalCompanies.toLocaleString()} {stats.totalCompanies === 1 ? 'Company' : 'Companies'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Countries in {region.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {countries.map((country) => {
                const gradientClass = countryGradients[country.slug] || countryGradients.default;
                
                return (
                  <Card
                    key={country.id}
                    className={`hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br ${gradientClass}`}
                    onClick={() => handleCountryClick(country)}
                    data-testid={`card-country-${country.slug}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="text-4xl flex-shrink-0">{country.flagEmoji}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {country.name}
                          </h3>
                          {country.capital && (
                            <p className="text-sm text-gray-600">Capital: {country.capital}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center justify-between bg-white/50 rounded px-3 py-2">
                          <span className="text-gray-600 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Companies:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {country.companyCount?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCountryClick(country);
                        }}
                        data-testid={`button-explore-country-${country.slug}`}
                      >
                        Explore <Globe2 className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

            </div>
            
            <div className="hidden lg:block flex-shrink-0">
              <BannerAd className="sticky top-24" position="right" />
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600">
                <p>&copy; 2025 COMCUBES Global Business Directory. Exploring {region.name} with {stats.totalCompanies.toLocaleString()} companies across {stats.totalCountries} {stats.totalCountries === 1 ? 'country' : 'countries'}.</p>
                <p className="mt-2 text-sm">Browse by country and business sector for comprehensive {region.name} coverage.</p>
                <div className="mt-4 flex justify-center space-x-6 text-xs">
                  <button onClick={() => setLocation('/privacy-policy')} className="hover:text-gray-900 underline">Privacy Policy</button>
                  <button onClick={() => setLocation('/terms-of-service')} className="hover:text-gray-900 underline">Terms of Service</button>
                  <button onClick={() => setLocation('/disclaimer')} className="hover:text-gray-900 underline">Disclaimer</button>
                  <button onClick={() => setLocation('/affiliate-disclosure')} className="hover:text-gray-900 underline">Affiliate Disclosure</button>
                </div>
              </div>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}
