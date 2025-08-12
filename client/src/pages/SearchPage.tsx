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
                <div className="flex-1">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Breadcrumbs 
        items={[
          { label: "Home", onClick: handleBackToHome },
          { label: "Advanced Search" }
        ]} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Business Search</h2>
          <p className="text-gray-600">
            Search through our comprehensive database of business sectors, industries, and companies worldwide.
          </p>
        </div>

        {/* Search Interface */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="search-input">Search Term</Label>
                <div className="flex gap-4">
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="Enter company name, industry, or business sector..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleSearch()} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>

              {searchResults && (
                <div className="space-y-2">
                  <Label htmlFor="category-filter">Filter Results</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category-filter" className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results ({totalResults})</SelectItem>
                      <SelectItem value="sectors">Sectors ({searchResults.sectors.length})</SelectItem>
                      <SelectItem value="industries">Industries ({searchResults.industries.length})</SelectItem>
                      <SelectItem value="companies">Companies ({searchResults.companies.length})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {searchResults && !isLoading && (
          <div className="space-y-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Search Results</h3>
              <p className="text-gray-600 mt-2">
                Found {totalResults} results {searchTerm && `for "${searchTerm}"`}
              </p>
            </div>

            {filteredResults?.sectors.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Business Sectors ({filteredResults.sectors.length})
                </h4>
                <BusinessGrid 
                  items={filteredResults.sectors} 
                  type="sector" 
                  onItemClick={(sector) => setLocation(`/sector/${encodeURIComponent(sector.name)}`)} 
                />
              </div>
            )}

            {filteredResults?.industries.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Industries ({filteredResults.industries.length})
                </h4>
                <BusinessGrid 
                  items={filteredResults.industries} 
                  type="industry" 
                  onItemClick={(industry) => setLocation(`/industry/${encodeURIComponent(industry.name)}`)} 
                />
              </div>
            )}

            {filteredResults?.companies.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Companies ({filteredResults.companies.length})
                </h4>
                <BusinessGrid 
                  items={filteredResults.companies} 
                  type="company" 
                  onItemClick={(company) => {
                    if ((company as any).websiteUrl) {
                      window.open((company as any).websiteUrl, '_blank');
                    }
                  }} 
                />
              </div>
            )}

            {totalResults === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any matches for "{searchTerm}". Try different keywords or browse our directories.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => setLocation('/sectors')} variant="outline">
                    Browse Sectors
                  </Button>
                  <Button onClick={() => setLocation('/industries')} variant="outline">
                    Browse Industries
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {!searchResults && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Business Search</h3>
            <p className="text-gray-600 mb-4">
              Enter a search term above to find companies, industries, and business sectors in our global directory.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => setLocation('/sectors')} variant="outline">
                Browse Sectors
              </Button>
              <Button onClick={() => setLocation('/industries')} variant="outline">
                Browse Industries
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Professional business search across 421 pages.</p>
            <p className="mt-2 text-sm">Search through 20 sectors, 400+ industries, and 8,000+ companies worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}