import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BannerAd } from "@/components/BannerAd";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Globe2, MapPin, Map, Building2 } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";
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

interface GeographicStats {
  totalContinents: number;
  totalRegions: number;
  totalCountries: number;
  totalGeocodedCompanies: number;
  confidenceDistribution: Array<{ confidence: string; count: number }>;
}

// Continent-specific gradient colors
const continentGradients: Record<string, string> = {
  africa: "from-yellow-50 to-orange-100 border-orange-200",
  antarctica: "from-blue-50 to-cyan-100 border-cyan-200",
  asia: "from-red-50 to-pink-100 border-pink-200",
  europe: "from-indigo-50 to-purple-100 border-purple-200",
  "north-america": "from-green-50 to-emerald-100 border-emerald-200",
  "south-america": "from-lime-50 to-teal-100 border-teal-200",
  oceania: "from-sky-50 to-blue-100 border-blue-200",
};

export default function GeographyPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: continents, isLoading: continentsLoading } = useQuery<Continent[]>({
    queryKey: ["/api/geography/continents"],
    staleTime: Infinity,
  });

  const { data: stats } = useQuery<GeographicStats>({
    queryKey: ["/api/geography/stats"],
    staleTime: Infinity,
  });

  const handleContinentClick = (continent: Continent) => {
    setLocation(`/geography/continent/${encodeURIComponent(continent.slug)}`);
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const breadcrumbsForSEO = [
    { name: "Home", url: "/" },
    { name: "Geography", url: "/geography" }
  ];

  const breadcrumbsForNav = [
    { label: "Home", href: "/" },
    { label: "Geography" }
  ];

  const structuredData = createBreadcrumbStructuredData(breadcrumbsForSEO);

  if (continentsLoading) {
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
            <p className="mt-4 text-gray-600">Loading geographic data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateDisclosureBanner />
      <SEOHead
        title="Browse by Geography - Global Business Directory | COMCUBES"
        description="Explore businesses worldwide by continent, region, and country. Navigate our comprehensive global business directory organized by geographic location. Discover companies across all continents and countries."
        keywords={["global business directory", "companies by country", "geographic business search", "worldwide companies", "international business directory", "businesses by continent", "geographic navigation"]}
        canonicalUrl="/geography"
        ogTitle="Global Business Geography | COMCUBES GBD"
        ogDescription="Browse businesses worldwide by continent, region, and country. Comprehensive geographic navigation across our global business directory."
        structuredData={structuredData}
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

      {/* Three-column layout with sidebar banner ads */}
      <div className="flex gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Left Sidebar - Advertisement Banner - 160x600 */}
        <div className="hidden lg:block flex-shrink-0">
          <BannerAd 
            className="sticky top-24" 
            position="left"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-green-500 p-3 rounded-lg">
                <Globe2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Global Geography
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl">
              Explore businesses worldwide by continent, region, and country. Discover companies across the globe organized by geographic location.
            </p>
          </div>

          {/* Statistics Cards - Improved Design */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Card className="border-t-4 border-t-blue-500">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Map className="h-5 w-5 text-blue-600" />
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Continents
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalContinents}</div>
                  <div className="text-sm text-gray-600 mt-1">Major regions</div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-green-500">
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

              <Card className="border-t-4 border-t-purple-500">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Globe2 className="h-5 w-5 text-purple-600" />
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Countries
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalCountries}</div>
                  <div className="text-sm text-gray-600 mt-1">Worldwide</div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-orange-500">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="h-5 w-5 text-orange-600" />
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Companies
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalGeocodedCompanies.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-1">Listed</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Continents Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-continents-heading">
              Explore by Continent
            </h2>
            <p className="text-gray-600">
              Select a continent to explore regions, countries, and companies
            </p>
          </div>

          {/* Continent Cards - Enhanced Design */}
          {continents && continents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {continents.map((continent) => {
                const gradientClass = continentGradients[continent.slug] || "from-gray-50 to-gray-100 border-gray-200";
                return (
                  <Card
                    key={continent.id}
                    className={`hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group border-2 bg-gradient-to-br ${gradientClass}`}
                    onClick={() => handleContinentClick(continent)}
                    data-testid={`card-continent-${continent.slug}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-6xl drop-shadow-lg">{continent.flagEmoji}</div>
                        <div className="bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {continent.name}
                      </h3>
                      {continent.description && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                          {continent.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-300">
                        <Badge variant="outline" className="bg-white">
                          {continent.code}
                        </Badge>
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
                <p className="text-gray-600">No continents available</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Advertisement Banner - 160x600 */}
        <div className="hidden lg:block flex-shrink-0">
          <BannerAd 
            className="sticky top-24" 
            position="right"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Exploring businesses across 7 continents, 22 regions, and 198 countries.</p>
            <p className="mt-2 text-sm">Featuring {stats?.totalGeocodedCompanies.toLocaleString() || '7,491'} geocoded companies worldwide with geographic navigation capabilities.</p>
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
