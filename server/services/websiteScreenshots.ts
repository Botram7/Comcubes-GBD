import { db } from '../db';
import { companies } from '@shared/schema';
import { eq, and, isNull, or } from 'drizzle-orm';

interface ScreenshotResult {
  success: boolean;
  imageUrl?: string;
  fallbackUrl?: string;
  source?: string;
  error?: string;
}

export class WebsiteImageService {
  private isProcessing = false;

  // Use a screenshot service API for website previews
  async captureWebsiteScreenshot(websiteUrl: string, companyName: string): Promise<ScreenshotResult> {
    try {
      if (!websiteUrl) return { success: false, error: 'No website URL provided' };
      
      const cleanUrl = this.cleanUrl(websiteUrl);
      if (!cleanUrl) return { success: false, error: 'Invalid URL format' };

      // Try multiple screenshot services
      const screenshotSources = [
        {
          name: 'screenshotapi',
          url: `https://shot.screenshotapi.net/screenshot?token=YOUR_TOKEN&url=${encodeURIComponent(cleanUrl)}&width=400&height=300&output=image&file_type=png&wait_for_event=load`,
          fallback: true
        },
        {
          name: 'htmlcsstoimage',
          url: `https://hcti.io/v1/image?url=${encodeURIComponent(cleanUrl)}&viewport_width=400&viewport_height=300`,
          fallback: true
        },
        {
          name: 'website-screenshot',
          url: `https://api.screenshotmachine.com?key=YOUR_KEY&url=${encodeURIComponent(cleanUrl)}&dimension=400x300&format=png`,
          fallback: true
        }
      ];

      // For now, let's use a reliable free service approach
      const thumbnailServices = [
        `https://api.thumbnail.ws/api/${encodeURIComponent(cleanUrl)}/viewport/400x300`,
        `https://mini.s-shot.ru/400x300/png/?${encodeURIComponent(cleanUrl)}`,
        `https://image.thum.io/get/width/400/crop/300/${encodeURIComponent(cleanUrl)}`
      ];

      for (const serviceUrl of thumbnailServices) {
        try {
          const response = await fetch(serviceUrl, {
            method: 'HEAD'
          });
          
          if (response.ok) {
            return {
              success: true,
              imageUrl: serviceUrl,
              source: 'thumbnail_service'
            };
          }
        } catch (error) {
          continue;
        }
      }

      // Fallback to favicon with high-quality sources
      const faviconUrl = await this.getFavicon(cleanUrl);
      if (faviconUrl) {
        return {
          success: true,
          imageUrl: faviconUrl,
          source: 'favicon'
        };
      }

      return { success: false, error: 'No screenshot or favicon available' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private async getFavicon(websiteUrl: string): Promise<string | null> {
    try {
      const domain = this.extractDomain(websiteUrl);
      if (!domain) return null;

      // Try multiple favicon sources
      const faviconSources = [
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, // Google's favicon service
        `https://favicongrabber.com/api/grab/${domain}`, // FaviconGrabber API
        `https://icon.horse/icon/${domain}`, // Icon Horse service
        `https://${domain}/favicon.ico`,
        `https://${domain}/apple-touch-icon.png`,
        `https://${domain}/apple-touch-icon-180x180.png`
      ];

      for (const faviconUrl of faviconSources) {
        try {
          if (faviconUrl.includes('favicongrabber.com')) {
            // Handle FaviconGrabber API response
            const response = await fetch(faviconUrl);
            if (response.ok) {
              const data = await response.json();
              if (data.icons && data.icons.length > 0) {
                return data.icons[0].src;
              }
            }
          } else {
            const response = await fetch(faviconUrl, { method: 'HEAD' });
            if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
              return faviconUrl;
            }
          }
        } catch {
          continue;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private cleanUrl(url: string): string | null {
    try {
      if (!url) return null;
      
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      return null;
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

  async processCompanyImages(batchSize: number = 20): Promise<void> {
    if (this.isProcessing) {
      console.log('Website image processing already in progress');
      return;
    }

    this.isProcessing = true;

    try {
      // Get companies that need images
      const companiesNeedingImages = await db
        .select()
        .from(companies)
        .where(
          and(
            isNull(companies.logoUrl),
            or(
              eq(companies.logoStatus, 'pending'),
              eq(companies.logoStatus, 'failed'),
              isNull(companies.logoStatus)
            )
          )
        )
        .limit(batchSize);

      console.log(`Processing ${companiesNeedingImages.length} companies for website images`);

      for (const company of companiesNeedingImages) {
        await this.processCompanyImage(company);
        // Small delay to avoid overwhelming services
        await this.delay(1000);
      }

    } catch (error) {
      console.error('Error in batch image processing:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processCompanyImage(company: any): Promise<void> {
    console.log(`Processing image for: ${company.name}`);

    try {
      const result = await this.captureWebsiteScreenshot(company.websiteUrl, company.name);

      if (result.success && result.imageUrl) {
        await db
          .update(companies)
          .set({
            logoUrl: result.imageUrl,
            logoStatus: 'fetched',
            logoFetchedAt: new Date(),
            logoQuality: result.source === 'thumbnail_service' ? 'high' : 'medium'
          })
          .where(eq(companies.id, company.id));

        console.log(`✓ Image found for ${company.name} via ${result.source}`);
      } else {
        await db
          .update(companies)
          .set({
            logoStatus: 'failed',
            logoFetchedAt: new Date()
          })
          .where(eq(companies.id, company.id));

        console.log(`✗ No image found for ${company.name}`);
      }
    } catch (error) {
      console.error(`Error processing ${company.name}:`, error);
      await db
        .update(companies)
        .set({
          logoStatus: 'failed',
          logoFetchedAt: new Date()
        })
        .where(eq(companies.id, company.id));
    }
  }

  async getImageStats(): Promise<{
    total: number;
    fetched: number;
    pending: number;
    failed: number;
    screenshots: number;
    favicons: number;
  }> {
    const allCompanies = await db.select().from(companies);
    
    return {
      total: allCompanies.length,
      fetched: allCompanies.filter(c => c.logoStatus === 'fetched').length,
      pending: allCompanies.filter(c => c.logoStatus === 'pending' || !c.logoStatus).length,
      failed: allCompanies.filter(c => c.logoStatus === 'failed').length,
      screenshots: allCompanies.filter(c => c.logoUrl && c.logoUrl.includes('screenshot')).length,
      favicons: allCompanies.filter(c => c.logoUrl && (c.logoUrl.includes('favicon') || c.logoUrl.includes('icon'))).length,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const websiteImageService = new WebsiteImageService();