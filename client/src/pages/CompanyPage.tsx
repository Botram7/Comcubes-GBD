import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEOHead, createBusinessDirectoryStructuredData, BRAND_KEYWORDS } from "@/components/SEOHead";
import { AlertCircle, Building2 } from "lucide-react";

import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { BannerAd } from "@/components/BannerAd";
import type { Company, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";

export default function CompanyPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top when component mounts or page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const { data: companyData, isLoading, error } = useQuery({
    queryKey: [`/api/companies?page=${currentPage}&limit=20`],
    staleTime: 30000,
  });

  const handleCompanyClick = (company: Company) => {
    if (company.websiteUrl) {
      window.open(company.websiteUrl, '_blank');
    }
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white  shadow-sm border-b border-gray-200  sticky top-0 z-50">
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
                <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/search')}
                    className="flex items-center gap-2 flex-shrink-0"
                  >
                    <Building2 className="h-4 w-4" />
                    Advanced Search
                  </Button>
                  <span className="text-sm text-gray-600">Loading...</span>
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
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 ">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white  shadow-sm border-b border-gray-200  sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mr-4" onClick={() => setLocation('/')}>
                  <div className="w-16 h-16 mr-3 flex items-center justify-center">
                    <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
                  </div>
                </div>
                <div className="flex-1 mr-4">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
                <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/search')}
                    className="flex items-center gap-2 flex-shrink-0"
                  >
                    <Building2 className="h-4 w-4" />
                    Advanced Search
                  </Button>
                  <span className="text-sm text-gray-600">Error</span>
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
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">Error Loading Companies</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Failed to load company data. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(((companyData as any)?.total || 0) / 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateDisclosureBanner />
      <SEOHead 
        title={`Browse ${((companyData as any)?.total || 7400)} Global Companies Directory | COMCUBES`}
        description={`Explore ${((companyData as any)?.total || 7400)} companies from around the world across 20 business sectors and 400+ industries on COMCUBES (Comcube). Search and discover businesses with direct website access, company profiles, and professional opportunities in our comprehensive global directory.`}
        keywords={[
          ...BRAND_KEYWORDS.slice(0, 5),
          "companies directory", "global companies", "business listings", "company search",
          "worldwide businesses", "corporate directory", "international companies",
          "business database", "company finder", "enterprise directory", "company profiles",
          "business contacts", "global business directory", "professional networking",
          "browse companies", "company listings", "business search"
        ]}
        canonicalUrl="https://comcubes.com/companies"
        ogTitle="Global Companies Directory | COMCUBES"
        ogDescription={`Browse ${((companyData as any)?.total || 7400)} companies across 400+ industries worldwide.`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Global Companies Directory - COMCUBES",
          "description": `Comprehensive directory of ${((companyData as any)?.total || 7400)} companies worldwide across all business sectors and industries on COMCUBES business directory`,
          "url": "https://comcubes.com/companies",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": ((companyData as any)?.companies || []).slice(0, 20).map((company: any, index: number) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Organization",
                "name": company.name,
                "url": company.websiteUrl,
                "description": `${company.name} - Company in ${company.industryName} industry`
              }
            })) || []
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://comcubes.com/" },
              { "@type": "ListItem", "position": 2, "name": "All Companies", "item": "https://comcubes.com/companies" }
            ]
          }
        }}
      />
      <header className="bg-white  shadow-sm border-b border-gray-200  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Main header row */}
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mr-1 sm:mr-4" onClick={() => setLocation('/')}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mr-1 sm:mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
              </div>
              
              <div className="flex-1 mr-2 sm:mr-4">
                <SearchBar onSearchResults={handleSearchResults} />
              </div>

              {/* Keep Advanced Search and page info for desktop only */}
              <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of 421
                </span>
              </div>
            </div>
            
            {/* Mobile Advanced Search button beneath logo and search */}
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
          { label: "Home", onClick: () => setLocation("/") },
          { label: "Business Sectors", onClick: () => setLocation("/sectors") },
          { label: "All Companies" }
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
              <h2 className="text-3xl font-bold text-gray-900 ">Search Results</h2>
              <p className="text-gray-600  mt-2">
                Found {searchResults.sectors.length + searchResults.industries.length + searchResults.companies.length} results
              </p>
            </div>

            {searchResults.sectors.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900  mb-4">Sectors</h3>
                <BusinessGrid 
                  items={searchResults.sectors} 
                  type="sector" 
                  onItemClick={(sector) => setLocation(`/sector/${encodeURIComponent(sector.name)}`)} 
                />
              </div>
            )}

            {searchResults.industries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900  mb-4">Industries</h3>
                <BusinessGrid 
                  items={searchResults.industries} 
                  type="industry" 
                  onItemClick={(industry) => setLocation(`/industry/${encodeURIComponent(industry.name)}`)} 
                />
              </div>
            )}

            {searchResults.companies.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900  mb-4">Companies</h3>
                <BusinessGrid 
                  items={searchResults.companies} 
                  type="company" 
                  onItemClick={(company) => handleCompanyClick(company as Company)} 
                  showClaimButtons={true}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Global Companies Directory</h1>
              <p className="text-gray-600 mt-2">
                Explore {(companyData as any)?.total || 7400} leading companies spanning 20 business sectors and 400+ specialized industries worldwide. Each company listing includes direct website access, industry classification, and professional business details. Connect with businesses across technology, healthcare, finance, manufacturing, energy, and emerging sectors globally.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <span>🌍 {(companyData as any)?.total || 7400} Global Companies</span>
                <span>🏭 400+ Specialized Industries</span>
                <span>📊 20 Business Sectors</span>
                <span>📄 Page {currentPage} of {totalPages}</span>
              </div>
            </div>

            <BusinessGrid items={(companyData as any)?.companies || []} type="company" onItemClick={(company) => handleCompanyClick(company as Company)} showClaimButtons={true} />

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
          </div>
          
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="right" />
          </div>
        </div>
      </main>

      <footer className="bg-white  border-t border-gray-200  mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 ">
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
