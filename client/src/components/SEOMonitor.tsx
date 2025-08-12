import { useEffect, useState } from 'react';

interface SEOMetrics {
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogTags: Record<string, string>;
  structuredData: any;
  headingStructure: { level: number; text: string }[];
  imageOptimization: { total: number; withAlt: number };
  internalLinks: number;
  externalLinks: number;
  pageLoadTime: number;
}

interface SEOMonitorProps {
  enabled?: boolean;
}

export function SEOMonitor({ enabled = true }: SEOMonitorProps) {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    const analyzePageSEO = () => {
      const startTime = performance.now();

      // Analyze page title
      const pageTitle = document.title;

      // Analyze meta description
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

      // Analyze keywords
      const keywordsTag = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
      const keywords = keywordsTag.split(',').map(k => k.trim()).filter(k => k);

      // Analyze canonical URL
      const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

      // Analyze Open Graph tags
      const ogTags: Record<string, string> = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(meta => {
        const property = meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (property && content) {
          ogTags[property] = content;
        }
      });

      // Analyze structured data
      let structuredData = null;
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        try {
          structuredData = JSON.parse(jsonLdScript.textContent || '');
        } catch (e) {
          console.warn('Invalid JSON-LD structured data');
        }
      }

      // Analyze heading structure
      const headingStructure: { level: number; text: string }[] = [];
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        headingStructure.push({
          level: parseInt(heading.tagName.substring(1)),
          text: heading.textContent || ''
        });
      });

      // Analyze image optimization
      const images = document.querySelectorAll('img');
      const imageOptimization = {
        total: images.length,
        withAlt: Array.from(images).filter(img => img.getAttribute('alt')).length
      };

      // Analyze links
      const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="#"]').length;
      const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])').length;

      // Calculate page load time
      const pageLoadTime = performance.now() - startTime;

      setMetrics({
        pageTitle,
        metaDescription,
        keywords,
        canonicalUrl,
        ogTags,
        structuredData,
        headingStructure,
        imageOptimization,
        internalLinks,
        externalLinks,
        pageLoadTime
      });
    };

    // Initial analysis
    analyzePageSEO();

    // Re-analyze on navigation
    const observer = new MutationObserver(() => {
      setTimeout(analyzePageSEO, 100);
    });

    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled || process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  const getSEOScore = () => {
    let score = 0;
    let maxScore = 0;

    // Page title (20 points)
    maxScore += 20;
    if (metrics.pageTitle) {
      if (metrics.pageTitle.length >= 30 && metrics.pageTitle.length <= 60) score += 20;
      else if (metrics.pageTitle.length > 0) score += 10;
    }

    // Meta description (20 points)
    maxScore += 20;
    if (metrics.metaDescription) {
      if (metrics.metaDescription.length >= 120 && metrics.metaDescription.length <= 160) score += 20;
      else if (metrics.metaDescription.length > 0) score += 10;
    }

    // Keywords (10 points)
    maxScore += 10;
    if (metrics.keywords.length >= 5) score += 10;
    else if (metrics.keywords.length > 0) score += 5;

    // Canonical URL (10 points)
    maxScore += 10;
    if (metrics.canonicalUrl) score += 10;

    // Open Graph tags (15 points)
    maxScore += 15;
    const requiredOgTags = ['og:title', 'og:description', 'og:type', 'og:url'];
    const presentOgTags = requiredOgTags.filter(tag => metrics.ogTags[tag]);
    score += (presentOgTags.length / requiredOgTags.length) * 15;

    // Structured data (10 points)
    maxScore += 10;
    if (metrics.structuredData) score += 10;

    // Heading structure (10 points)
    maxScore += 10;
    const hasH1 = metrics.headingStructure.some(h => h.level === 1);
    const hasH2 = metrics.headingStructure.some(h => h.level === 2);
    if (hasH1 && hasH2) score += 10;
    else if (hasH1) score += 5;

    // Image optimization (5 points)
    maxScore += 5;
    if (metrics.imageOptimization.total === 0) score += 5;
    else score += (metrics.imageOptimization.withAlt / metrics.imageOptimization.total) * 5;

    return Math.round((score / maxScore) * 100);
  };

  const seoScore = getSEOScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 ${
          isVisible ? 'w-96 max-h-96 overflow-y-auto' : 'w-16 h-16 overflow-hidden cursor-pointer'
        }`}
        onClick={() => !isVisible && setIsVisible(true)}
      >
        {!isVisible ? (
          <div className="flex items-center justify-center h-16">
            <div className="text-center">
              <div className={`text-sm font-bold ${getScoreColor(seoScore)}`}>SEO</div>
              <div className={`text-xs ${getScoreColor(seoScore)}`}>{seoScore}%</div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">SEO Monitor</h3>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>SEO Score:</span>
                <span className={`font-bold ${getScoreColor(seoScore)}`}>{seoScore}%</span>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span>Title Length:</span>
                  <span className={metrics.pageTitle.length >= 30 && metrics.pageTitle.length <= 60 ? 'text-green-600' : 'text-yellow-600'}>
                    {metrics.pageTitle.length}/60
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Description Length:</span>
                  <span className={metrics.metaDescription.length >= 120 && metrics.metaDescription.length <= 160 ? 'text-green-600' : 'text-yellow-600'}>
                    {metrics.metaDescription.length}/160
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Keywords:</span>
                  <span className={metrics.keywords.length >= 5 ? 'text-green-600' : 'text-yellow-600'}>
                    {metrics.keywords.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Canonical URL:</span>
                  <span className={metrics.canonicalUrl ? 'text-green-600' : 'text-red-600'}>
                    {metrics.canonicalUrl ? '✓' : '✗'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Open Graph:</span>
                  <span className={Object.keys(metrics.ogTags).length >= 4 ? 'text-green-600' : 'text-yellow-600'}>
                    {Object.keys(metrics.ogTags).length}/4
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Structured Data:</span>
                  <span className={metrics.structuredData ? 'text-green-600' : 'text-red-600'}>
                    {metrics.structuredData ? '✓' : '✗'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>H1 Tags:</span>
                  <span className={metrics.headingStructure.filter(h => h.level === 1).length === 1 ? 'text-green-600' : 'text-yellow-600'}>
                    {metrics.headingStructure.filter(h => h.level === 1).length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Images with Alt:</span>
                  <span className={metrics.imageOptimization.total === 0 || metrics.imageOptimization.withAlt === metrics.imageOptimization.total ? 'text-green-600' : 'text-yellow-600'}>
                    {metrics.imageOptimization.withAlt}/{metrics.imageOptimization.total}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Internal Links:</span>
                  <span className="text-blue-600">{metrics.internalLinks}</span>
                </div>

                <div className="flex justify-between">
                  <span>External Links:</span>
                  <span className="text-blue-600">{metrics.externalLinks}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}