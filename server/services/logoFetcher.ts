import { db } from '../db';
import { companies } from '@shared/schema';
import { eq, and, isNull, or } from 'drizzle-orm';

interface LogoFetchResult {
  success: boolean;
  logoUrl?: string;
  quality?: 'high' | 'medium' | 'low';
  source?: string;
  error?: string;
}

interface LogoSource {
  name: string;
  priority: number;
  fetcher: (company: { name: string; website?: string | null }) => Promise<LogoFetchResult>;
}

// Clearbit Logo API - Free tier available
class ClearbitLogoFetcher {
  async fetchLogo(company: { name: string; website?: string | null }): Promise<LogoFetchResult> {
    try {
      if (!company.website) return { success: false, error: 'No website available' };
      
      const domain = this.extractDomain(company.website);
      if (!domain) return { success: false, error: 'Invalid website URL' };
      
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      
      // Test if logo exists by attempting to fetch
      const response = await fetch(logoUrl, { method: 'HEAD' });
      if (response.ok) {
        const size = response.headers.get('content-length');
        const quality = this.determineQuality(parseInt(size || '0'));
        return {
          success: true,
          logoUrl,
          quality,
          source: 'clearbit'
        };
      }
      
      return { success: false, error: 'Logo not found on Clearbit' };
    } catch (error) {
      return { success: false, error: `Clearbit error: ${(error as Error).message}` };
    }
  }
  
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }
  
  private determineQuality(size: number): 'high' | 'medium' | 'low' {
    if (size > 10000) return 'high';
    if (size > 3000) return 'medium';
    return 'low';
  }
}

// Favicon fetcher as fallback
class FaviconFetcher {
  async fetchLogo(company: { name: string; website?: string | null }): Promise<LogoFetchResult> {
    try {
      if (!company.website) return { success: false, error: 'No website available' };
      
      const domain = this.extractDomain(company.website);
      if (!domain) return { success: false, error: 'Invalid website URL' };
      
      // Try common favicon locations
      const faviconUrls = [
        `https://${domain}/favicon.ico`,
        `https://${domain}/favicon.png`,
        `https://${domain}/apple-touch-icon.png`,
        `https://${domain}/logo.png`,
        `https://${domain}/assets/logo.png`,
        `https://${domain}/images/logo.png`
      ];
      
      for (const url of faviconUrls) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.startsWith('image/')) {
              const size = parseInt(response.headers.get('content-length') || '0');
              return {
                success: true,
                logoUrl: url,
                quality: size > 5000 ? 'medium' : 'low',
                source: 'favicon'
              };
            }
          }
        } catch {
          continue;
        }
      }
      
      return { success: false, error: 'No favicon found' };
    } catch (error) {
      return { success: false, error: `Favicon error: ${(error as Error).message}` };
    }
  }
  
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }
}

// Google Search fallback
class GoogleSearchFetcher {
  constructor(private apiKey: string, private searchEngineId: string) {}
  
  async fetchLogo(company: { name: string; website?: string | null }): Promise<LogoFetchResult> {
    try {
      const domain = company.website ? this.extractDomain(company.website) : '';
      const query = `${company.name} logo${domain ? ` site:${domain}` : ''}`;
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(query)}&searchType=image&num=3`
      );
      
      if (!response.ok) {
        return { success: false, error: 'Google Search API error' };
      }
      
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        // Filter for high-quality images
        const goodImage = data.items.find((item: any) => 
          item.image?.width > 100 && 
          item.image?.height > 100 &&
          (item.link.includes('logo') || (company.website && item.displayLink.includes(this.extractDomain(company.website) || '')))
        );
        
        if (goodImage) {
          return {
            success: true,
            logoUrl: goodImage.link,
            quality: this.determineQualityFromGoogle(goodImage.image),
            source: 'google'
          };
        }
      }
      
      return { success: false, error: 'No suitable logo found in Google Search' };
    } catch (error) {
      return { success: false, error: `Google Search error: ${(error as Error).message}` };
    }
  }
  
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }
  
  private determineQualityFromGoogle(imageInfo: any): 'high' | 'medium' | 'low' {
    const width = imageInfo?.width || 0;
    const height = imageInfo?.height || 0;
    const minDimension = Math.min(width, height);
    
    if (minDimension >= 200) return 'high';
    if (minDimension >= 100) return 'medium';
    return 'low';
  }
}

export class LogoFetchingService {
  private sources: LogoSource[] = [];
  private isProcessing = false;
  
  constructor() {
    this.initializeSources();
  }
  
  private initializeSources() {
    const clearbitFetcher = new ClearbitLogoFetcher();
    const faviconFetcher = new FaviconFetcher();
    
    this.sources = [
      {
        name: 'clearbit',
        priority: 1,
        fetcher: clearbitFetcher.fetchLogo.bind(clearbitFetcher)
      },
      {
        name: 'favicon',
        priority: 2,
        fetcher: faviconFetcher.fetchLogo.bind(faviconFetcher)
      }
    ];
    
    // Add Google Search if API keys are available
    const googleApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const googleSearchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    
    if (googleApiKey && googleSearchEngineId) {
      const googleFetcher = new GoogleSearchFetcher(googleApiKey, googleSearchEngineId);
      this.sources.push({
        name: 'google',
        priority: 3,
        fetcher: googleFetcher.fetchLogo.bind(googleFetcher)
      });
    }
  }
  
  async fetchLogosForCompanies(batchSize: number = 10): Promise<void> {
    if (this.isProcessing) {
      console.log('Logo fetching already in progress');
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Get companies that need logo fetching
      const companiesNeedingLogos = await db
        .select()
        .from(companies)
        .where(
          or(
            isNull(companies.logoUrl),
            eq(companies.logoStatus, 'pending'),
            eq(companies.logoStatus, 'failed')
          )
        )
        .limit(batchSize);
      
      console.log(`Processing ${companiesNeedingLogos.length} companies for logo fetching`);
      
      for (const company of companiesNeedingLogos) {
        await this.fetchLogoForCompany(company);
        // Add small delay to respect rate limits
        await this.delay(500);
      }
      
    } catch (error) {
      console.error('Error in batch logo fetching:', error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  async fetchLogoForCompany(company: any): Promise<LogoFetchResult> {
    console.log(`Fetching logo for: ${company.name}`);
    
    // Try each source in priority order
    for (const source of this.sources) {
      try {
        const result = await source.fetcher(company);
        
        if (result.success && result.logoUrl) {
          // Update database with successful result
          await db
            .update(companies)
            .set({
              logoUrl: result.logoUrl,
              logoStatus: 'fetched',
              logoFetchedAt: new Date(),
              logoQuality: result.quality || 'medium'
            })
            .where(eq(companies.id, company.id));
          
          console.log(`✓ Logo found for ${company.name} via ${source.name}`);
          return result;
        }
      } catch (error) {
        console.error(`Error fetching from ${source.name} for ${company.name}:`, error);
      }
    }
    
    // Mark as failed if no sources worked
    await db
      .update(companies)
      .set({
        logoStatus: 'failed',
        logoFetchedAt: new Date()
      })
      .where(eq(companies.id, company.id));
    
    console.log(`✗ No logo found for ${company.name}`);
    return { success: false, error: 'No logo found from any source' };
  }
  
  async getLogoStats(): Promise<{
    total: number;
    fetched: number;
    pending: number;
    failed: number;
    highQuality: number;
    mediumQuality: number;
    lowQuality: number;
  }> {
    const allCompanies = await db.select().from(companies);
    
    return {
      total: allCompanies.length,
      fetched: allCompanies.filter(c => c.logoStatus === 'fetched').length,
      pending: allCompanies.filter(c => c.logoStatus === 'pending' || !c.logoStatus).length,
      failed: allCompanies.filter(c => c.logoStatus === 'failed').length,
      highQuality: allCompanies.filter(c => c.logoQuality === 'high').length,
      mediumQuality: allCompanies.filter(c => c.logoQuality === 'medium').length,
      lowQuality: allCompanies.filter(c => c.logoQuality === 'low').length,
    };
  }
  
  // Enhanced safeguard: Takedown mechanism
  async removeCompanyLogo(companyId: number, reason: string = 'trademark_request'): Promise<boolean> {
    try {
      await db
        .update(companies)
        .set({
          logoUrl: null,
          logoStatus: 'removed',
          logoFetchedAt: new Date()
        })
        .where(eq(companies.id, companyId));
      
      console.log(`Logo removed for company ID ${companyId}, reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('Error removing logo:', error);
      return false;
    }
  }
  
  // Enhanced safeguard: Quality audit
  async auditLogoQuality(): Promise<void> {
    console.log('Starting logo quality audit...');
    
    const companiesWithLogos = await db
      .select()
      .from(companies)
      .where(eq(companies.logoStatus, 'fetched'));
    
    for (const company of companiesWithLogos) {
      if (company.logoUrl) {
        try {
          const response = await fetch(company.logoUrl, { method: 'HEAD' });
          if (!response.ok) {
            // Logo URL is broken, mark for re-fetching
            await db
              .update(companies)
              .set({ logoStatus: 'pending' })
              .where(eq(companies.id, company.id));
            console.log(`Marked ${company.name} for re-fetching (broken URL)`);
          }
        } catch (error) {
          await db
            .update(companies)
            .set({ logoStatus: 'pending' })
            .where(eq(companies.id, company.id));
          console.log(`Marked ${company.name} for re-fetching (network error)`);
        }
      }
    }
    
    console.log('Logo quality audit completed');
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const logoFetchingService = new LogoFetchingService();