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
      },
      
      // Geography pages - important for location-based search
      {
        url: `${this.baseUrl}/geography`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${this.baseUrl}/geography/regions`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.75
      },
      {
        url: `${this.baseUrl}/geography/countries`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.75
      },
      {
        url: `${this.baseUrl}/geography/companies`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.8
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

      // Get ALL companies - no limit to match existing sitemap coverage
      // Use company ID in URL to match actual route: /company/:companyId
      const companies = await storage.getAllCompanies();
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        
        // Priority based on position (alphabetical order)
        let priority = 0.6;
        let changefreq: 'daily' | 'weekly' | 'monthly' = 'weekly';
        
        if (i < 500) {
          priority = 0.7;
          changefreq = 'daily';
        } else if (i < 2000) {
          priority = 0.65;
          changefreq = 'weekly';
        } else {
          priority = 0.55;
          changefreq = 'monthly';
        }
        
        // Use company ID for URL to match the actual route
        urls.push({
          url: `${this.baseUrl}/company/${company.id}`,
          lastmod: now,
          changefreq: changefreq,
          priority: priority
        });
      }

      // Get continents for geography pages
      try {
        const continents = await storage.getContinents();
        for (const continent of continents) {
          urls.push({
            url: `${this.baseUrl}/geography/continent/${continent.slug}`,
            lastmod: now,
            changefreq: 'weekly',
            priority: 0.75
          });
        }
      } catch (e) {
        console.log('Continents not available for sitemap');
      }

      // Get regions for geography pages
      try {
        const regions = await storage.getRegions();
        for (const region of regions) {
          urls.push({
            url: `${this.baseUrl}/geography/region/${region.slug}`,
            lastmod: now,
            changefreq: 'weekly',
            priority: 0.7
          });
        }
      } catch (e) {
        console.log('Regions not available for sitemap');
      }

      // Get countries for geography pages
      try {
        const countries = await storage.getCountries();
        for (const country of countries) {
          urls.push({
            url: `${this.baseUrl}/geography/country/${country.slug}`,
            lastmod: now,
            changefreq: 'weekly',
            priority: 0.7
          });
        }
      } catch (e) {
        console.log('Countries not available for sitemap');
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