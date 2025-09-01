import { useState } from 'react';
import { Search, TrendingUp, Globe, Building2, Users, ArrowLeft } from 'lucide-react';
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";
import { SEOAnalyzer } from "@/components/SEOAnalyzer";

import { Link, useLocation } from 'wouter';
import { EnhancedSearch } from '@/components/EnhancedSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/SearchBar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BannerAd } from '@/components/BannerAd';
import { getActiveBannerImages, getBannerClickUrl } from '@/config/bannerAds';
import { BusinessGrid } from '@/components/BusinessGrid';
import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";
import type { SearchResults } from "@/lib/types";

// Popular search suggestions that link to relevant sectors/industries
const POPULAR_SEARCHES = [
  { name: 'Technology', type: 'sector' },
  { name: 'Banking and Financial Services', type: 'sector' },
  { name: 'Healthcare and Pharmaceuticals', type: 'sector' },
  { name: 'Manufacturing', type: 'sector' },
  { name: 'Retail', type: 'sector' },
  { name: 'Energy and Utilities', type: 'sector' },
  { name: 'Software Development', type: 'industry' },
  { name: 'Investment Banking', type: 'industry' },
  { name: 'Insurance', type: 'sector' },
  { name: 'Consulting Services', type: 'industry' }
];

const TRENDING_SEARCHES = [
  { name: 'Artificial Intelligence', type: 'industry' },
  { name: 'Renewable Energy', type: 'industry' },
  { name: 'Fintech', type: 'industry' },
  { name: 'E-commerce', type: 'industry' },
  { name: 'Cloud Computing', type: 'industry' },
  { name: 'Biotechnology', type: 'industry' },
  { name: 'Cryptocurrency', type: 'industry' },
  { name: 'Green Technology', type: 'industry' }
];

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  const handleNavigateToSector = (sectorName: string) => {
    setLocation(`/sector/${encodeURIComponent(sectorName)}`);
  };

  const handleNavigateToIndustry = (industryName: string) => {
    setLocation(`/industry/${encodeURIComponent(industryName)}`);
  };

  const handlePopularSearchClick = (item: { name: string; type: string }) => {
    if (item.type === 'sector') {
      handleNavigateToSector(item.name);
    } else if (item.type === 'industry') {
      handleNavigateToIndustry(item.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50  font-inter ">
      <SEOHead 
        title="Advanced Business Search | Global Company & Industry Search | COMCUBES"
        description="Search 7,400+ companies across 400+ industries with advanced filters. Find businesses by location, size, sector, and more with our global search technology."
        keywords={[
          "business search", "company search", "advanced search", "global business search",
          "company finder", "business finder", "industry search", "company database search",
          "business directory search", "enterprise search", "B2B search", "worldwide business search"
        ]}
        canonicalUrl={`${window.location.origin}/search`}
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: `${window.location.origin}/` },
          { name: "Advanced Search", url: `${window.location.origin}/search` }
        ])}
      />
      {/* Header - Consistent with other pages */}
      <header className="bg-white  shadow-sm border-b border-gray-200  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-primary " style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
            </div>
            <SearchBar onSearchResults={handleSearchResults} />
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleBackToHome}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Advanced Search', href: '/search' }
        ]} 
      />

      {/* Three-column layout with sidebar banner ads */}
      <div className="flex gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Left Sidebar - Advertisement Banner - 160x600 */}
        <div className="hidden lg:block flex-shrink-0">
          <BannerAd 
            className="sticky top-24" 
            images={getActiveBannerImages('left')}
            clickUrl={getBannerClickUrl('left')}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {searchResults ? (
            /* Search Results Display */
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
                    onItemClick={(company) => {
                      if ((company as any).websiteUrl) {
                        window.open((company as any).websiteUrl, '_blank');
                      }
                    }} 
                    showClaimButtons={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900  mb-4">
                  Advanced Business Search
                </h1>
                <p className="text-xl text-gray-600  mb-8 max-w-3xl mx-auto">
                  Discover companies, industries, and business sectors worldwide with our enhanced search capabilities. Search locally across 7,400+ companies or globally via Google Custom Search.
                </p>
                
                {/* Enhanced Search Component */}
                <EnhancedSearch />
              </div>

              {/* Quick Search Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Popular Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Popular Searches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((search) => (
                    <Badge
                      key={search.name}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      onClick={() => handlePopularSearchClick(search)}
                    >
                      {search.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  <span>Trending Topics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((search) => (
                    <Badge
                      key={search.name}
                      variant="outline"
                      className="cursor-pointer hover:bg-green-100 hover:text-green-700 hover:border-green-300 transition-colors"
                      onClick={() => handlePopularSearchClick(search)}
                    >
                      {search.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Global Discovery</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Access our comprehensive database of 7,400+ companies across 20 sectors and 400+ industries, plus discover businesses worldwide via Google Custom Search.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Local Companies:</span>
                    <Badge variant="secondary">7,400+</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Industries:</span>
                    <Badge variant="secondary">400+</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Business Sectors:</span>
                    <Badge variant="secondary">20</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Global Search:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-purple-600" />
                  <span>Advanced Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Filter by geographic regions, company sizes, industries, and more to find exactly what you're looking for.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Geographic regions (North America, Europe, Asia Pacific)</li>
                  <li>• Company size filtering</li>
                  <li>• Industry specialization</li>
                  <li>• Search scope (Local vs Global)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  <span>Worldwide Coverage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Powered by Google Custom Search API for authentic global business discovery with proper attribution.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => setLocation('/sectors')}
                >
                  <Building2 className="h-6 w-6" />
                  <span>Business Sectors</span>
                  <Badge variant="secondary">20 sectors</Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => setLocation('/industries')}
                >
                  <Globe className="h-6 w-6" />
                  <span>Industries</span>
                  <Badge variant="secondary">400+ industries</Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => setLocation('/companies')}
                >
                  <Users className="h-6 w-6" />
                  <span>All Companies</span>
                  <Badge variant="secondary">7,400+ companies</Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  disabled
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Analytics</span>
                  <Badge variant="outline">Coming Soon</Badge>
                </Button>
              </div>
            </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right Sidebar - Advertisement Banner - 160x600 */}
        <div className="hidden lg:block flex-shrink-0">
          <BannerAd 
            className="sticky top-24" 
            images={getActiveBannerImages('right')}
            clickUrl={getBannerClickUrl('right')}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring 20 sectors, 400+ industries, and 7,400+ companies worldwide with global search capabilities.</p>
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
      <SEOAnalyzer />
    </div>
  );
}