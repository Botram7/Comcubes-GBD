import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchBar } from "@/components/SearchBar";
import { SEOHead, generateDirectoryStructuredData } from "@/components/SEOHead";
import { 
  Search, 
  Filter,
  ArrowLeft,
  Globe,
  Target,
  Building2,
  TrendingUp
} from "lucide-react";

import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";
import type { SearchResults } from "@/lib/types";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchTerm(query);
      handleSearch(query);
    }
  }, []);

  const handleSearch = async (query?: string) => {
    const searchQuery = query || searchTerm;
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        
        // Update URL with search query
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('q', searchQuery);
        window.history.replaceState({}, '', newUrl.toString());
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${searchTerm ? `Search Results for "${searchTerm}"` : 'Advanced Business Search'} | COMCUBES Global Directory`}
        description={`${searchTerm ? `Find businesses, industries, and sectors matching "${searchTerm}"` : 'Search through thousands of companies, industries, and business sectors'} in the COMCUBES Global Business Directory.`}
        keywords={[
          'business search',
          'company search',
          'industry search',
          'sector search',
          'business directory search',
          'advanced search',
          'global business finder',
          'company finder',
          'business intelligence search',
          'corporate search',
          ...(searchTerm ? [searchTerm] : [])
        ]}
        ogType="website"
        canonicalUrl={`${window.location.origin}/search${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ''}`}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
            </div>
            
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar onSearchResults={handleSearchResults} />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <span onClick={() => setLocation('/')} className="cursor-pointer hover:text-blue-600">Home</span>
          <span className="mx-2">›</span>
          <span>Advanced Search</span>
        </nav>

        {/* Top Section with Advertisement Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Boost Your Business */}
          <Card className="bg-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'IBM Plex Serif' }}>
                Boost Your Business
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Enhanced visibility
              </p>
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setLocation('/advertise')}
              >
                Advertise Here
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Business Search - Center */}
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'IBM Plex Serif' }}>
                Advanced Business Search
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Discover companies, industries, and business sectors worldwide with our enhanced search capabilities. Search locally across 8,000+ companies or globally via Google Custom Search.
              </p>
              <div className="flex items-center justify-center">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search companies, industries, or sectors worldwide..."
                  className="mr-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={() => handleSearch()} disabled={isLoading || !searchTerm.trim()}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Placement */}
          <Card className="bg-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'IBM Plex Serif' }}>
                Premium Placement
              </h3>
              <p className="text-purple-100 text-sm mb-4">
                Featured company listing
              </p>
              <Button 
                variant="secondary" 
                className="bg-white text-purple-600 hover:bg-purple-50"
                onClick={() => setLocation('/advertise')}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search Features */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Search Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-blue-600" />
                <strong>Local:</strong> Search sectors, 400+ industries, and 8,000+ companies
              </li>
              <li className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-green-600" />
                <strong>Global:</strong> Discover businesses worldwide via Google Custom Search
              </li>
              <li className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-purple-600" />
                <strong>Filter:</strong> By geography, industry, and company size
              </li>
              <li className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-orange-600" />
                <strong>Advanced:</strong> Precise keyword matching and comprehensive results
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              Global search powered by Google Custom Search with 10M+ global additions
            </p>
          </CardContent>
        </Card>

        {/* Search Results Section */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Searching...</span>
            </div>
          </div>
        )}

        {!isLoading && searchResults && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
              <div className="space-y-4">
                {searchResults.sectors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sectors ({searchResults.sectors.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {searchResults.sectors.map((sector) => (
                        <div key={sector.id} className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer" onClick={() => setLocation(`/sector/${encodeURIComponent(sector.name)}`)}>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{sector.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchResults.industries.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Industries ({searchResults.industries.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {searchResults.industries.map((industry) => (
                        <div key={industry.id} className="p-3 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer" onClick={() => setLocation(`/industry/${encodeURIComponent(industry.name)}`)}>
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{industry.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{industry.sectorName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchResults.companies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Companies ({searchResults.companies.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {searchResults.companies.map((company) => (
                        <div key={company.id} className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer" onClick={() => setLocation(`/company/${company.id}`)}>
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{company.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{company.industryName} • {company.sectorName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Popular Searches */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Popular Searches
              </h3>
              <div className="space-y-3">
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Technology'); handleSearch('Technology'); }}>
                  <span className="text-sm font-medium">Technology</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Banking and Financial Services'); handleSearch('Banking and Financial Services'); }}>
                  <span className="text-sm font-medium">Banking and Financial Services</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Healthcare and Pharmaceuticals'); handleSearch('Healthcare and Pharmaceuticals'); }}>
                  <span className="text-sm font-medium">Healthcare and Pharmaceuticals</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Retail'); handleSearch('Retail'); }}>
                  <span className="text-sm font-medium">Retail</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Energy and Utilities'); handleSearch('Energy and Utilities'); }}>
                  <span className="text-sm font-medium">Energy and Utilities</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Software Development'); handleSearch('Software Development'); }}>
                  <span className="text-sm font-medium">Software Development</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Investment Banking'); handleSearch('Investment Banking'); }}>
                  <span className="text-sm font-medium">Investment Banking</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Consulting Services'); handleSearch('Consulting Services'); }}>
                  <span className="text-sm font-medium">Consulting Services</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Artificial Intelligence'); handleSearch('Artificial Intelligence'); }}>
                  <span className="text-sm font-medium">Artificial Intelligence</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Sustainable Energy'); handleSearch('Sustainable Energy'); }}>
                  <span className="text-sm font-medium">Sustainable Energy</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('E-commerce'); handleSearch('E-commerce'); }}>
                  <span className="text-sm font-medium">E-commerce</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Cloud Computing'); handleSearch('Cloud Computing'); }}>
                  <span className="text-sm font-medium">Cloud Computing</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Cryptocurrency'); handleSearch('Cryptocurrency'); }}>
                  <span className="text-sm font-medium">Cryptocurrency</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Biotechnology'); handleSearch('Biotechnology'); }}>
                  <span className="text-sm font-medium">Biotechnology</span>
                </div>
                <div className="cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm('Green Technology'); handleSearch('Green Technology'); }}>
                  <span className="text-sm font-medium">Green Technology</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Three Column Feature Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Global Discovery */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Discovery</h3>
              <p className="text-sm text-gray-600 mb-4">
                Access our comprehensive database of 8,000+ companies across 400+ industries, plus discover worldwide via Google Custom Search.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Local Companies</span>
                  <span className="font-medium">8,000+</span>
                </div>
                <div className="flex justify-between">
                  <span>Industries</span>
                  <span className="font-medium">400+</span>
                </div>
                <div className="flex justify-between">
                  <span>Business Sectors</span>
                  <span className="font-medium">20</span>
                </div>
                <div className="flex justify-between">
                  <span>Global Search</span>
                  <span className="font-medium">Unlimited</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Filters */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
              <p className="text-sm text-gray-600 mb-4">
                Filter by geography, industry sectors, company size, and more to find exactly what you're looking for.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Industry</li>
                <li>• Company Size</li>
                <li>• Geography</li>
                <li>• Rating</li>
                <li>• Revenue</li>
                <li>• Founded Year</li>
                <li>• Employee Count</li>
                <li>• Search Across Global Results</li>
              </ul>
            </CardContent>
          </Card>

          {/* Worldwide Coverage */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Worldwide Coverage</h3>
              <p className="text-sm text-gray-600 mb-4">
                Powered by Google Custom Search, discover authentic global business worldwide with proven accuracy.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Discover With Proven Accuracy</div>
                <div>• Authentic Websites</div>
                <div>• Legitimate Businesses Only</div>
                <div>• Real-Time Updates</div>
                <div>• Comprehensive Coverage</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => setLocation('/')} className="flex items-center justify-center">
                <Target className="h-4 w-4 mr-2" />
                Business Sectors
              </Button>
              <Button variant="outline" onClick={() => setLocation('/industries')} className="flex items-center justify-center">
                <Building2 className="h-4 w-4 mr-2" />
                Industries
              </Button>
              <Button variant="outline" onClick={() => setLocation('/companies')} className="flex items-center justify-center">
                <Globe className="h-4 w-4 mr-2" />
                All Companies
              </Button>
              <Button variant="outline" onClick={() => setLocation('/advertise')} className="flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Advertise
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            © 2024 COMCUBES Global Business Directory. Professional business search across 421 pages.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Searching 20 sectors, 400+ industries, and 8,000+ companies worldwide via global search capabilities.
          </p>
        </div>
      </footer>
    </div>
  );
}