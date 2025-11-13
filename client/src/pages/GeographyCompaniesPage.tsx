import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BannerAd } from "@/components/BannerAd";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Globe2, Building2, ArrowLeft, Briefcase, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import type { SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

interface CompanyLocation {
  id: number;
  name: string;
  industryName: string;
  countryName: string;
  regionName: string;
  websiteUrl?: string;
}

interface CompaniesData {
  companies: CompanyLocation[];
}

export default function GeographyCompaniesPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, error } = useQuery<CompaniesData>({
    queryKey: ["/api/geography/companies"],
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
    { label: "Companies" },
  ];

  const structuredDataItems = [
    { name: "Home", url: "/" },
    { name: "Geography", url: "/geography" },
    { name: "Companies", url: "/geography/companies" },
  ];

  const breadcrumbStructuredData = createBreadcrumbStructuredData(structuredDataItems);

  const groupedCompanies = data?.companies.reduce((acc, company) => {
    const key = `${company.countryName}|${company.regionName}`;
    if (!acc[key]) {
      acc[key] = {
        countryName: company.countryName,
        regionName: company.regionName,
        companies: []
      };
    }
    acc[key].companies.push(company);
    return acc;
  }, {} as Record<string, { countryName: string; regionName: string; companies: CompanyLocation[] }>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading companies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error Loading Companies</p>
            <p className="text-gray-600">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Global Companies by Geography - COMCUBES Directory"
        description={`Browse ${data?.companies.length || '7,000+'} companies organized by country and region. Find businesses worldwide with detailed geographic locations and industry classifications.`}
        canonicalUrl="/geography/companies"
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
                  Back to Companies
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
                    Explore {data?.companies.length.toLocaleString() || '7,000+'} Companies by Location
                  </h1>

                  <p className="text-lg text-gray-700 mb-6">
                    Browse companies organized by their geographic location. Each company listing includes the business name, industry classification, and country, 
                    grouped by regions for easy navigation and discovery.
                  </p>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 mb-8">
                    <h3 className="font-semibold text-orange-900 mb-2">Quick Stats</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-orange-700">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {data?.companies.length.toLocaleString() || '7,000+'} Companies
                      </span>
                      <span className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4" />
                        {groupedCompanies ? Object.keys(groupedCompanies).length : '190+'} Countries
                      </span>
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Multiple Industries
                      </span>
                    </div>
                  </div>
                </div>

                <div className="my-8 flex justify-center">
                  <GoogleAdSense 
                    format="responsive"
                    className="w-full max-w-4xl"
                    position="companies-page-in-content"
                  />
                </div>

                {/* Companies Grouped by Country and Region */}
                {groupedCompanies && Object.keys(groupedCompanies).sort((a, b) => {
                  const [countryA] = a.split('|');
                  const [countryB] = b.split('|');
                  return countryA.localeCompare(countryB);
                }).map((key) => {
                  const group = groupedCompanies[key];
                  return (
                    <div key={key} className="mb-12">
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">{group.regionName}</div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <Globe2 className="h-6 w-6 text-orange-600" />
                          {group.countryName}
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {group.companies.map((company) => (
                          <Card
                            key={company.id}
                            className="hover:shadow-md transition-all duration-200 border-t-4 border-t-orange-500 border-x border-b border-gray-200"
                            data-testid={`card-company-${company.id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
                                  {company.name}
                                </h3>
                                {company.websiteUrl && (
                                  <a
                                    href={company.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 text-orange-600 hover:text-orange-700"
                                    data-testid={`link-company-website-${company.id}`}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-3 w-3 text-orange-600 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 line-clamp-1">
                                    {company.industryName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Globe2 className="h-3 w-3 text-orange-600 flex-shrink-0" />
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-100">
                                    {company.countryName}
                                  </Badge>
                                </div>
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
