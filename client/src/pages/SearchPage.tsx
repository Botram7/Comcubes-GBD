import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessGrid } from "@/components/BusinessGrid";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEOHead, generateDirectoryStructuredData } from "@/components/SEOHead";
import { 
  Search, 
  Filter, 
  Building2, 
  ArrowLeft,
  Globe,
  Target
} from "lucide-react";

import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";
import type { SearchResults } from "@/lib/types";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const filteredResults = searchResults ? {
    sectors: selectedCategory === 'all' || selectedCategory === 'sectors' ? searchResults.sectors : [],
    industries: selectedCategory === 'all' || selectedCategory === 'industries' ? searchResults.industries : [],
    companies: selectedCategory === 'all' || selectedCategory === 'companies' ? searchResults.companies : []
  } : null;

  const totalResults = filteredResults 
    ? filteredResults.sectors.length + filteredResults.industries.length + filteredResults.companies.length 
    : 0;

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
        jsonLd={filteredResults ? generateDirectoryStructuredData('companies', [
          ...filteredResults.sectors,
          ...filteredResults.industries, 
          ...filteredResults.companies
        ]) : undefined}
        canonicalUrl={`${window.location.origin}/search${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ''}`}
      />
      
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
            </div>
            
            <div className="flex-1 flex justify-center mx-2 md:mx-8">
              <div className="flex items-center space-x-2 md:space-x-4 max-w-2xl w-full">
                <SearchBar onSearchResults={handleSearchResults} />
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Home</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Advanced Search', href: '' }
            ]} 
          />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'IBM Plex Serif' }}>
            Advanced Business Search
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Search through our comprehensive database of business sectors, industries, and companies worldwide.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-term" className="text-base font-medium">Search Term</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    id="search-term"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter company name, industry, or business sector..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    onClick={() => handleSearch()}
                    disabled={isLoading || !searchTerm.trim()}
                    className="px-6"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium text-gray-700">Filter by category:</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="sectors">Sectors Only</SelectItem>
                    <SelectItem value="industries">Industries Only</SelectItem>
                    <SelectItem value="companies">Companies Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Searching...</span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results {totalResults > 0 && `(${totalResults} results)`}
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  Category: {selectedCategory === 'all' ? 'All' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </span>
              </div>
            </div>

            {totalResults === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search terms or browse our directory by category.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => setLocation('/')}>
                      Browse Sectors
                    </Button>
                    <Button variant="outline" onClick={() => setLocation('/industries')}>
                      Browse Industries
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Sectors Results */}
                {filteredResults && filteredResults.sectors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Business Sectors ({filteredResults.sectors.length})
                    </h3>
                    <BusinessGrid
                      items={filteredResults.sectors.map(sector => ({
                        id: sector.id,
                        name: sector.name,
                        href: `/sector/${encodeURIComponent(sector.name)}`,
                        type: 'sector' as const,
                        description: `Explore companies in ${sector.name}`,
                        gradient: 'from-blue-500 to-blue-700'
                      }))}
                    />
                  </div>
                )}

                {/* Industries Results */}
                {filteredResults && filteredResults.industries.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                      Industries ({filteredResults.industries.length})
                    </h3>
                    <BusinessGrid
                      items={filteredResults.industries.map(industry => ({
                        id: industry.id,
                        name: industry.name,
                        href: `/industry/${encodeURIComponent(industry.name)}`,
                        type: 'industry' as const,
                        description: industry.sectorName,
                        gradient: 'from-green-500 to-green-700'
                      }))}
                    />
                  </div>
                )}

                {/* Companies Results */}
                {filteredResults && filteredResults.companies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-purple-600" />
                      Companies ({filteredResults.companies.length})
                    </h3>
                    <BusinessGrid
                      items={filteredResults.companies.map(company => ({
                        id: company.id,
                        name: company.name,
                        href: `/company/${company.id}`,
                        type: 'company' as const,
                        description: `${company.industryName} • ${company.sectorName}`,
                        gradient: 'from-purple-500 to-purple-700',
                        websiteUrl: company.websiteUrl
                      }))}
                    />
                  </div>
                )}

                {/* Global Search Integration */}
                <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Expand Your Search Globally
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Search beyond our directory to find businesses worldwide using Google Search.
                      </p>
                      <Button
                        onClick={() => {
                          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' business company')}`;
                          window.open(searchUrl, '_blank');
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!searchTerm.trim()}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Search on Google
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Powered by Google Search
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Initial State - No Search Yet */}
        {!isLoading && !searchResults && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Business Search</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Enter a search term above to find companies, industries, and business sectors in our global directory.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Browse Sectors
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/industries')}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Browse Industries
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            © 2024 COMCUBES Global Business Directory. Professional business search across 421 pages.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Search through 20 sectors, 400+ industries, and 8,000+ companies worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}