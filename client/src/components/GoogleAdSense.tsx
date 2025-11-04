import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { trackAdClick } from '@/lib/analytics';

interface GoogleAdSenseProps {
  className?: string;
  format?: 'vertical' | 'horizontal' | 'rectangle' | 'responsive';
  slot?: string;
  position?: string; // Track ad position for analytics
}

// Ad format to size mapping
const AD_FORMATS = {
  vertical: { width: 160, height: 600, style: 'display:inline-block;width:160px;height:600px' },
  horizontal: { width: 728, height: 90, style: 'display:inline-block;width:728px;height:90px' },
  rectangle: { width: 300, height: 250, style: 'display:inline-block;width:300px;height:250px' },
  responsive: { width: 'auto', height: 'auto', style: 'display:block' },
};

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export function GoogleAdSense({ 
  className = "", 
  format = 'vertical',
  slot = 'XXXXXXXXXX',
  position = 'sidebar'
}: GoogleAdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXX'); // Will be replaced with env var
      document.head.appendChild(script);
    }

    // Initialize ad after script loads
    const initializeAd = () => {
      try {
        if (window.adsbygoogle && adRef.current) {
          // Push ad to AdSense queue
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      } catch (error) {
        console.error('AdSense initialization error:', error);
        setAdError(true);
      }
    };

    // Wait a bit for script to load
    const timer = setTimeout(initializeAd, 100);
    return () => clearTimeout(timer);
  }, []);

  // Track ad clicks
  const handleAdClick = () => {
    trackAdClick('adsense', position, slot);
  };

  const formatConfig = AD_FORMATS[format];

  // Show error fallback if ad fails to load
  if (adError) {
    return (
      <div className={className}>
        <Card 
          className="bg-gray-50 border-2 border-dashed border-gray-200 p-4 text-center"
          style={{ 
            width: format === 'responsive' ? '100%' : `${formatConfig.width}px`,
            height: format === 'responsive' ? 'auto' : `${formatConfig.height}px`,
            minHeight: format === 'responsive' ? '250px' : undefined
          }}
        >
          <div className="text-gray-400 text-sm">Advertisement</div>
        </Card>
      </div>
    );
  }

  return (
    <div className={className} ref={adRef} onClick={handleAdClick}>
      <ins 
        className="adsbygoogle"
        style={{ ...(formatConfig.style as any) }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format === 'responsive' ? 'auto' : undefined}
        data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
      ></ins>
    </div>
  );
}

// Helper component for non-intrusive in-content ads
export function InContentAd({ className = "" }: { className?: string }) {
  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <GoogleAdSense 
        format="horizontal" 
        position="in-content"
        className="max-w-full overflow-hidden"
      />
    </div>
  );
}
