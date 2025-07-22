// Google Custom Search Service for worldwide business discovery

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  formattedUrl?: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

interface BusinessSearchResult {
  id: string;
  name: string;
  type: 'external_company';
  website: string;
  description: string;
  source: 'google' | 'local';
  country?: string;
  region?: string;
  displayDomain?: string;
}

export class GoogleSearchService {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor() {
    this.apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';
  }

  async searchBusinesses(query: string, maxResults: number = 20): Promise<BusinessSearchResult[]> {
    if (!this.apiKey || !this.searchEngineId) {
      console.log('Google Custom Search API credentials not configured');
      return [];
    }

    try {
      // Enhance query for business-specific results
      const businessQuery = this.enhanceBusinessQuery(query);
      
      const searchUrl = new URL(this.baseUrl);
      searchUrl.searchParams.append('key', this.apiKey);
      searchUrl.searchParams.append('cx', this.searchEngineId);
      searchUrl.searchParams.append('q', businessQuery);
      searchUrl.searchParams.append('num', Math.min(maxResults, 10).toString()); // Google max is 10 per request
      searchUrl.searchParams.append('gl', 'us'); // Geographic location
      searchUrl.searchParams.append('lr', 'lang_en'); // Language restriction

      console.log(`Searching Google for businesses: "${businessQuery}"`);
      
      const response = await fetch(searchUrl.toString());
      
      if (!response.ok) {
        console.error(`Google Search API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data: GoogleSearchResponse = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.log('No Google search results found');
        return [];
      }

      const businessResults = this.parseBusinessResults(data.items, query);
      console.log(`Found ${businessResults.length} business results from Google`);
      
      return businessResults;
    } catch (error) {
      console.error('Error searching Google for businesses:', error);
      return [];
    }
  }

  private enhanceBusinessQuery(query: string): string {
    // Add business-specific terms to improve search results
    const businessTerms = [
      'company',
      'business',
      'corporation',
      'inc',
      'ltd',
      'llc',
      'official website'
    ];

    // Check if query already contains business terms
    const hasBusinessTerm = businessTerms.some(term => 
      query.toLowerCase().includes(term)
    );

    if (!hasBusinessTerm) {
      return `${query} company business official website`;
    }

    return query;
  }

  private parseBusinessResults(items: GoogleSearchResult[], originalQuery: string): BusinessSearchResult[] {
    return items
      .filter(item => this.isLikelyBusinessResult(item))
      .map((item, index) => {
        const domain = this.extractDomain(item.link);
        const country = this.estimateCountryFromDomain(domain);
        const region = this.getRegionFromCountry(country);

        return {
          id: `google_${Date.now()}_${index}`,
          name: this.extractBusinessName(item.title, originalQuery),
          type: 'external_company' as const,
          website: item.link,
          description: this.cleanSnippet(item.snippet),
          source: 'google' as const,
          country,
          region,
          displayDomain: domain
        };
      });
  }

  private isLikelyBusinessResult(item: GoogleSearchResult): boolean {
    const title = item.title.toLowerCase();
    const snippet = item.snippet.toLowerCase();
    const link = item.link.toLowerCase();

    // Filter out non-business results
    const excludePatterns = [
      'wikipedia',
      'linkedin.com/in/', // Personal LinkedIn profiles
      'facebook.com/profile',
      'twitter.com',
      'instagram.com',
      'youtube.com/watch',
      'reddit.com',
      'quora.com',
      'blog',
      'news',
      'article'
    ];

    const includePatterns = [
      'company',
      'corporation',
      'business',
      'inc',
      'ltd',
      'llc',
      'official',
      'website',
      'contact',
      'about us',
      'services',
      'products'
    ];

    const hasExcludePattern = excludePatterns.some(pattern => 
      title.includes(pattern) || snippet.includes(pattern) || link.includes(pattern)
    );

    const hasIncludePattern = includePatterns.some(pattern => 
      title.includes(pattern) || snippet.includes(pattern)
    );

    return !hasExcludePattern && (hasIncludePattern || this.hasBusinessDomain(link));
  }

  private hasBusinessDomain(url: string): boolean {
    const businessDomains = ['.com', '.net', '.org', '.biz', '.co', '.io'];
    return businessDomains.some(domain => url.includes(domain));
  }

  private extractBusinessName(title: string, query: string): string {
    // Clean up the title to extract business name
    let name = title
      .replace(/\s*-\s*.*$/, '') // Remove everything after first dash
      .replace(/\s*\|\s*.*$/, '') // Remove everything after first pipe
      .replace(/\s*–\s*.*$/, '') // Remove everything after en dash
      .replace(/Official Website/gi, '')
      .replace(/Home Page/gi, '')
      .replace(/Welcome to/gi, '')
      .trim();

    // If name is too short, use the query as basis
    if (name.length < 3) {
      name = query.split(' ')[0]; // Use first word of query
    }

    return name;
  }

  private cleanSnippet(snippet: string): string {
    return snippet
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\.\.\./g, '') // Remove ellipsis
      .trim()
      .substring(0, 200); // Limit length
  }

  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return 'unknown';
    }
  }

  private estimateCountryFromDomain(domain: string): string {
    const countryDomains: Record<string, string> = {
      '.com': 'United States',
      '.us': 'United States',
      '.co.uk': 'United Kingdom',
      '.uk': 'United Kingdom',
      '.de': 'Germany',
      '.fr': 'France',
      '.ca': 'Canada',
      '.au': 'Australia',
      '.jp': 'Japan',
      '.cn': 'China',
      '.in': 'India',
      '.br': 'Brazil',
      '.it': 'Italy',
      '.es': 'Spain',
      '.nl': 'Netherlands',
      '.se': 'Sweden',
      '.no': 'Norway',
      '.dk': 'Denmark',
      '.fi': 'Finland',
      '.ch': 'Switzerland'
    };

    for (const [tld, country] of Object.entries(countryDomains)) {
      if (domain.endsWith(tld)) {
        return country;
      }
    }

    return 'Global';
  }

  private getRegionFromCountry(country: string): string {
    const regionMap: Record<string, string> = {
      'United States': 'North America',
      'Canada': 'North America',
      'Mexico': 'North America',
      'United Kingdom': 'Europe',
      'Germany': 'Europe',
      'France': 'Europe',
      'Italy': 'Europe',
      'Spain': 'Europe',
      'Netherlands': 'Europe',
      'Switzerland': 'Europe',
      'Sweden': 'Europe',
      'Norway': 'Europe',
      'Denmark': 'Europe',
      'Finland': 'Europe',
      'China': 'Asia Pacific',
      'Japan': 'Asia Pacific',
      'India': 'Asia Pacific',
      'Australia': 'Asia Pacific',
      'Singapore': 'Asia Pacific',
      'South Korea': 'Asia Pacific',
      'Brazil': 'Latin America',
      'Argentina': 'Latin America',
      'Chile': 'Latin America'
    };

    return regionMap[country] || 'Global';
  }
}

export const googleSearchService = new GoogleSearchService();