import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'business.business';
  twitterCard?: 'summary' | 'summary_large_image';
  jsonLd?: object;
  additionalMeta?: Array<{ name: string; content: string }>;
}

export function SEOHead({
  title = 'COMCUBES - Global Business Directory | Find Companies, Industries & Business Sectors',
  description = 'Discover over 2,000 companies across 180+ industries in COMCUBES Global Business Directory. Find businesses, explore industry sectors, and connect with companies worldwide.',
  keywords = ['business directory', 'global companies', 'industry sectors', 'business listings', 'company database', 'commercial directory', 'business search', 'industry database', 'corporate directory', 'business intelligence'],
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = 'https://comcubes.com/og-image.jpg', // Will be updated when deployed
  ogType = 'website',
  twitterCard = 'summary_large_image',
  jsonLd,
  additionalMeta = []
}: SEOHeadProps) {
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Helper function to set or update meta tags
    const setMetaTag = (selector: string, content: string) => {
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (selector.includes('property=')) {
          meta.setAttribute('property', selector.split('"')[1]);
        } else if (selector.includes('name=')) {
          meta.setAttribute('name', selector.split('"')[1]);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Set basic meta tags
    setMetaTag('meta[name="description"]', description);
    setMetaTag('meta[name="keywords"]', keywords.join(', '));
    setMetaTag('meta[name="author"]', 'COMCUBES Global Business Directory');
    setMetaTag('meta[name="robots"]', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('meta[name="googlebot"]', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Open Graph tags
    setMetaTag('meta[property="og:title"]', ogTitle || title);
    setMetaTag('meta[property="og:description"]', ogDescription || description);
    setMetaTag('meta[property="og:type"]', ogType);
    setMetaTag('meta[property="og:image"]', ogImage);
    setMetaTag('meta[property="og:url"]', canonicalUrl || window.location.href);
    setMetaTag('meta[property="og:site_name"]', 'COMCUBES Global Business Directory');
    setMetaTag('meta[property="og:locale"]', 'en_US');

    // Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', twitterCard);
    setMetaTag('meta[name="twitter:title"]', ogTitle || title);
    setMetaTag('meta[name="twitter:description"]', ogDescription || description);
    setMetaTag('meta[name="twitter:image"]', ogImage);
    setMetaTag('meta[name="twitter:creator"]', '@comcubes');
    setMetaTag('meta[name="twitter:site"]', '@comcubes');

    // Additional SEO meta tags
    setMetaTag('meta[name="theme-color"]', '#3B82F6');
    setMetaTag('meta[name="msapplication-TileColor"]', '#3B82F6');
    setMetaTag('meta[name="apple-mobile-web-app-capable"]', 'yes');
    setMetaTag('meta[name="apple-mobile-web-app-status-bar-style"]', 'default');
    setMetaTag('meta[name="format-detection"]', 'telephone=no');

    // Add additional meta tags if provided
    additionalMeta.forEach(meta => {
      setMetaTag(`meta[name="${meta.name}"]`, meta.content);
    });

    // Set canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Add JSON-LD structured data
    if (jsonLd) {
      // Remove existing JSON-LD
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Add new JSON-LD
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, ogType, twitterCard, jsonLd, additionalMeta]);

  return null;
}

// Helper function to generate structured data for business listings
export const generateBusinessStructuredData = (business: {
  name: string;
  description?: string;
  industry?: string;
  sector?: string;
  url?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": business.name,
    "description": business.description || `${business.name} - Company in ${business.industry || business.sector || 'Business'} industry`,
    "url": business.url || window.location.href,
    "industry": business.industry || business.sector,
    "knowsAbout": [business.industry, business.sector].filter(Boolean),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };
};

// Helper function to generate structured data for directory pages
export const generateDirectoryStructuredData = (type: 'sectors' | 'industries' | 'companies', items?: any[]) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `COMCUBES ${type.charAt(0).toUpperCase() + type.slice(1)} Directory`,
    "description": `Browse and explore ${type} in the COMCUBES Global Business Directory`,
    "url": window.location.href,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${type.charAt(0).toUpperCase() + type.slice(1)} Directory`,
      "numberOfItems": items?.length || 0,
      "itemListElement": []
    }
  };

  if (items && items.length > 0) {
    (baseData.mainEntity as any).itemListElement = items.slice(0, 20).map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": type === 'companies' ? "Organization" : "Thing",
        "name": item.name,
        "url": `${window.location.origin}/${type === 'companies' ? 'company' : type === 'industries' ? 'industry' : 'sector'}/${encodeURIComponent(item.name)}`
      }
    }));
  }

  return baseData;
};

// Helper function to generate website structured data
export const generateWebsiteStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "COMCUBES Global Business Directory",
    "alternateName": ["COMCUBES", "Commercial Cubes"],
    "description": "Global business directory featuring companies, industries, and business sectors worldwide",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": [
      {
        "@type": "Organization",
        "name": "COMCUBES",
        "url": window.location.origin,
        "logo": `${window.location.origin}/logo.png`,
        "sameAs": [
          "https://twitter.com/comcubes",
          "https://linkedin.com/company/comcubes"
        ]
      }
    ]
  };
};