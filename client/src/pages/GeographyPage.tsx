import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, Globe2, MapPin } from "lucide-react";
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
    <>
      <SEOHead
        title="Browse by Geography - Global Business Directory | COMCUBES"
        description="Explore businesses worldwide by continent, region, and country. Navigate our comprehensive global business directory organized by geographic location. Discover companies across all continents and countries."
        keywords={["global business directory", "companies by country", "geographic business search", "worldwide companies", "international business directory", "businesses by continent", "geographic navigation"]}
        canonicalUrl="/geography"
        ogTitle="Global Business Geography | COMCUBES GBD"
        ogDescription="Browse businesses worldwide by continent, region, and country. Comprehensive geographic navigation across our global business directory."
        structuredData={structuredData}
      />

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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/search')}
                    className="flex items-center gap-2"
                    data-testid="button-advanced-search"
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
                  data-testid="button-advanced-search-mobile"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbsForNav} />
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-4">
                <Globe2 className="h-8 w-8 sm:h-10 sm:w-10" />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Global Geography</h1>
              </div>
              <p className="text-lg sm:text-xl text-blue-100 max-w-3xl">
                Explore businesses worldwide by continent, region, and country. Discover companies across the globe.
              </p>
              
              {stats && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold">{stats.totalContinents}</div>
                    <div className="text-sm text-blue-200">Continents</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold">{stats.totalRegions}</div>
                    <div className="text-sm text-blue-200">Regions</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold">{stats.totalCountries}</div>
                    <div className="text-sm text-blue-200">Countries</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold">{stats.totalGeocodedCompanies.toLocaleString()}</div>
                    <div className="text-sm text-blue-200">Companies</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-continents-heading">
              Explore by Continent
            </h2>
            <p className="text-gray-600">
              Select a continent to explore regions, countries, and companies
            </p>
          </div>

          {continents && continents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {continents.map((continent) => (
                <Card
                  key={continent.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 group"
                  onClick={() => handleContinentClick(continent)}
                  data-testid={`card-continent-${continent.slug}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-5xl">{continent.flagEmoji}</div>
                      <MapPin className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {continent.name}
                    </h3>
                    {continent.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {continent.description}
                      </p>
                    )}
                    <div className="mt-3 text-sm text-blue-600 font-medium">
                      Explore →
                    </div>
                  </CardContent>
                </Card>
              ))}
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
      </div>
    </>
  );
}
