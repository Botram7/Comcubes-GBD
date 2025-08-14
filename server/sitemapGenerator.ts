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
      {
        url: this.baseUrl,
        lastmod: now,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: `${this.baseUrl}/sectors`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        url: `${this.baseUrl}/industries`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        url: `${this.baseUrl}/companies`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        url: `${this.baseUrl}/search`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        url: `${this.baseUrl}/advertise`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        url: `${this.baseUrl}/contact`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.6
      },
      {
        url: `${this.baseUrl}/privacy-policy`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        url: `${this.baseUrl}/terms-of-service`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        url: `${this.baseUrl}/disclaimer`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        url: `${this.baseUrl}/affiliate-disclosure`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3
      }
    ];
  }

  async generateDynamicUrls(storage: any): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];
    const now = new Date().toISOString();

    try {
      // Get all sectors
      const sectors = await storage.getAllSectors();
      for (const sector of sectors) {
        urls.push({
          url: `${this.baseUrl}/sector/${encodeURIComponent(sector.name)}`,
          lastmod: now,
          changefreq: 'weekly',
          priority: 0.8
        });
      }

      // Get all industries  
      const industries = await storage.getAllIndustries();
      for (const industry of industries) {
        urls.push({
          url: `${this.baseUrl}/industry/${encodeURIComponent(industry.name)}`,
          lastmod: now,
          changefreq: 'daily',
          priority: 0.7
        });
      }

      // Get all companies (limit to prevent huge sitemaps)
      const companies = await storage.getAllCompanies(1000); // Limit to first 1000 companies
      for (const company of companies) {
        urls.push({
          url: `${this.baseUrl}/company/${encodeURIComponent(company.name)}`,
          lastmod: now,
          changefreq: 'weekly',
          priority: 0.6
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