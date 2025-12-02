import { useEffect } from 'react';

// Canonical domain configuration - ensures consistent URLs across all pages
const CANONICAL_DOMAIN = 'https://comcubes.com';

// Brand keywords for SEO coverage - capturing common misspellings and variations
export const BRAND_KEYWORDS = [
  'comcubes', 'COMCUBES', 'ComCubes',
  'comcube', 'Comcube', 'COMCUBE',
  'concube', 'Concube', 'CONCUBE',
  'concubes', 'Concubes', 'CONCUBES',
  'com cubes', 'com cube',
  'commercial cubes', 'Commercial Cubes',
  'comcubes business directory',
  'comcubes global directory',
  'comcubes GBD'
];

// Utility function to get canonical URL for current path
const getCanonicalUrl = (path?: string): string => {
  const currentPath = path || window.location.pathname;
  // Ensure path starts with / and normalize any edge cases
  const normalizedPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
  // Always use canonical domain regardless of current host
  return `${CANONICAL_DOMAIN}${normalizedPath}`;
};

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
  additionalStructuredData?: object[];
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
  structuredData,
  additionalStructuredData = []
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
    
    // Enhanced canonical URL implementation for stronger domain consolidation
    const finalCanonicalUrl = canonicalUrl || getCanonicalUrl();
    
    // Set canonical link - primary canonicalization signal
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = finalCanonicalUrl;
    
    // Additional canonicalization signals
    setMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMetaTag('og:url', finalCanonicalUrl, 'property');
    setMetaTag('twitter:url', finalCanonicalUrl);
    
    // Add rel="alternate" for HTTPS version if not already HTTPS
    if (!finalCanonicalUrl.startsWith('https://')) {
      const httpsUrl = finalCanonicalUrl.replace('http://', 'https://');
      let alternateLink = document.querySelector('link[rel="alternate"][href*="https://"]') as HTMLLinkElement;
      if (!alternateLink) {
        alternateLink = document.createElement('link');
        alternateLink.rel = 'alternate';
        alternateLink.href = httpsUrl;
        document.head.appendChild(alternateLink);
      }
    }
    
    // Ensure domain preference signals
    setMetaTag('web_author', 'COMCUBES');
    setMetaTag('identifier-URL', CANONICAL_DOMAIN);
    
    // Structured Data (JSON-LD) - Primary schema
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

    // Additional Structured Data (JSON-LD) - Multiple schemas support
    if (additionalStructuredData && additionalStructuredData.length > 0) {
      // Remove old additional structured data scripts
      document.querySelectorAll('script[type="application/ld+json"][id^="additional-structured-data-"]').forEach(el => el.remove());
      
      // Add new additional structured data scripts
      additionalStructuredData.forEach((data, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `additional-structured-data-${index}`;
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }
    
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, ogType, twitterTitle, twitterDescription, twitterImage, structuredData, additionalStructuredData]);

  return null;
}

// Predefined structured data templates
export const createBusinessDirectoryStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "COMCUBES Global Business Directory",
  "alternateName": "COMCUBES",
  "url": CANONICAL_DOMAIN,
  "description": "Global business directory featuring thousands of companies across all industries and business sectors worldwide.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${CANONICAL_DOMAIN}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "COMCUBES",
    "url": CANONICAL_DOMAIN,
    "sameAs": []
  }
});

export const createOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "COMCUBES",
  "alternateName": "Commercial Cubes",
  "url": CANONICAL_DOMAIN,
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

// FAQ Schema for homepage and informational pages
export const createFAQStructuredData = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// ItemList Schema for directory listings (sectors, industries, companies)
export const createItemListStructuredData = (
  items: Array<{name: string, url: string, description?: string, position?: number}>,
  listName: string,
  listUrl: string
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": listName,
  "url": listUrl,
  "numberOfItems": items.length,
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": item.position || index + 1,
    "name": item.name,
    "url": item.url,
    ...(item.description && { "description": item.description })
  }))
});

// Place Schema for geographic pages
export const createPlaceStructuredData = (
  placeName: string,
  placeType: 'Continent' | 'Country' | 'AdministrativeArea',
  url: string,
  description?: string,
  containedIn?: string
) => ({
  "@context": "https://schema.org",
  "@type": "Place",
  "name": placeName,
  "additionalType": placeType,
  "url": url,
  ...(description && { "description": description }),
  ...(containedIn && { "containedInPlace": { "@type": "Place", "name": containedIn } })
});

// CollectionPage Schema for company/industry listings
export const createCollectionPageStructuredData = (
  pageName: string,
  pageDescription: string,
  pageUrl: string,
  items: Array<{name: string, url?: string, description?: string}>,
  breadcrumbs: Array<{name: string, url: string}>
) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": pageName,
  "description": pageDescription,
  "url": pageUrl,
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": items.slice(0, 20).map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": item.name,
        ...(item.url && { "url": item.url }),
        ...(item.description && { "description": item.description })
      }
    }))
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  }
});

// LocalBusiness Schema for company detail pages  
export const createLocalBusinessStructuredData = (
  company: {
    name: string;
    description?: string;
    url?: string;
    industry?: string;
    country?: string;
    address?: string;
  }
) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": company.name,
  ...(company.description && { "description": company.description }),
  ...(company.url && { "url": company.url }),
  ...(company.industry && { "industry": company.industry }),
  ...(company.country && { 
    "address": {
      "@type": "PostalAddress",
      "addressCountry": company.country,
      ...(company.address && { "streetAddress": company.address })
    }
  })
});

// Homepage FAQ content for structured data
export const HOMEPAGE_FAQS = [
  {
    question: "What is COMCUBES?",
    answer: "COMCUBES (Commercial Cubes) is a comprehensive global business directory that helps you discover companies across 20 major business sectors and 400+ specialized industries. Whether you're a business professional, job seeker, researcher, or shopper, COMCUBES provides instant access to 7,400+ curated company listings plus global search capabilities to find businesses anywhere in the world."
  },
  {
    question: "How do I search for companies on COMCUBES?",
    answer: "You can search for companies in multiple ways: Use the search bar at the top of any page for quick searches, browse by business sector to explore industries within each category, use our geography feature to find businesses by location (continent, region, or country), or use the Advanced Search page for more detailed filtering options."
  },
  {
    question: "Is COMCUBES free to use?",
    answer: "Yes, COMCUBES is completely free to use for searching and discovering businesses. You can browse sectors, industries, companies, and geographic locations without any cost. We also offer premium listing options for businesses that want enhanced visibility in our directory."
  },
  {
    question: "How can I list my company on COMCUBES?",
    answer: "To list your company on COMCUBES, visit our 'List Your Company' page and complete the listing form. You'll need to provide your company name, industry, website, and other relevant details. Our team will review your submission and add your company to the appropriate sector and industry category."
  },
  {
    question: "What types of businesses are listed on COMCUBES?",
    answer: "COMCUBES features businesses across all major sectors including Technology, Healthcare and Pharmaceuticals, Banking and Financial Services, Manufacturing, Retail, Energy and Utilities, and many more. Our directory includes Fortune 500 companies, international corporations, and businesses of all sizes from around the world."
  },
  {
    question: "Can I find businesses by location?",
    answer: "Yes! Our Geography feature allows you to browse businesses by location. You can explore companies by continent, then drill down to specific regions and countries. This is perfect for finding local services, researching international markets, or discovering businesses in specific geographic areas."
  }
];