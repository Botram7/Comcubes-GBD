import { storage } from '../storage';

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

const GENERAL_CACHE_TTL_DAYS = 7;
const INDUSTRY_CACHE_TTL_DAYS = 30;

const industryKeywords = [
  'aerospace', 'agriculture', 'automotive', 'banking', 'chemicals',
  'construction', 'education', 'energy', 'food', 'healthcare',
  'insurance', 'manufacturing', 'media', 'pharmaceuticals', 'real estate',
  'retail', 'technology', 'telecommunications', 'transportation', 'tourism',
  'defense', 'utilities', 'logistics', 'entertainment', 'professional services'
];

export class GoogleSearchService {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor() {
    this.apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '';
    
    const rawSearchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';
    this.searchEngineId = this.extractSearchEngineId(rawSearchEngineId);
  }

  private extractSearchEngineId(rawId: string): string {
    if (/^[a-zA-Z0-9]+$/.test(rawId.trim())) {
      return rawId.trim();
    }

    const match = rawId.match(/cx=([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      console.log(`Extracted search engine ID: ${match[1]}`);
      return match[1];
    }

    console.warn('Could not extract search engine ID from:', rawId.substring(0, 50));
    return rawId;
  }

  private isIndustrySpecificQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return industryKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  async searchBusinesses(query: string, maxResults: number = 20): Promise<BusinessSearchResult[]> {
    if (!this.apiKey || !this.searchEngineId) {
      console.log('Google Custom Search API credentials not configured');
      return [];
    }

    try {
      const cached = await storage.getSearchCache(query);
      if (cached) {
        console.log(`Cache HIT for query: "${query}" (hits: ${cached.hitCount + 1})`);
        await storage.incrementSearchCacheHit(cached.id);
        return cached.resultsJson as BusinessSearchResult[];
      }

      console.log(`Cache MISS for query: "${query}" — calling Google API`);

      const businessQuery = this.enhanceBusinessQuery(query);
      
      const searchUrl = new URL(this.baseUrl);
      searchUrl.searchParams.append('key', this.apiKey);
      searchUrl.searchParams.append('cx', this.searchEngineId);
      searchUrl.searchParams.append('q', businessQuery);
      searchUrl.searchParams.append('num', Math.min(maxResults, 10).toString());

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

      const isIndustry = this.isIndustrySpecificQuery(query);
      const ttlDays = isIndustry ? INDUSTRY_CACHE_TTL_DAYS : GENERAL_CACHE_TTL_DAYS;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + ttlDays);

      try {
        await storage.setSearchCache({
          queryString: query,
          resultsJson: businessResults,
          isIndustrySpecific: isIndustry,
          expiresAt,
        });
        console.log(`Cached results for "${query}" (TTL: ${ttlDays} days, industry: ${isIndustry})`);
      } catch (cacheError) {
        console.error('Failed to cache search results:', cacheError);
      }
      
      return businessResults;
    } catch (error) {
      console.error('Error searching Google for businesses:', error);
      return [];
    }
  }

  private enhanceBusinessQuery(query: string): string {
    const businessTerms = [
      'company',
      'business',
      'corporation',
      'inc',
      'ltd',
      'llc',
      'limited'
    ];

    const hasBusinessTerm = businessTerms.some(term => 
      query.toLowerCase().includes(term)
    );

    if (!hasBusinessTerm && query.trim().length <= 20) {
      return `${query} company`;
    }

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

    const excludePatterns = [
      'wikipedia.org',
      'linkedin.com/in/',
      'facebook.com/profile',
      'twitter.com/i/',
      'instagram.com/p/',
      'youtube.com/watch',
      'reddit.com/r/',
      'quora.com/What-',
      'pinterest.com'
    ];

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

    const hasExcludePattern = excludePatterns.some(pattern => 
      link.includes(pattern)
    );

    const hasIncludePattern = includePatterns.some(pattern => 
      title.includes(pattern) || snippet.includes(pattern)
    ) || this.hasBusinessDomain(link);

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
    let name = title
      .replace(/\s*-\s*.*$/, '')
      .replace(/\s*\|\s*.*$/, '')
      .replace(/\s*–\s*.*$/, '')
      .replace(/Official Website/gi, '')
      .replace(/Home Page/gi, '')
      .replace(/Welcome to/gi, '')
      .trim();

    if (name.length < 3) {
      name = query.split(' ')[0];
    }

    return name;
  }

  private cleanSnippet(snippet: string): string {
    return snippet
      .replace(/\s+/g, ' ')
      .replace(/\.\.\./g, '')
      .trim()
      .substring(0, 200);
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
