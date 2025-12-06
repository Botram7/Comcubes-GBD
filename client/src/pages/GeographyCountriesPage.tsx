import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { BannerAd } from "@/components/BannerAd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Globe2, Building2, ArrowLeft, MapPin, Layers } from "lucide-react";
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
  const [regionFilter, setRegionFilter] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setRegionFilter(urlParams.get('region') || '');
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, error } = useQuery<CountriesData>({
    queryKey: ["/api/geography/countries", regionFilter],
    staleTime: Infinity,
  });

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleBackToGeography = () => {
    setLocation('/geography');
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  const handleCountryClick = (countryName: string) => {
    setLocation(`/geography/companies?country=${encodeURIComponent(countryName)}`);
  };

  const filteredCountries = regionFilter
    ? data?.countries.filter(c => c.regionName === regionFilter)
    : data?.countries;

  const groupedCountries = filteredCountries?.reduce((acc, country) => {
    if (!acc[country.regionName]) {
      acc[country.regionName] = { continentName: country.continentName, countries: [] };
    }
    acc[country.regionName].countries.push(country);
    return acc;
  }, {} as Record<string, { continentName: string; countries: Country[] }>);

  if (isLoading) {
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
                <div className="hidden sm:flex items-center">
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading countries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                <div className="hidden sm:flex items-center">
                  <span className="text-sm text-gray-600">Error</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">Error Loading Data</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Failed to load countries. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sticky-footer bg-gray-50 font-inter">
      <AffiliateDisclosureBanner />
      <SEOHead
        title={`Global Business Countries${regionFilter ? ` - ${regionFilter}` : ''} - COMCUBES Directory`}
        description={`Browse ${filteredCountries?.length || '190+'} countries with business listings. Find companies by country across all continents and regions worldwide.`}
        canonicalUrl="/geography/countries"
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: "/" },
          { name: "Geography", url: "/geography" },
          { name: "Countries", url: "/geography/countries" },
        ])}
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
                  onClick={handleBackToHome}
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

      <Breadcrumbs 
        items={[
          { label: "Home", onClick: handleBackToHome },
          { label: "Geography", onClick: handleBackToGeography },
          { label: regionFilter ? regionFilter : "Countries" }
        ]} 
      />

      <main className="main-content-with-sticky-footer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="left" />
          </div>
          
          <div className="flex-1">
            {searchResults ? (
              <div className="space-y-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Search Results</h2>
                  <p className="text-gray-600 mt-2">
                    Found {searchResults.sectors.length + searchResults.industries.length + searchResults.companies.length} results
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  {regionFilter && (
                    <div className="mb-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setRegionFilter('');
                          setLocation('/geography/countries');
                        }}
                        data-testid="button-clear-filter"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        View All Countries
                      </Button>
                    </div>
                  )}

                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {regionFilter ? `${regionFilter} - ` : ''}Explore {filteredCountries?.length || '190+'} Countries Worldwide
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
                        {filteredCountries?.length || '190+'} Countries
                      </span>
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {filteredCountries?.reduce((sum, c) => sum + c.companyCount, 0).toLocaleString() || '7,000+'} Companies
                      </span>
                    </div>
                  </div>
                </div>

                {groupedCountries && Object.keys(groupedCountries).sort().map((regionName) => {
                  const regionData = groupedCountries[regionName];
                  return (
                    <div key={regionName} className="mb-12">
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">{regionData.continentName}</div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <MapPin className="h-6 w-6 text-purple-600" />
                          {regionName}
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {regionData.countries.map((country) => (
                          <Card
                            key={country.id}
                            className="hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-purple-400 cursor-pointer"
                            onClick={() => handleCountryClick(country.name)}
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
      </main>

      <footer className="sticky-footer mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
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
