import type { Express } from "express";
import { storage } from "./storage";

export function registerSEORoutes(app: Express) {
  // XML Sitemap
  app.get('/sitemap.xml', async (req, res) => {
    res.set('Content-Type', 'application/xml');
    
    try {
      // Get data for sitemap
      const sectorsData = await fetch(`${req.protocol}://${req.get('host')}/api/sectors`);
      const sectors = sectorsData.ok ? await sectorsData.json() : [];
      
      const industriesData = await fetch(`${req.protocol}://${req.get('host')}/api/industries?limit=1000`);
      const industries = industriesData.ok ? await industriesData.json() : { industries: [] };
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const currentDate = new Date().toISOString().split('T')[0];
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">

  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Main Directory Pages -->
  <url>
    <loc>${baseUrl}/sectors</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/industries</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/companies</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Legal Pages -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/advertise</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>${baseUrl}/disclaimer</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>${baseUrl}/affiliate-disclosure</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`;

      // Add sector pages
      if (Array.isArray(sectors)) {
        sectors.forEach((sector: any) => {
          sitemap += `
  <url>
    <loc>${baseUrl}/sector/${encodeURIComponent(sector.name)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
      }

      // Add industry pages (limited to prevent huge sitemap)
      if (industries.industries && Array.isArray(industries.industries)) {
        industries.industries.slice(0, 500).forEach((industry: any) => {
          sitemap += `
  <url>
    <loc>${baseUrl}/industry/${encodeURIComponent(industry.name)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });
      }

      sitemap += `
</urlset>`;

      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Robots.txt (served from public folder, but can add dynamic parts if needed)
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /*?

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml

Crawl-delay: 1`);
  });

  // Rich Search Results Test endpoint
  app.get('/rich-search-test', async (req, res) => {
    res.set('Content-Type', 'application/json');
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "COMCUBES Global Business Directory",
      "alternateName": ["COMCUBES", "Commercial Cubes"],
      "description": "Global business directory featuring companies, industries, and business sectors worldwide",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-xxx-xxx-xxxx",
        "contactType": "Customer Service",
        "availableLanguage": "English"
      },
      "sameAs": [
        "https://twitter.com/comcubes",
        "https://linkedin.com/company/comcubes"
      ],
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    res.json(structuredData);
  });
}