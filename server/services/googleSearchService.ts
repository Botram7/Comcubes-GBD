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
    
    // Extract the actual search engine ID from the environment variable
    // Handle both formats: clean ID or HTML embed code
    const rawSearchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';
    this.searchEngineId = this.extractSearchEngineId(rawSearchEngineId);
  }

  private extractSearchEngineId(rawId: string): string {
    // If it's already a clean ID (alphanumeric string), use it
    if (/^[a-zA-Z0-9]+$/.test(rawId.trim())) {
      return rawId.trim();
    }

    // Extract from HTML embed code format: cx=XXXXX
    const match = rawId.match(/cx=([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      console.log(`Extracted search engine ID: ${match[1]}`);
      return match[1];
    }

    console.warn('Could not extract search engine ID from:', rawId.substring(0, 50));
    return rawId;
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
      // Remove geographic and language restrictions that might cause 404
      // searchUrl.searchParams.append('gl', 'us'); // Geographic location
      // searchUrl.searchParams.append('lr', 'lang_en'); // Language restriction

      console.log(`Searching Google for businesses: "${businessQuery}"`);
      
      const response = await fetch(searchUrl.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Search API error: ${response.status} ${response.statusText}`);
        console.error('Response body:', errorText);
        console.error('Request URL:', searchUrl.toString());
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
    // For very specific company names (like "Chivita"), don't over-enhance
    // Only add minimal enhancement if needed
    const businessTerms = [
      'company',
      'business',
      'corporation',
      'inc',
      'ltd',
      'llc',
      'limited'
    ];

    // Check if query already contains business terms
    const hasBusinessTerm = businessTerms.some(term => 
      query.toLowerCase().includes(term)
    );

    // If it's a short, specific query (likely a company name), just add "company"
    if (!hasBusinessTerm && query.trim().length <= 20) {
      return `${query} company`;
    }

    // For longer queries, return as-is to maintain specificity
    return query;
  }

  private parseBusinessResults(items: GoogleSearchResult[], originalQuery: string): BusinessSearchResult[] {
    return items
      .filter(item => this.isLikelyBusinessResult(item))
      .map((item, index) => {
        const domain = this.extractDomain(item.link);

        return {
          id: `google_${Date.now()}_${index}`,
          name: this.extractBusinessName(item.title, originalQuery),
          type: 'external_company' as const,
          website: item.link,
          description: this.cleanSnippet(item.snippet),
          source: 'google' as const,
          country: 'External',
          region: 'External',
          displayDomain: domain
        };
      });
  }

  private isLikelyBusinessResult(item: GoogleSearchResult): boolean {
    if (!item || !item.title || !item.snippet || !item.link) {
      return false;
    }
    
    const title = item.title.toLowerCase();
    const snippet = item.snippet.toLowerCase();
    const link = item.link.toLowerCase();

    // Only filter out clearly non-business results - be more permissive
    const excludePatterns = [
      'wikipedia.org',
      'linkedin.com/in/', // Personal LinkedIn profiles only, not company pages
      'facebook.com/profile',
      'twitter.com/i/',
      'instagram.com/p/',
      'youtube.com/watch',
      'reddit.com/r/',
      'quora.com/What-',
      'pinterest.com'
    ];

    // More inclusive patterns - include if it has business indicators
    const includePatterns = [
      'company',
      'corporation',
      'business',
      'inc',
      'ltd',
      'llc',
      'limited',
      'official',
      'website',
      'contact',
      'about',
      'services',
      'products',
      'homepage',
      'welcome',
      'group',
      'enterprises',
      'industries'
    ];

    // Check if URL is clearly a personal profile or forum post
    const hasExcludePattern = excludePatterns.some(pattern => 
      link.includes(pattern)
    );

    // Be very inclusive - if it's not clearly excluded, include it
    const hasIncludePattern = includePatterns.some(pattern => 
      title.includes(pattern) || snippet.includes(pattern)
    ) || this.hasBusinessDomain(link);

    // Default to including results unless clearly excluded
    return !hasExcludePattern && (hasIncludePattern || !this.isPersonalContent(title, snippet));
  }

  private isPersonalContent(title: string, snippet: string): boolean {
    const personalIndicators = [
      'my blog',
      'personal website',
      'portfolio',
      'resume',
      'cv of',
      'diary',
      'personal thoughts'
    ];
    
    return personalIndicators.some(indicator => 
      title.includes(indicator) || snippet.includes(indicator)
    );
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

}

export const googleSearchService = new GoogleSearchService();