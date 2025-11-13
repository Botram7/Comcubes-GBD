import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BannerAd } from "@/components/BannerAd";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
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

  return (
    <>
      <SEOHead
        title="Global Business Regions - COMCUBES Directory"
        description={`Explore ${data?.regions.length || 22} business regions across all continents. Browse companies organized by geographic regions including Western Europe, Southeast Asia, North America, and more.`}
        canonicalUrl="/geography/regions"
        structuredData={breadcrumbStructuredData}
      />

      <div className="min-h-screen bg-gray-50">
        <AffiliateDisclosureBanner />

        <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 mb-4">
              <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">COMCUBES</h1>
            </div>
            <Breadcrumbs items={breadcrumbItems} />
            <div className="mt-4">
              <SearchBar onSearchResults={handleSearchResults} />
            </div>
          </div>
        </div>

        <div className="flex max-w-[1600px] mx-auto gap-6">
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="left" />
          </div>

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
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

                <div className="my-8 flex justify-center">
                  <GoogleAdSense 
                    format="responsive"
                    className="w-full max-w-4xl"
                    position="regions-page-in-content"
                  />
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
                          className="hover:shadow-lg transition-all duration-200 border-2 border-gray-200 hover:border-blue-400"
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
      </div>
    </>
  );
}
