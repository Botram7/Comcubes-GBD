import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Globe2, MapPin, Map, ArrowLeft, Building2 } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData, createPlaceStructuredData, BRAND_KEYWORDS } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import type { SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

interface Continent {
  id: number;
  name: string;
  slug: string;
  code: string;
  flagEmoji: string;
  description: string | null;
}

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

interface ContinentWithStats {
  continent: Continent;
  regions: Array<Region & { countryCount: number; companyCount: number }>;
  countries: Array<Country & { companyCount: number }>;
  stats: {
    totalRegions: number;
    totalCountries: number;
    totalCompanies: number;
  };
}

// Region-specific gradient colors
const regionGradients: Record<string, string> = {
  "eastern-africa": "from-orange-50 to-yellow-100 border-orange-200",
  "middle-africa": "from-amber-50 to-orange-100 border-amber-200",
  "northern-africa": "from-yellow-50 to-amber-100 border-yellow-200",
  "southern-africa": "from-red-50 to-pink-100 border-red-200",
  "western-africa": "from-lime-50 to-green-100 border-lime-200",
  
  "central-asia": "from-purple-50 to-pink-100 border-purple-200",
  "eastern-asia": "from-red-50 to-orange-100 border-red-200",
  "south-eastern-asia": "from-teal-50 to-cyan-100 border-teal-200",
  "southern-asia": "from-yellow-50 to-orange-100 border-yellow-200",
  "western-asia": "from-blue-50 to-indigo-100 border-blue-200",
  
  "eastern-europe": "from-indigo-50 to-purple-100 border-indigo-200",
  "northern-europe": "from-blue-50 to-cyan-100 border-blue-200",
  "southern-europe": "from-yellow-50 to-amber-100 border-yellow-200",
  "western-europe": "from-green-50 to-emerald-100 border-green-200",
  
  "caribbean": "from-cyan-50 to-blue-100 border-cyan-200",
  "central-america": "from-green-50 to-teal-100 border-green-200",
  "northern-america": "from-blue-50 to-indigo-100 border-blue-200",
  
  "south-america": "from-lime-50 to-green-100 border-lime-200",
  
  "australia-and-new-zealand": "from-emerald-50 to-teal-100 border-emerald-200",
  "melanesia": "from-blue-50 to-cyan-100 border-blue-200",
  "micronesia": "from-sky-50 to-blue-100 border-sky-200",
  "polynesia": "from-purple-50 to-pink-100 border-purple-200",
};

export default function ContinentPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/geography/continent/:slug");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const continentSlug = params?.slug || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [continentSlug]);

  const { data: continentData, isLoading, error} = useQuery<ContinentWithStats>({
    queryKey: [`/api/geography/continents/${continentSlug}`],
    enabled: !!continentSlug,
    staleTime: Infinity,
  });

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleRegionClick = (region: Region) => {
    setLocation(`/geography/region/${encodeURIComponent(region.slug)}`);
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
            <p className="mt-4 text-gray-600">Loading continent data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !continentData) {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Continent Not Found</h2>
              <p className="text-gray-600 mb-4">The continent you're looking for doesn't exist or couldn't be loaded.</p>
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

  const { continent, regions, countries, stats } = continentData;

  const breadcrumbsForSEO = [
    { name: "Home", url: "/" },
    { name: "Geography", url: "/geography" },
    { name: continent.name, url: `/geography/continent/${continent.slug}` }
  ];

  const breadcrumbsForNav = [
    { label: "Home", href: "/" },
    { label: "Geography", href: "/geography" },
    { label: continent.name }
  ];

  const structuredData = createBreadcrumbStructuredData(breadcrumbsForSEO);

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateDisclosureBanner />
      <SEOHead
        title={`${continent.name} Business Directory - ${stats.totalCompanies.toLocaleString()} Companies | COMCUBES`}
        description={`Discover businesses in ${continent.name}. Browse ${stats.totalRegions} regions, ${stats.totalCountries} countries, and ${stats.totalCompanies.toLocaleString()} companies. Find local services, international brands, and business opportunities across ${continent.name} on COMCUBES.`}
        keywords={[
          ...BRAND_KEYWORDS.slice(0, 5),
          `${continent.name} businesses`, `companies in ${continent.name}`, `${continent.name} business directory`, 
          `${continent.name.toLowerCase()} companies`, `find businesses in ${continent.name}`,
          `${continent.name} regions`, `${continent.name} countries`, `${continent.name} local businesses`,
          "geographic business search", "businesses by location", "international business directory"
        ]}
        canonicalUrl={`https://comcubes.com/geography/continent/${continent.slug}`}
        ogTitle={`${continent.name} Business Directory | COMCUBES`}
        ogDescription={`Discover ${stats.totalCompanies.toLocaleString()} businesses across ${continent.name} in ${stats.totalCountries} countries.`}
        structuredData={structuredData}
        additionalStructuredData={[
          createPlaceStructuredData(
            continent.name,
            'Continent',
            `https://comcubes.com/geography/continent/${continent.slug}`,
            continent.description || `Business directory for ${continent.name} with ${stats.totalCompanies.toLocaleString()} companies`
          )
        ]}
      />

      {/* Header - Consistent with SearchPage */}
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

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbsForNav} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/geography')}
              className="mb-4"
              data-testid="button-back-to-geography"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Geography
            </Button>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl md:text-7xl drop-shadow-lg">{continent.flagEmoji}</div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {continent.name}
                </h1>
                <Badge variant="secondary" className="mt-2">
                  {continent.code}
                </Badge>
              </div>
            </div>
            {continent.description && (
              <p className="text-lg text-gray-600 max-w-3xl">
                {continent.description}
              </p>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card 
              className="border-t-4 border-t-green-500 cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => {
                const element = document.getElementById('regions-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              data-testid="card-stat-regions"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Regions
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalRegions}</div>
                <div className="text-sm text-gray-600 mt-1">Sub-regions</div>
              </CardContent>
            </Card>

            <Card 
              className="border-t-4 border-t-purple-500 cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setLocation(`/geography/countries?continent=${continent.slug}`)}
              data-testid="card-stat-countries"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Globe2 className="h-5 w-5 text-purple-600" />
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Countries
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalCountries}</div>
                <div className="text-sm text-gray-600 mt-1">Nationwide</div>
              </CardContent>
            </Card>

            <Card 
              className="border-t-4 border-t-orange-500 cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setLocation(`/geography/companies?continent=${continent.slug}`)}
              data-testid="card-stat-companies"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Companies
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalCompanies.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">Listed</div>
              </CardContent>
            </Card>
          </div>

          {/* Regions Section */}
          <div className="mb-8" id="regions-section">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-regions-heading">
              Regions in {continent.name}
            </h2>
            <p className="text-gray-600 mb-4">
              Explore businesses by regional area within {continent.name}
            </p>

            {regions && regions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {regions.map((region) => {
                  const gradientClass = regionGradients[region.slug] || "from-gray-50 to-gray-100 border-gray-200";
                  return (
                    <Card
                      key={region.id}
                      className={`hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group border-2 bg-gradient-to-br ${gradientClass}`}
                      onClick={() => handleRegionClick(region)}
                      data-testid={`card-region-${region.slug}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Map className="h-8 w-8 text-blue-600" />
                          <div className="bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {region.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex justify-between">
                            <span>Countries:</span>
                            <span className="font-semibold">{region.countryCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Companies:</span>
                            <span className="font-semibold">{region.companyCount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-300">
                          {region.code && (
                            <Badge variant="outline" className="bg-white">
                              {region.code}
                            </Badge>
                          )}
                          <div className="text-sm text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Explore
                            <MapPin className="h-4 w-4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No regions available</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Countries Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-countries-heading">
              Countries in {continent.name}
            </h2>
            <p className="text-gray-600 mb-4">
              Browse companies by country across {continent.name}
            </p>

            {countries && countries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {countries.map((country) => (
                  <Card
                    key={country.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer group border"
                    onClick={() => handleCountryClick(country)}
                    data-testid={`card-country-${country.slug}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{country.flagEmoji}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {country.name}
                          </h3>
                          <p className="text-xs text-gray-500">{country.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Companies:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {country.companyCount?.toLocaleString() || 0}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No countries available</p>
                </CardContent>
              </Card>
            )}
          </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Exploring {continent.name} with {stats.totalCompanies.toLocaleString()} companies across {stats.totalCountries} countries.</p>
            <p className="mt-2 text-sm">Browse by region, country, and business sector for comprehensive {continent.name} coverage.</p>
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
