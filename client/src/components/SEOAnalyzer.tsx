import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, Search, BarChart3, Globe, Share2, Smartphone, Zap } from 'lucide-react';

interface SEOScore {
  category: string;
  score: number;
  maxScore: number;
  items: SEOItem[];
  icon: any;
}

interface SEOItem {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  value?: string;
}

export function SEOAnalyzer({ isVisible = false }: { isVisible?: boolean }) {
  const [seoScores, setSeoScores] = useState<SEOScore[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(isVisible);

  const analyzeSEO = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay for realism
    setTimeout(() => {
      const scores = performSEOAnalysis();
      setSeoScores(scores);
      
      // Calculate overall score
      const totalScore = scores.reduce((acc, category) => acc + category.score, 0);
      const totalMaxScore = scores.reduce((acc, category) => acc + category.maxScore, 0);
      setOverallScore(Math.round((totalScore / totalMaxScore) * 100));
      
      setIsAnalyzing(false);
    }, 1500);
  };

  const performSEOAnalysis = (): SEOScore[] => {
    const results: SEOScore[] = [];

    // Technical SEO Analysis
    const technicalItems: SEOItem[] = [];
    
    // Check meta title
    const title = document.title;
    technicalItems.push({
      name: 'Page Title',
      status: title && title.length >= 30 && title.length <= 60 ? 'pass' : title ? 'warning' : 'fail',
      description: title ? `Title length: ${title.length} characters` : 'Missing page title',
      value: title || 'Not found'
    });

    // Check meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    technicalItems.push({
      name: 'Meta Description',
      status: metaDesc && metaDesc.length >= 120 && metaDesc.length <= 160 ? 'pass' : metaDesc ? 'warning' : 'fail',
      description: metaDesc ? `Description length: ${metaDesc.length} characters` : 'Missing meta description',
      value: metaDesc || 'Not found'
    });

    // Check meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
    technicalItems.push({
      name: 'Meta Keywords',
      status: metaKeywords && metaKeywords.split(',').length >= 5 ? 'pass' : 'warning',
      description: metaKeywords ? `${metaKeywords.split(',').length} keywords found` : 'Keywords not optimized',
      value: metaKeywords ? `${metaKeywords.split(',').length} keywords` : 'Not found'
    });

    // Check viewport
    const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
    technicalItems.push({
      name: 'Mobile Viewport',
      status: viewport?.includes('width=device-width') ? 'pass' : 'fail',
      description: viewport ? 'Viewport meta tag configured' : 'Missing viewport configuration',
      value: viewport || 'Not configured'
    });

    // Check robots
    const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content');
    technicalItems.push({
      name: 'Robots Meta',
      status: robots?.includes('index') ? 'pass' : 'warning',
      description: robots ? 'Robots meta tag found' : 'Default robots behavior',
      value: robots || 'Default'
    });

    results.push({
      category: 'Technical SEO',
      score: technicalItems.filter(item => item.status === 'pass').length,
      maxScore: technicalItems.length,
      items: technicalItems,
      icon: Zap
    });

    // Content SEO Analysis
    const contentItems: SEOItem[] = [];

    // Check H1 tags
    const h1Tags = document.querySelectorAll('h1');
    contentItems.push({
      name: 'H1 Tags',
      status: h1Tags.length === 1 ? 'pass' : h1Tags.length > 1 ? 'warning' : 'fail',
      description: `${h1Tags.length} H1 tag${h1Tags.length !== 1 ? 's' : ''} found`,
      value: h1Tags.length > 0 ? Array.from(h1Tags).map(h1 => h1.textContent).join(', ') : 'None'
    });

    // Check heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    contentItems.push({
      name: 'Heading Structure',
      status: headings.length >= 3 ? 'pass' : headings.length >= 1 ? 'warning' : 'fail',
      description: `${headings.length} headings found`,
      value: `${headings.length} headings`
    });

    // Check images with alt text
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.alt && img.alt.trim() !== '');
    contentItems.push({
      name: 'Image Alt Text',
      status: images.length === 0 ? 'pass' : imagesWithAlt.length === images.length ? 'pass' : 'warning',
      description: `${imagesWithAlt.length}/${images.length} images have alt text`,
      value: `${imagesWithAlt.length}/${images.length} optimized`
    });

    // Check internal links
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    contentItems.push({
      name: 'Internal Links',
      status: internalLinks.length >= 5 ? 'pass' : internalLinks.length >= 2 ? 'warning' : 'fail',
      description: `${internalLinks.length} internal links found`,
      value: `${internalLinks.length} links`
    });

    results.push({
      category: 'Content SEO',
      score: contentItems.filter(item => item.status === 'pass').length,
      maxScore: contentItems.length,
      items: contentItems,
      icon: Search
    });

    // Social Media & Open Graph
    const socialItems: SEOItem[] = [];

    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    socialItems.push({
      name: 'Open Graph Title',
      status: ogTitle ? 'pass' : 'fail',
      description: ogTitle ? 'OG title configured' : 'Missing OG title',
      value: ogTitle || 'Not set'
    });

    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    socialItems.push({
      name: 'Open Graph Description',
      status: ogDescription ? 'pass' : 'fail',
      description: ogDescription ? 'OG description configured' : 'Missing OG description',
      value: ogDescription || 'Not set'
    });

    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    socialItems.push({
      name: 'Open Graph Image',
      status: ogImage ? 'pass' : 'warning',
      description: ogImage ? 'OG image configured' : 'Missing OG image',
      value: ogImage || 'Not set'
    });

    const twitterCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
    socialItems.push({
      name: 'Twitter Card',
      status: twitterCard ? 'pass' : 'warning',
      description: twitterCard ? 'Twitter card configured' : 'Missing Twitter card',
      value: twitterCard || 'Not set'
    });

    results.push({
      category: 'Social Media',
      score: socialItems.filter(item => item.status === 'pass').length,
      maxScore: socialItems.length,
      items: socialItems,
      icon: Share2
    });

    // Performance & Technical
    const performanceItems: SEOItem[] = [];

    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    performanceItems.push({
      name: 'Canonical URL',
      status: canonical ? 'pass' : 'warning',
      description: canonical ? 'Canonical URL set' : 'Missing canonical URL',
      value: canonical || 'Not set'
    });

    const structuredData = document.querySelector('script[type="application/ld+json"]');
    performanceItems.push({
      name: 'Structured Data',
      status: structuredData ? 'pass' : 'fail',
      description: structuredData ? 'JSON-LD structured data found' : 'Missing structured data',
      value: structuredData ? 'Present' : 'Not found'
    });

    const manifest = document.querySelector('link[rel="manifest"]');
    performanceItems.push({
      name: 'PWA Manifest',
      status: manifest ? 'pass' : 'warning',
      description: manifest ? 'Web app manifest configured' : 'Missing PWA manifest',
      value: manifest ? 'Present' : 'Not found'
    });

    const themeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute('content');
    performanceItems.push({
      name: 'Theme Color',
      status: themeColor ? 'pass' : 'warning',
      description: themeColor ? 'Theme color configured' : 'Missing theme color',
      value: themeColor || 'Not set'
    });

    results.push({
      category: 'Performance',
      score: performanceItems.filter(item => item.status === 'pass').length,
      maxScore: performanceItems.length,
      items: performanceItems,
      icon: BarChart3
    });

    return results;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (showAnalyzer) {
      analyzeSEO();
    }
  }, [showAnalyzer]);

  // Only show SEO Score button in development environment
  // Only show in development - use multiple environment checks for reliability
  const isDevelopment = import.meta.env.DEV || 
                       import.meta.env.MODE === 'development' || 
                       import.meta.env.VITE_NODE_ENV === 'development' ||
                       window.location.hostname === 'localhost' ||
                       window.location.hostname.includes('replit.dev');
  
  if (!showAnalyzer && isDevelopment) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowAnalyzer(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full px-4 py-2"
          size="sm"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          SEO Score
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden">
      <Card className="shadow-2xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              SEO Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full border-2 font-bold text-lg ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalyzer(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          </div>
          
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm">Analyzing SEO...</span>
            </div>
          ) : (
            <Button
              onClick={analyzeSEO}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              Re-analyze
            </Button>
          )}
        </CardHeader>

        {!isAnalyzing && seoScores.length > 0 && (
          <CardContent className="pt-0 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {seoScores.map((category, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-sm">{category.category}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.score}/{category.maxScore}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2 text-xs">
                        {getStatusIcon(item.status)}
                        <span className="flex-1 truncate" title={item.description}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
                <div className="text-xs text-blue-800">
                  <strong>SEO Health:</strong> {overallScore >= 90 ? 'Excellent' : overallScore >= 70 ? 'Good' : 'Needs Improvement'}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {overallScore >= 90 
                    ? 'Your page is well-optimized for search engines!' 
                    : overallScore >= 70 
                    ? 'Good SEO foundation with room for improvement.' 
                    : 'Several SEO issues need attention for better rankings.'}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}