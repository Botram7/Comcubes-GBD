import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { BannerAd } from "@/components/BannerAd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MapPin, Globe2, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import type { SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

interface Region {
  id: number;
  name: string;
  continentName: string;
  countryCount: number;
  companyCount: number;
}

interface RegionsData {
  regions: Region[];
  continents: string[];
}

export default function GeographyRegionsPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, error } = useQuery<RegionsData>({
    queryKey: ["/api/geography/regions"],
    staleTime: Infinity,
  });

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleBackToGeography = () => {
    setLocation('/geography');
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Geography", href: "/geography" },
    { label: "Regions" },
  ];

  const structuredDataItems = [
    { name: "Home", url: "/" },
    { name: "Geography", url: "/geography" },
    { name: "Regions", url: "/geography/regions" },
  ];

  const breadcrumbStructuredData = createBreadcrumbStructuredData(structuredDataItems);

  const groupedRegions = data?.regions.reduce((acc, region) => {
    if (!acc[region.continentName]) {
      acc[region.continentName] = [];
    }
    acc[region.continentName].push(region);
    return acc;
  }, {} as Record<string, Region[]>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading regions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error Loading Regions</p>
            <p className="text-gray-600">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRegionClick = (regionName: string) => {
    setLocation(`/geography/countries?region=${encodeURIComponent(regionName)}`);
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  return (
    <div className="page-with-sticky-footer bg-gray-50 font-inter">
      <AffiliateDisclosureBanner />
      <SEOHead
        title="Global Business Regions - COMCUBES Directory"
        description={`Explore ${data?.regions.length || 22} business regions across all continents. Browse companies organized by geographic regions including Western Europe, Southeast Asia, North America, and more.`}
        canonicalUrl="/geography/regions"
        structuredData={breadcrumbStructuredData}
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
          { label: "Regions" }
        ]} 
      />

      <main className="main-content-with-sticky-footer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="left" />
          </div>
          
          <div className="flex-1">
            {searchResults ? (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setSearchResults(null)}
                  className="mb-4"
                  data-testid="button-clear-search"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Regions
                </Button>

                <h2 className="text-2xl font-bold mb-4">Search Results</h2>
                <div className="text-gray-600 mb-6">
                  Found {searchResults.sectors.length + searchResults.industries.length + searchResults.companies.length} results
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant="ghost"
                      onClick={handleBackToGeography}
                      data-testid="button-back-geography"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Geography
                    </Button>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Explore {data?.regions.length || 22} Global Business Regions
                  </h1>

                  <p className="text-lg text-gray-700 mb-6">
                    Browse businesses organized by geographic regions across all continents. Each region contains multiple countries
                    with detailed company listings, making it easy to explore businesses by location.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
                    <h3 className="font-semibold text-blue-900 mb-2">Quick Stats</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-blue-700">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {data?.regions.length || 22} Regions
                      </span>
                      <span className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4" />
                        {data?.regions.reduce((sum, r) => sum + r.countryCount, 0) || '190+'} Countries
                      </span>
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {data?.regions.reduce((sum, r) => sum + r.companyCount, 0).toLocaleString() || '7,000+'} Companies
                      </span>
                    </div>
                  </div>
                </div>

                {/* Regions Grouped by Continent */}
                {groupedRegions && Object.keys(groupedRegions).sort().map((continentName) => (
                  <div key={continentName} className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-blue-600" />
                      {continentName}
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {groupedRegions[continentName].map((region) => (
                        <Card
                          key={region.id}
                          className="hover:shadow-lg transition-all duration-200 border-2 border-gray-200 hover:border-blue-400 cursor-pointer"
                          onClick={() => handleRegionClick(region.name)}
                          data-testid={`card-region-${region.id}`}
                        >
                          <CardContent className="p-5">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              {region.name}
                            </h3>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Globe2 className="h-4 w-4" />
                                  Countries
                                </span>
                                <Badge variant="secondary">{region.countryCount}</Badge>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  Companies
                                </span>
                                <Badge variant="secondary">{region.companyCount.toLocaleString()}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}

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
