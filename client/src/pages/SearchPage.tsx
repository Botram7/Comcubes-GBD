import { useState } from 'react';
import { Search, TrendingUp, Globe, Building2, Users } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { EnhancedSearch } from '@/components/EnhancedSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Popular search suggestions
const POPULAR_SEARCHES = [
  'Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 
  'Retail', 'Energy', 'Consulting', 'Software', 'Banking', 'Insurance'
];

const TRENDING_SEARCHES = [
  'Artificial Intelligence', 'Renewable Energy', 'Fintech', 'E-commerce',
  'Cloud Computing', 'Biotechnology', 'Cryptocurrency', 'Sustainability'
];

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                C
              </div>
              <span className="text-xl font-bold text-gray-900">COMCUBES</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/sectors" className="text-gray-600 hover:text-gray-900">Sectors</Link>
              <Link href="/industries" className="text-gray-600 hover:text-gray-900">Industries</Link>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
              >
                Back to Home
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Business Search
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover companies, industries, and business sectors worldwide with our enhanced search capabilities
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
                    key={search}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    onClick={() => handleQuickSearch(search)}
                  >
                    {search}
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
                    key={search}
                    variant="outline"
                    className="cursor-pointer hover:bg-green-100 hover:text-green-700 hover:border-green-300 transition-colors"
                    onClick={() => handleQuickSearch(search)}
                  >
                    {search}
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
                <span>Local Directory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Search through our comprehensive database of 8,000+ companies across 20 business sectors and 400+ industries.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Verified business listings</li>
                <li>• Direct website links</li>
                <li>• Industry categorization</li>
                <li>• Sector organization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span>Global Discovery</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Future integration with free APIs to search millions of businesses worldwide using open data sources.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• OpenCorporates integration</li>
                <li>• Government registries</li>
                <li>• Country-specific data</li>
                <li>• Real-time updates</li>
              </ul>
              <Badge variant="outline" className="mt-2">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Advanced Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Refine your search with sophisticated filtering options for precise business discovery.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Geographic regions</li>
                <li>• Company size ranges</li>
                <li>• Industry categories</li>
                <li>• Business sectors</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Browse Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Badge variant="secondary">8,000+ companies</Badge>
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring 20 sectors, 400+ industries, and 8,000+ companies worldwide.</p>
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