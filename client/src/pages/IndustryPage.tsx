import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BusinessGrid, BusinessGridSkeleton } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, Globe, Loader2 } from "lucide-react";
import { SEOHead, createBreadcrumbStructuredData, createItemListStructuredData, BRAND_KEYWORDS } from "@/components/SEOHead";

import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { BannerAd } from "@/components/BannerAd";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { Company, SearchResults } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

export default function IndustryPage() {
  const { industryName } = useParams();
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allLoadedCompanies, setAllLoadedCompanies] = useState<Company[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const decodedIndustryName = decodeURIComponent(industryName || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [industryName]);

  useEffect(() => {
    setCurrentPage(1);
    setAllLoadedCompanies([]);
  }, [industryName]);

  const { data: paginatedData, isLoading, error } = useQuery<{ companies: Company[]; total: number; page: number; totalPages: number }>({
    queryKey: ['/api/industries', decodedIndustryName, 'companies', currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      const res = await fetch(`/api/industries/${encodeURIComponent(decodedIndustryName)}/companies?${params}`);
      if (!res.ok) throw new Error('Failed to load companies');
      return res.json();
    },
    enabled: !!industryName,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (paginatedData?.companies) {
      setIsLoadingMore(false);
      if (currentPage === 1) {
        setAllLoadedCompanies(paginatedData.companies);
      } else {
        setAllLoadedCompanies(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newCompanies = paginatedData.companies.filter(c => !existingIds.has(c.id));
          return [...prev, ...newCompanies];
        });
      }
    }
  }, [paginatedData, currentPage]);

  const companies = allLoadedCompanies;
  const totalCompanies = paginatedData?.total ?? 0;
  const totalPages = paginatedData?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingMore]);

  const handleCompanyClick = (item: any) => {
    if (item.websiteUrl) {
      window.open(item.websiteUrl, '_blank');
    }
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  // Get sector name from first company for breadcrumbs
  const sectorName = Array.isArray(companies) && companies.length > 0 ? companies[0]?.sectorName || "" : "";

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <BusinessGridSkeleton count={ITEMS_PER_PAGE} />
        </div>
      </div>
    );
  }

  if (error || totalCompanies === 0) {
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
                <h1 className="text-2xl font-bold text-gray-900">Industry Not Found</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                The requested industry could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <AffiliateDisclosureBanner />
      <SEOHead 
        title={`${decodedIndustryName} Companies | Top ${decodedIndustryName} Directory | COMCUBES`}
        description={`Find top companies in ${decodedIndustryName} industry. Browse ${totalCompanies} leading ${decodedIndustryName} businesses with direct access to company websites and contact information on COMCUBES (Comcube) business directory.`}
        keywords={[
          ...BRAND_KEYWORDS.slice(0, 5),
          `${decodedIndustryName.toLowerCase()} companies`, `${decodedIndustryName.toLowerCase()} industry`, `${decodedIndustryName.toLowerCase()} business`,
          `${decodedIndustryName.toLowerCase()} directory`, `${decodedIndustryName.toLowerCase()} firms`, `top ${decodedIndustryName.toLowerCase()} companies`,
          `leading ${decodedIndustryName.toLowerCase()} businesses`, `find ${decodedIndustryName.toLowerCase()} companies`,
          "industry companies", "business directory", "company listings", "industry leaders", "top companies"
        ]}
        canonicalUrl={`https://comcubes.com/industry/${encodeURIComponent(decodedIndustryName)}`}
        ogTitle={`${decodedIndustryName} Companies | COMCUBES`}
        ogDescription={`Browse ${totalCompanies} leading companies in the ${decodedIndustryName} industry. Direct access to websites and business information.`}
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: "https://comcubes.com/" },
          { name: "Business Sectors", url: "https://comcubes.com/sectors" },
          ...(sectorName ? [{ name: sectorName, url: `https://comcubes.com/sector/${encodeURIComponent(sectorName)}` }] : []),
          { name: decodedIndustryName, url: `https://comcubes.com/industry/${encodeURIComponent(decodedIndustryName)}` }
        ])}
        additionalStructuredData={[
          createItemListStructuredData(
            (Array.isArray(companies) ? companies : []).slice(0, 20).map((comp: any) => ({
              name: comp.name,
              url: comp.websiteUrl || `https://comcubes.com/company/${comp.id}`,
              description: `${comp.name} - ${decodedIndustryName} company`
            })),
            `Companies in ${decodedIndustryName}`,
            `https://comcubes.com/industry/${encodeURIComponent(decodedIndustryName)}`
          )
        ]}
      />
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Main header row */}
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
              <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/geography')}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Globe className="h-4 w-4" />
                  Browse by Location
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
                <span className="text-sm text-gray-600">Companies in {decodedIndustryName}</span>
              </div>
            </div>
            
            {/* Mobile navigation buttons beneath logo and search */}
            <div className="sm:hidden mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/geography')}
                className="flex items-center gap-2 flex-1 justify-center"
              >
                <Globe className="h-4 w-4" />
                Location
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
          { label: "Home", onClick: () => setLocation("/") },
          { label: "Business Sectors", onClick: () => setLocation("/sectors") },
          { label: sectorName, onClick: () => setLocation(`/sector/${encodeURIComponent(sectorName)}`) },
          { label: decodedIndustryName }
        ]} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            {searchResults.sectors.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Sectors</h3>
                <BusinessGrid 
                  items={searchResults.sectors} 
                  type="sector" 
                  onItemClick={(sector) => setLocation(`/sector/${encodeURIComponent(sector.name)}`)} 
                />
              </div>
            )}

            {searchResults.industries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Industries</h3>
                <BusinessGrid 
                  items={searchResults.industries} 
                  type="industry" 
                  onItemClick={(industry) => setLocation(`/industry/${encodeURIComponent(industry.name)}`)} 
                />
              </div>
            )}

            {searchResults.companies.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Companies</h3>
                <BusinessGrid 
                  items={searchResults.companies} 
                  type="company" 
                  onItemClick={handleCompanyClick}
                  showClaimButtons={true}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{decodedIndustryName} Industry</h1>
              <p className="text-gray-600 mt-2">
                Discover {totalCompanies} leading companies in the {decodedIndustryName} industry{sectorName ? ` within the ${sectorName} sector` : ''}. Each company listing includes direct website access, industry classification, and professional business details. Connect with industry leaders, emerging companies, and business opportunities in this specialized industry directory.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <span>🏢 {totalCompanies} Companies</span>
                {sectorName && <span>📊 {sectorName} Sector</span>}
                <span>🌍 Global Industry Directory</span>
                <span>🔗 Direct Website Access</span>
              </div>
              
              {/* Quick Navigation Links */}
              <div className="mt-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xs sm:text-sm font-semibold text-green-900 mb-3">Navigate Business Directory</h3>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {sectorName && (
                    <button 
                      onClick={() => { window.scrollTo(0, 0); setLocation(`/sector/${encodeURIComponent(sectorName)}`); }}
                      className="text-xs px-3 py-1 bg-white border border-green-300 rounded-full hover:bg-green-100 transition-colors"
                    >
                      {sectorName} Sector
                    </button>
                  )}
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/industries'); }}
                    className="text-xs px-3 py-1 bg-white border border-green-300 rounded-full hover:bg-green-100 transition-colors"
                  >
                    All Industries
                  </button>
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/companies'); }}
                    className="text-xs px-3 py-1 bg-white border border-green-300 rounded-full hover:bg-green-100 transition-colors"
                  >
                    All Companies
                  </button>
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/sectors'); }}
                    className="text-xs px-3 py-1 bg-white border border-green-300 rounded-full hover:bg-green-100 transition-colors"
                  >
                    All Sectors
                  </button>
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/search'); }}
                    className="text-xs px-3 py-1 bg-white border border-green-300 rounded-full hover:bg-green-100 transition-colors"
                  >
                    Advanced Search
                  </button>
                </div>
              </div>
            </div>

            <BusinessGrid 
              items={companies} 
              type="company" 
              onItemClick={handleCompanyClick} 
              showClaimButtons={true}
              currentSector={sectorName}
              currentIndustry={decodedIndustryName}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onViewMore={handleLoadMore}
              totalCount={totalCompanies}
            />

            {!hasMore && companies.length > ITEMS_PER_PAGE && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  All {totalCompanies} companies loaded
                </p>
              </div>
            )}
            
            {/* Related Industries & Business Opportunities */}
            {companies.length > 0 && (
              <div className="mt-12 p-4 sm:p-6 bg-gray-50 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Explore Related Business Opportunities</h3>
                <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                  Expand your business network by exploring related industries and sectors. Each area offers unique companies and professional opportunities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Popular Industries</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => { window.scrollTo(0, 0); setLocation('/industry/Software Development'); }}
                        className="p-2 bg-white rounded border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all text-left text-xs"
                      >
                        Software Development
                      </button>
                      <button 
                        onClick={() => { window.scrollTo(0, 0); setLocation('/industry/Digital Marketing'); }}
                        className="p-2 bg-white rounded border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all text-left text-xs"
                      >
                        Digital Marketing
                      </button>
                      <button 
                        onClick={() => { window.scrollTo(0, 0); setLocation('/industry/Financial Technology'); }}
                        className="p-2 bg-white rounded border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all text-left text-xs"
                      >
                        Financial Technology
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Business Tools</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => { window.scrollTo(0, 0); setLocation('/list-company'); }}
                        className="p-2 bg-white rounded border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all text-left text-xs"
                      >
                        List Your Company
                      </button>
                      <button 
                        onClick={() => { window.scrollTo(0, 0); setLocation('/search'); }}
                        className="p-2 bg-white rounded border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all text-left text-xs"
                      >
                        Find Business Partners
                      </button>
                      <button 
                        onClick={() => { window.scrollTo(0, 0); setLocation('/contact'); }}
                        className="p-2 bg-white rounded border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all text-left text-xs"
                      >
                        Business Inquiries
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => { window.scrollTo(0, 0); setLocation('/industries'); }}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    Browse All 400+ Industries →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
          </div>
          
          <div className="hidden lg:block flex-shrink-0">
            <BannerAd className="sticky top-24" position="right" />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
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
      
      {/* SEO Analyzer Component */}
    </div>
  );
}
