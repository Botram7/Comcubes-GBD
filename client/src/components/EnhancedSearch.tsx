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
  id: number | string;
  name: string;
  type: 'sector' | 'industry' | 'company' | 'external_company';
  sector?: string;
  industry?: string;
  country?: string;
  region?: string;
  employeeCount?: number;
  website?: string;
  description?: string;
  source?: string;
}

// Geographic data for country/region categorization
const GEOGRAPHIC_DATA = {
  'North America': ['United States', 'Canada', 'Mexico'],
  'Europe': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark'],
  'Asia Pacific': ['China', 'Japan', 'India', 'Australia', 'Singapore', 'South Korea', 'Thailand', 'Malaysia'],
  'Latin America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
  'Middle East & Africa': ['United Arab Emirates', 'Saudi Arabia', 'South Africa', 'Israel', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Tunisia', 'Algeria'],
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

  // Use dynamic API search based on search scope
  const searchEndpoint = filters.searchScope === 'global' ? '/api/search/global' : '/api/search';
  const { data: apiSearchResults, isLoading: isApiSearching } = useQuery({
    queryKey: [searchEndpoint, searchQuery, filters.searchScope],
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
  });

  const industries = (industriesData as any)?.industries || [];

  // Process API search results and apply filters
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(isApiSearching);

    if (apiSearchResults) {
      const allResults: SearchResult[] = [];
      
      if (filters.searchScope === 'global') {
        // Handle global search results
        const globalData = apiSearchResults as any;
        
        // Add local results from global search
        if (globalData.local) {
          // Add local sectors
          (globalData.local.sectors || []).forEach((sector: any) => {
            allResults.push({
              id: sector.id,
              name: sector.name,
              type: 'sector',
              sector: sector.name
            });
          });
          
          // Add local industries
          (globalData.local.industries || []).forEach((industry: any) => {
            allResults.push({
              id: industry.id,
              name: industry.name,
              type: 'industry',
              sector: industry.sectorName,
              industry: industry.name
            });
          });
          
          // Add local companies
          (globalData.local.companies || []).forEach((company: any) => {
            allResults.push({
              id: company.id,
              name: company.name,
              type: 'company',
              sector: company.sectorName,
              industry: company.industryName,
              website: company.websiteUrl,
              country: 'Local',
              region: 'Local'
            });
          });
        }
        
        // Add external results from global search
        (globalData.external || []).forEach((company: any) => {
          allResults.push({
            id: company.id,
            name: company.name,
            type: company.type || 'external_company',
            website: company.website,
            description: company.description,
            country: company.country || 'External',
            region: company.region || undefined,
            source: company.source || 'google'
          });
        });
      } else {
        // Handle local search results (original logic)
        // Add sectors
        ((apiSearchResults as any)?.sectors || []).forEach((sector: any) => {
          allResults.push({
            id: sector.id,
            name: sector.name,
            type: 'sector',
            sector: sector.name
          });
        });
        
        // Add industries
        ((apiSearchResults as any)?.industries || []).forEach((industry: any) => {
          allResults.push({
            id: industry.id,
            name: industry.name,
            type: 'industry',
            sector: industry.sectorName,
            industry: industry.name
          });
        });
        
        // Add companies
        ((apiSearchResults as any)?.companies || []).forEach((company: any) => {
          allResults.push({
            id: company.id,
            name: company.name,
            type: 'company',
            sector: company.sectorName,
            industry: company.industryName,
            website: company.websiteUrl,
            country: 'Local',
            region: 'Local'
          });
        });
      }
      
      // Apply filters - but for global search, be more lenient with external results
      const filteredResults = allResults.filter(result => {
        // For external companies from Google, don't apply geographic filters unless we're confident about the location
        if (filters.searchScope === 'global' && result.source === 'google') {
          // Only apply sector and industry filters to external results, not geographic ones
          // since Google results may not have reliable country/region data
          if (filters.sectors.length > 0 && result.sector && !filters.sectors.includes(result.sector)) {
            return false;
          }
          if (filters.industries.length > 0 && result.industry && !filters.industries.includes(result.industry)) {
            return false;
          }
          // Skip geographic filters for Google results
          return true;
        }
        
        // For local results, apply all filters normally
        if (filters.sectors.length > 0 && !filters.sectors.includes(result.sector || '')) {
          return false;
        }
        
        if (filters.industries.length > 0 && !filters.industries.includes(result.industry || '')) {
          return false;
        }
        
        if (filters.countries.length > 0 && !filters.countries.includes(result.country || '')) {
          return false;
        }
        
        if (filters.regions.length > 0 && !filters.regions.includes(result.region || '')) {
          return false;
        }
        
        return true;
      });
      
      setSearchResults(filteredResults.slice(0, 50));
    }
  }, [apiSearchResults, isApiSearching, searchQuery, filters]);

  // Removed performLocalSearch function - now using API search directly

  // No longer need the timeout-based search since we're using React Query


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
            <PopoverContent 
              className="w-96 p-6" 
              side="left" 
              align="start" 
              sideOffset={8}
              avoidCollisions={true}
              collisionPadding={20}
            >
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
                          <span>Local Directory (7,400+ companies)</span>
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
                        {result.type !== 'external_company' && (
                          <Badge 
                            variant={result.type === 'company' ? 'default' : 
                                    result.type === 'industry' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {result.type}
                          </Badge>
                        )}
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
                            {result.region && result.region !== result.country && (
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
                          Google
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
            <li>• <strong>Local:</strong> Search 20 sectors, 400+ industries, and 7,400+ companies</li>
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