import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BannerAd } from "@/components/BannerAd";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Globe2, MapPin, Map, Building2 } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData, BRAND_KEYWORDS } from "@/components/SEOHead";
import { ReadMore } from "@/components/ReadMore";
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
        title="Find Businesses Near You or Worldwide | Browse by Location - COMCUBES"
        description="Discover local businesses in your city or explore companies globally. Search by continent, region, or country to find services near you or brands anywhere in the world. COMCUBES geographic business directory - your local and global business discovery starts here."
        keywords={[
          ...BRAND_KEYWORDS.slice(0, 5),
          "find businesses near me", "local businesses", "companies by location", "businesses worldwide", 
          "geographic search", "businesses by country", "local services", "global companies", 
          "business location finder", "international directory", "businesses by continent",
          "find companies by country", "regional business directory", "worldwide business search"
        ]}
        canonicalUrl="https://comcubes.com/geography"
        ogTitle="Find Local & Global Businesses by Location | COMCUBES"
        ogDescription="Discover businesses near you or anywhere in the world. Browse 7 continents, 22 regions, and 198 countries to find local services and global companies."
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
          <GoogleAdSense 
            format="vertical"
            className="sticky top-24"
            position="geography-page-left-sidebar"
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
                Discover Businesses by Location
              </h1>
            </div>
            
            <ReadMore className="prose max-w-none text-gray-700">
              <div className="space-y-4">
                <p className="text-lg leading-relaxed">
                  Welcome to COMCUBES' geographic business discovery system. Whether you're searching for services in your local area, exploring brands in specific countries, or researching international companies across continents—our location-based directory helps you find businesses exactly where you need them.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Why Search by Location?</h2>
                <p>
                  Geography matters in business. Local businesses understand regional needs, cultural preferences, and market dynamics in ways that distant competitors cannot. International companies adapt their offerings to different markets, creating unique opportunities in each region. By organizing our directory geographically, we help you find businesses that are relevant to specific locations—whether that's your hometown, a country you're researching, or an international market you're exploring.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">How Our Geographic System Works</h2>
                <p>
                  COMCUBES organizes companies using a three-tier geographic hierarchy: <strong>Continents</strong> (7 major world regions) → <strong>Regions</strong> (sub-continental areas) → <strong>Countries</strong> ({stats?.totalCountries || '190+'} nations). This structure mirrors how the world is actually organized, making it intuitive to drill down from broad geographic areas to specific nations. Once you select a country, you'll see all companies in our directory with a presence in that location.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Who Benefits from Location-Based Search?</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Local Consumers:</strong> Find services, shops, and businesses operating in your area or a specific city you're visiting.</li>
                  <li><strong>International Shoppers:</strong> Discover brands available in your country or explore products from specific regions worldwide.</li>
                  <li><strong>Business Travelers:</strong> Research companies in destinations before trips, find local service providers, and identify potential business partners in target markets.</li>
                  <li><strong>Market Researchers:</strong> Analyze business landscapes in specific countries, study regional industry concentrations, and identify market entry opportunities.</li>
                  <li><strong>Students & Researchers:</strong> Access educational institutions by country, study multinational company footprints, and gather geographic business data for projects.</li>
                  <li><strong>Investors:</strong> Explore businesses operating in emerging markets, assess regional economic activity, and identify geographic diversification opportunities.</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Real-World Use Cases</h2>
                <p className="mb-2">
                  Our geographic directory serves diverse discovery needs:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Planning a trip?</strong> Browse businesses in your destination country to find hotels, restaurants, tour operators, and local services.</li>
                  <li><strong>Moving to a new city?</strong> Discover local employers, service providers, schools, and businesses in your new location before you arrive.</li>
                  <li><strong>Expanding globally?</strong> Research competitors, partners, and market conditions in specific countries where you're considering business operations.</li>
                  <li><strong>Shopping internationally?</strong> Find brands and retailers that ship to your country or discover regional products available in specific locations.</li>
                  <li><strong>Academic research?</strong> Gather data on business distribution across regions, study economic development patterns, or compare industries across countries.</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Coverage and Data Quality</h2>
                <p>
                  Our directory includes {stats?.totalGeocodedCompanies?.toLocaleString() || '7,000+'} companies with verified geographic locations across {stats?.totalCountries || '190+'} countries. Each company listing includes location data when available, allowing you to see where businesses operate, where they're headquartered, and in some cases, their full international presence. We've organized this data across all inhabited continents, from major economic centers like North America and Europe to emerging markets in Africa, Asia, and South America.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Start Your Geographic Discovery</h2>
                <p>
                  Select a continent below to begin exploring businesses by location. Each continent card shows regional statistics and leads to sub-regions, which then break down into individual countries. This hierarchical approach lets you zoom in from global to local, finding exactly the geographic scope you need—whether that's exploring all of Europe, focusing on Southeast Asia, or drilling down to businesses specifically in Japan.
                </p>
              </div>
            </ReadMore>
          </div>

          {/* Statistics Cards - Clickable Navigation */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Card 
                className="border-t-4 border-t-blue-500 cursor-default"
              >
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

              <Card 
                className="border-t-4 border-t-green-500 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation('/geography/regions')}
                data-testid="card-nav-regions"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Regions
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalRegions}</div>
                  <div className="text-sm text-gray-600 mt-1">View all regions →</div>
                </CardContent>
              </Card>

              <Card 
                className="border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation('/geography/countries')}
                data-testid="card-nav-countries"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Globe2 className="h-5 w-5 text-purple-600" />
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Countries
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalCountries}</div>
                  <div className="text-sm text-gray-600 mt-1">View all countries →</div>
                </CardContent>
              </Card>

              <Card 
                className="border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation('/geography/companies')}
                data-testid="card-nav-companies"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="h-5 w-5 text-orange-600" />
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Companies
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalGeocodedCompanies.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-1">Browse by location →</div>
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
                        <p className="text-sm text-gray-700 mb-3">
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
