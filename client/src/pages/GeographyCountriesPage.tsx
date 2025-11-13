import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BannerAd } from "@/components/BannerAd";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Globe2, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import type { SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

interface Country {
  id: number;
  name: string;
  regionName: string;
  continentName: string;
  companyCount: number;
}

interface CountriesData {
  countries: Country[];
}

export default function GeographyCountriesPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, error } = useQuery<CountriesData>({
    queryKey: ["/api/geography/countries"],
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
    { label: "Countries" },
  ];

  const structuredDataItems = [
    { name: "Home", url: "/" },
    { name: "Geography", url: "/geography" },
    { name: "Countries", url: "/geography/countries" },
  ];

  const breadcrumbStructuredData = createBreadcrumbStructuredData(structuredDataItems);

  const groupedCountries = data?.countries.reduce((acc, country) => {
    if (!acc[country.regionName]) {
      acc[country.regionName] = { continentName: country.continentName, countries: [] };
    }
    acc[country.regionName].countries.push(country);
    return acc;
  }, {} as Record<string, { continentName: string; countries: Country[] }>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading countries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error Loading Countries</p>
            <p className="text-gray-600">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Global Business Countries - COMCUBES Directory"
        description={`Browse ${data?.countries.length || '190+'} countries with business listings. Find companies by country across all continents and regions worldwide.`}
        canonicalUrl="/geography/countries"
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
                  Back to Countries
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
                    Explore {data?.countries.length || '190+'} Countries Worldwide
                  </h1>

                  <p className="text-lg text-gray-700 mb-6">
                    Browse companies by country across all continents. Each country listing shows the number of companies
                    in our directory, organized by geographic regions for easy navigation.
                  </p>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 mb-8">
                    <h3 className="font-semibold text-purple-900 mb-2">Quick Stats</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-purple-700">
                      <span className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4" />
                        {data?.countries.length || '190+'} Countries
                      </span>
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {data?.countries.reduce((sum, c) => sum + c.companyCount, 0).toLocaleString() || '7,000+'} Companies
                      </span>
                    </div>
                  </div>
                </div>

                <div className="my-8 flex justify-center">
                  <GoogleAdSense 
                    format="responsive"
                    className="w-full max-w-4xl"
                    position="countries-page-in-content"
                  />
                </div>

                {/* Countries Grouped by Region */}
                {groupedCountries && Object.keys(groupedCountries).sort().map((regionName) => {
                  const regionData = groupedCountries[regionName];
                  return (
                    <div key={regionName} className="mb-12">
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">{regionData.continentName}</div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <Globe2 className="h-6 w-6 text-purple-600" />
                          {regionName}
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {regionData.countries.map((country) => (
                          <Card
                            key={country.id}
                            className="hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-purple-400"
                            data-testid={`card-country-${country.id}`}
                          >
                            <CardContent className="p-4">
                              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                {country.name}
                              </h3>

                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  Companies
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {country.companyCount}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
