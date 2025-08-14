import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: object;
}

export function SEOHead({
  title = "COMCUBES - Global Business Directory | Find Companies, Industries & Business Sectors",
  description = "Discover thousands of companies across all business sectors and industries worldwide. COMCUBES is your comprehensive global business directory for everything and anything business.",
  keywords = [
    "business directory", 
    "global companies", 
    "business sectors", 
    "industries", 
    "company listings", 
    "business search", 
    "commercial directory", 
    "worldwide businesses", 
    "corporate directory", 
    "industry directory",
    "business database",
    "company finder",
    "business networking",
    "B2B directory",
    "commercial cubes"
  ],
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = "/api/og-image",
  ogType = "website",
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData
}: SEOHeadProps) {
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Helper function to set or update meta tags
    const setMetaTag = (property: string, content: string, nameAttr = 'name') => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[${nameAttr}="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(nameAttr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic SEO meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords.join(', '));
    setMetaTag('author', 'COMCUBES Global Business Directory');
    setMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMetaTag('googlebot', 'index, follow');
    setMetaTag('language', 'English');
    setMetaTag('revisit-after', '7 days');
    
    // Open Graph tags
    setMetaTag('og:title', ogTitle || title, 'property');
    setMetaTag('og:description', ogDescription || description, 'property');
    setMetaTag('og:image', ogImage, 'property');
    setMetaTag('og:type', ogType, 'property');
    setMetaTag('og:site_name', 'COMCUBES', 'property');
    setMetaTag('og:locale', 'en_US', 'property');
    
    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', twitterTitle || ogTitle || title);
    setMetaTag('twitter:description', twitterDescription || ogDescription || description);
    setMetaTag('twitter:image', twitterImage || ogImage);
    setMetaTag('twitter:creator', '@comcubes');
    setMetaTag('twitter:site', '@comcubes');
    
    // Additional SEO tags
    setMetaTag('theme-color', '#1e40af');
    setMetaTag('msapplication-TileColor', '#1e40af');
    
    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }
    
    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]#structured-data');
      if (!script) {
        script = document.createElement('script');
        (script as HTMLScriptElement).type = 'application/ld+json';
        script.id = 'structured-data';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
    
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, ogType, twitterTitle, twitterDescription, twitterImage, structuredData]);

  return null;
}

// Predefined structured data templates
export const createBusinessDirectoryStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "COMCUBES Global Business Directory",
  "alternateName": "COMCUBES",
  "url": window.location.origin,
  "description": "Global business directory featuring thousands of companies across all industries and business sectors worldwide.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "COMCUBES",
    "url": window.location.origin,
    "sameAs": []
  }
});

export const createOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "COMCUBES",
  "alternateName": "Commercial Cubes",
  "url": window.location.origin,
  "description": "Global business directory platform connecting businesses worldwide",
  "foundingDate": "2025",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "contact-cgbd@comcubes.com"
  },
  "sameAs": []
});

export const createBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});