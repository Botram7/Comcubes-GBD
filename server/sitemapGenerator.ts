interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'https://comcubes.com') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  generateSitemapXml(urls: SitemapUrl[]): string {
    const urlElements = urls.map(url => {
      let urlXml = `  <url>\n    <loc>${url.url}</loc>\n`;
      
      if (url.lastmod) {
        urlXml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      
      if (url.changefreq) {
        urlXml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      
      if (url.priority !== undefined) {
        urlXml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
      }
      
      urlXml += `  </url>`;
      return urlXml;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  async generateStaticUrls(): Promise<SitemapUrl[]> {
    const now = new Date().toISOString();
    
    return [
      // Core pages with highest priority
      {
        url: this.baseUrl,
        lastmod: now,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: `${this.baseUrl}/sectors`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        url: `${this.baseUrl}/industries`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        url: `${this.baseUrl}/companies`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.9
      },
      
      // Business-critical pages
      {
        url: `${this.baseUrl}/list-company`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        url: `${this.baseUrl}/search`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.85
      },
      
      // Content feeds for SEO
      {
        url: `${this.baseUrl}/feed/`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.8
      },
      
      // Secondary business pages
      {
        url: `${this.baseUrl}/advertise`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.6
      },
      {
        url: `${this.baseUrl}/contact`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.6
      },
      
      // Legal and compliance pages
      {
        url: `${this.baseUrl}/privacy-policy`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.4
      },
      {
        url: `${this.baseUrl}/terms-of-service`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.4
      },
      {
        url: `${this.baseUrl}/disclaimer`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.4
      },
      {
        url: `${this.baseUrl}/affiliate-disclosure`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.4
      }
    ];
  }

  async generateDynamicUrls(storage: any): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];
    const now = new Date().toISOString();

    try {
      // Get all sectors - high priority as they're major landing pages
      const sectors = await storage.getSectors();
      for (const sector of sectors) {
        urls.push({
          url: `${this.baseUrl}/sector/${encodeURIComponent(sector.name)}`,
          lastmod: now,
          changefreq: 'daily',
          priority: 0.85
        });
      }

      // Get all industries - medium-high priority, frequently updated
      const industries = await storage.getAllIndustries();
      for (const industry of industries) {
        urls.push({
          url: `${this.baseUrl}/industry/${encodeURIComponent(industry.name)}`,
          lastmod: now,
          changefreq: 'daily',
          priority: 0.75
        });
      }

      // Get companies with strategic priority distribution
      const companies = await storage.getAllCompanies(1500); // Increased limit for better coverage
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        
        // Higher priority for top companies (first 200)
        let priority = 0.6;
        let changefreq: 'daily' | 'weekly' | 'monthly' = 'weekly';
        
        if (i < 200) {
          priority = 0.7;
          changefreq = 'daily';
        } else if (i < 500) {
          priority = 0.65;
          changefreq = 'weekly';
        } else {
          priority = 0.55;
          changefreq = 'monthly';
        }
        
        urls.push({
          url: `${this.baseUrl}/company/${encodeURIComponent(company.name)}`,
          lastmod: now,
          changefreq: changefreq,
          priority: priority
        });
      }

    } catch (error) {
      console.error('Error generating dynamic sitemap URLs:', error);
    }

    return urls;
  }

  async generateCompleteSitemap(storage: any): Promise<string> {
    const staticUrls = await this.generateStaticUrls();
    const dynamicUrls = await this.generateDynamicUrls(storage);
    
    const allUrls = [...staticUrls, ...dynamicUrls];
    return this.generateSitemapXml(allUrls);
  }
}