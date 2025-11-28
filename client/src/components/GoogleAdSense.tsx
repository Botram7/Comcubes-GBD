import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { trackAdClick } from '@/lib/analytics';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

interface GoogleAdSenseProps {
  className?: string;
  format?: 'vertical' | 'horizontal' | 'rectangle' | 'responsive';
  slot?: string;
  position?: string;
}

const AD_FORMATS = {
  vertical: { 
    width: 160, 
    height: 600, 
    style: { display: 'inline-block', width: '160px', height: '600px' } 
  },
  horizontal: { 
    width: 728, 
    height: 90, 
    style: { display: 'inline-block', width: '728px', height: '90px' } 
  },
  rectangle: { 
    width: 300, 
    height: 250, 
    style: { display: 'inline-block', width: '300px', height: '250px' } 
  },
  responsive: { 
    width: 'auto', 
    height: 'auto', 
    style: { display: 'block' } 
  },
};

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXX';

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
  const { hasConsented, preferences } = useCookieConsent();

  useEffect(() => {
    if (!hasConsented || !preferences.marketing) {
      return;
    }

    if (!ADSENSE_CLIENT_ID || ADSENSE_CLIENT_ID === 'ca-pub-XXXXXXXXXX') {
      console.warn('AdSense client ID not configured');
      setAdError(true);
      return;
    }

    const initializeAd = () => {
      try {
        if (window.adsbygoogle && adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      } catch (error) {
        console.error('AdSense initialization error:', error);
        setAdError(true);
      }
    };

    const timer = setTimeout(initializeAd, 500);
    return () => clearTimeout(timer);
  }, [hasConsented, preferences.marketing]);

  const handleAdClick = () => {
    trackAdClick('adsense', position, slot);
  };

  const formatConfig = AD_FORMATS[format];

  if (!hasConsented || !preferences.marketing) {
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
          <div className="text-gray-300 text-xs mt-1">Enable marketing cookies to view ads</div>
        </Card>
      </div>
    );
  }

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
        style={formatConfig.style}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format === 'responsive' ? 'auto' : undefined}
        data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
      ></ins>
    </div>
  );
}

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
