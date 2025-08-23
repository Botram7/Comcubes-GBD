import { useState, useEffect } from 'react';
import { Search, Filter, Globe, MapPin, Building2, Users, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface SearchFilters {
  sectors: string[];
  industries: string[];
  countries: string[];
  regions: string[];
  employeeRange: string;
  searchScope: 'local' | 'global';
}

interface SearchResult {
  id: number;
  name: string;
  type: 'sector' | 'industry' | 'company';
  sector?: string;
  industry?: string;
  country?: string;
  region?: string;
  employeeCount?: number;
  website?: string;
  description?: string;
}

// Geographic data for country/region categorization
const GEOGRAPHIC_DATA = {
  'North America': ['United States', 'Canada', 'Mexico'],
  'Europe': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark'],
  'Asia Pacific': ['China', 'Japan', 'India', 'Australia', 'Singapore', 'South Korea', 'Thailand', 'Malaysia'],
  'Latin America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
  'Middle East & Africa': ['United Arab Emirates', 'Saudi Arabia', 'South Africa', 'Israel', 'Egypt'],
};

const EMPLOYEE_RANGES = [
  { value: 'all', label: 'All Sizes' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

export function EnhancedSearch() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    sectors: [],
    industries: [],
    countries: [],
    regions: [],
    employeeRange: 'all',
    searchScope: 'local'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch available data for filters
  const { data: sectors = [] } = useQuery({
    queryKey: ['/api/sectors'],
  });

  const { data: industriesData } = useQuery({
    queryKey: ['/api/industries'],
  });

  const { data: companiesData } = useQuery({
    queryKey: ['/api/companies'],
  });

  const industries = (industriesData as any)?.industries || [];
  const companies = (companiesData as any)?.companies || [];

  // Enhanced search functionality
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const query = searchQuery.toLowerCase();
      let allResults: SearchResult[] = [];

      if (filters.searchScope === 'local') {
        // Local search only
        allResults = performLocalSearch(query);
      } else {
        // Global search using both local and external sources
        const response = await fetch(`/api/search/global?q=${encodeURIComponent(searchQuery)}&max=20`);
        const globalData = await response.json();
        
        // Combine local and external results
        const localResults = performLocalSearch(query);
        
        // Add external Google results
        const externalResults: SearchResult[] = globalData.external?.map((business: any, index: number) => ({
          id: business.id,
          name: business.name,
          type: 'company' as const,
          website: business.website,
          description: business.description,
          country: business.country,
          region: business.region,
          sector: 'External Business', // Will be categorized later
          industry: 'Various Industries'
        })) || [];
        
        allResults = [...localResults, ...externalResults];
      }

      // Sort results by relevance
      const sortedResults = allResults.sort((a, b) => {
        const aExact = a.name.toLowerCase() === query;
        const bExact = b.name.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = a.name.toLowerCase().startsWith(query);
        const bStarts = b.name.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return a.name.localeCompare(b.name);
      });

      setSearchResults(sortedResults.slice(0, 50)); // Limit to 50 results
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local search
      const localResults = performLocalSearch(searchQuery.toLowerCase());
      setSearchResults(localResults.slice(0, 50));
    }
    
    setIsSearching(false);
  };

  const performLocalSearch = (query: string): SearchResult[] => {
    const results: SearchResult[] = [];

    // Search sectors
    (sectors as any[]).forEach((sector: any) => {
      if (sector.name.toLowerCase().includes(query)) {
        results.push({
          id: sector.id,
          name: sector.name,
          type: 'sector',
          sector: sector.name
        });
      }
    });

    // Search industries
    industries.forEach((industry: any) => {
      if (industry.name.toLowerCase().includes(query)) {
        // Apply sector filter if selected
        if (filters.sectors.length === 0 || filters.sectors.includes(industry.sectorName)) {
          results.push({
            id: industry.id,
            name: industry.name,
            type: 'industry',
            sector: industry.sectorName,
            industry: industry.name
          });
        }
      }
    });

    // Search companies
    companies.forEach((company: any) => {
      if (company.name.toLowerCase().includes(query) || 
          (company.websiteUrl && company.websiteUrl.toLowerCase().includes(query))) {
        // Apply filters
        let includeResult = true;
        
        if (filters.sectors.length > 0 && !filters.sectors.includes(company.sectorName)) {
          includeResult = false;
        }
        
        if (filters.industries.length > 0 && !filters.industries.includes(company.industryName)) {
          includeResult = false;
        }

        // Geographic filters (using estimated data)
        const estimatedCountry = estimateCompanyCountry(company.websiteUrl);
        const estimatedRegion = getRegionFromCountry(estimatedCountry);
        
        if (filters.countries.length > 0 && !filters.countries.includes(estimatedCountry)) {
          includeResult = false;
        }
        
        if (filters.regions.length > 0 && !filters.regions.includes(estimatedRegion)) {
          includeResult = false;
        }

        if (includeResult) {
          results.push({
            id: company.id,
            name: company.name,
            type: 'company',
            sector: company.sectorName,
            industry: company.industryName,
            website: company.websiteUrl,
            country: estimatedCountry,
            region: estimatedRegion
          });
        }
      }
    });

    return results;
  };

  useEffect(() => {
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, sectors, industries, companies, filters]);

  // Helper functions
  const estimateCompanyCountry = (website: string): string => {
    if (!website) return 'Unknown';
    
    const domain = website.toLowerCase();
    if (domain.includes('.com') || domain.includes('.us')) return 'United States';
    if (domain.includes('.co.uk') || domain.includes('.uk')) return 'United Kingdom';
    if (domain.includes('.de')) return 'Germany';
    if (domain.includes('.fr')) return 'France';
    if (domain.includes('.ca')) return 'Canada';
    if (domain.includes('.au')) return 'Australia';
    if (domain.includes('.jp')) return 'Japan';
    if (domain.includes('.cn')) return 'China';
    if (domain.includes('.in')) return 'India';
    if (domain.includes('.br')) return 'Brazil';
    
    return 'Global';
  };

  const getRegionFromCountry = (country: string): string => {
    for (const [region, countries] of Object.entries(GEOGRAPHIC_DATA)) {
      if (countries.includes(country)) return region;
    }
    return 'Global';
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'sector':
        setLocation(`/sector/${encodeURIComponent(result.name)}`);
        break;
      case 'industry':
        setLocation(`/industry/${encodeURIComponent(result.name)}`);
        break;
      case 'company':
        if (result.website) {
          window.open(result.website, '_blank', 'noopener,noreferrer');
        }
        break;
    }
  };

  const clearFilters = () => {
    setFilters({
      sectors: [],
      industries: [],
      countries: [],
      regions: [],
      employeeRange: 'all',
      searchScope: 'local'
    });
  };

  const activeFilterCount = filters.sectors.length + filters.industries.length + 
                           filters.countries.length + filters.regions.length +
                           (filters.employeeRange !== 'all' ? 1 : 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search companies, industries, or sectors worldwide..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20 h-12 text-base"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-6" align="end" side="bottom" sideOffset={8} alignOffset={-50} avoidCollisions={true}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Search Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Search Scope */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Scope</label>
                  <Select 
                    value={filters.searchScope} 
                    onValueChange={(value: 'local' | 'global') => 
                      setFilters(prev => ({ ...prev, searchScope: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>Local Directory (8,000+ companies)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="global">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Global Search (Google-powered)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Geographic Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Regions</label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {Object.keys(GEOGRAPHIC_DATA).map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox
                          id={region}
                          checked={filters.regions.includes(region)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({
                                ...prev,
                                regions: [...prev.regions, region]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                regions: prev.regions.filter(r => r !== region)
                              }));
                            }
                          }}
                        />
                        <label htmlFor={region} className="text-sm">{region}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employee Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Size</label>
                  <Select 
                    value={filters.employeeRange} 
                    onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, employeeRange: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{range.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <TrendingUp className="h-6 w-6 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{result.name}</h4>
                        <Badge 
                          variant={result.type === 'company' ? 'default' : 
                                  result.type === 'industry' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {result.type}
                        </Badge>
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        {result.sector && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Sector:</span> {result.sector}
                          </p>
                        )}
                        {result.industry && result.type === 'company' && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Industry:</span> {result.industry}
                          </p>
                        )}
                        {result.country && (
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{result.country}</span>
                            </div>
                            {result.region && (
                              <span>• {result.region}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end space-y-1">
                      {result.website && (
                        <Badge variant="outline" className="text-xs">
                          Visit Website
                        </Badge>
                      )}
                      {result.id.toString().startsWith('google_') && (
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                          via Google
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-6 w-6 mx-auto mb-2" />
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Enhanced Search Features</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Local:</strong> Search 20 sectors, 400+ industries, and 8,000+ companies</li>
            <li>• <strong>Global:</strong> Discover businesses worldwide via Google Custom Search</li>
            <li>• Filter by geographic regions and company size</li>
            <li>• Real-time search suggestions and autocomplete</li>
          </ul>
          <div className="mt-3 pt-2 border-t border-blue-200">
            <p className="text-xs text-blue-600">
              Global search powered by Google Custom Search API with proper attribution
            </p>
          </div>
        </div>
      )}

      {/* Search Results Attribution */}
      {searchQuery && searchResults.length > 0 && filters.searchScope === 'global' && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Results include both local directory data and global businesses discovered via Google Custom Search
          </p>
        </div>
      )}
    </div>
  );
}