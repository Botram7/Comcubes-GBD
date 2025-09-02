import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';

export function AffiliateDisclosureBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [, setLocation] = useLocation();
  
  // Check if user has previously dismissed the banner
  useEffect(() => {
    const dismissed = localStorage.getItem('affiliate-banner-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('affiliate-banner-dismissed', 'true');
  };

  const handleLearnMore = () => {
    setLocation('/affiliate-disclosure');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <ExternalLink className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-sm text-blue-800">
            <span className="font-medium">Disclosure:</span> This site uses affiliate links, meaning we may earn a commission if you click and make a purchase, at no extra cost to you.{' '}
            <button
              onClick={handleLearnMore}
              className="text-blue-600 underline hover:text-blue-800 font-medium"
            >
              Learn more
            </button>
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-4 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
          aria-label="Close affiliate disclosure banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}