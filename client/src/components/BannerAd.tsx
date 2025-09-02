import { Card } from "@/components/ui/card";
import { useLocation } from 'wouter';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface BannerAdProps {
  className?: string;
  position: 'left' | 'right'; // Position for fetching correct banner ads
}

// Analytics tracking function
const trackAdEvent = async (bannerId: number, eventType: 'impression' | 'view' | 'click', imageUrl?: string) => {
  try {
    await apiRequest('POST', '/api/analytics/track', {
      bannerId,
      eventType,
      imageUrl,
      referrerPage: window.location.pathname,
    });
  } catch (error) {
    console.warn('Failed to track ad event:', error);
  }
};

export function BannerAd({ className = "", position }: BannerAdProps) {
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const adRef = useRef<HTMLDivElement>(null);
  const impressionTracked = useRef(false);
  const viewTracked = useRef(false);
  
  // Fetch banner ads from API
  const { data: bannerAds, isLoading } = useQuery({
    queryKey: ['/api/banner-ads'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Find the banner ad for this position
  const bannerAd = Array.isArray(bannerAds) ? bannerAds.find((ad: any) => ad.position === position) : undefined;
  const images = bannerAd?.images || [];
  const imageUrls = bannerAd?.imageUrls || [];
  const clickUrl = bannerAd?.clickUrl;
  const rotationInterval = bannerAd?.rotationInterval || 7000;
  const bannerId = bannerAd?.id;
  
  // Ensure images is always an array and filter out empty/null images
  const validImages = Array.isArray(images) ? images.filter(img => img && img.trim() !== '') : [];
  
  // Track impression when banner loads
  useEffect(() => {
    if (bannerId && validImages.length > 0 && !impressionTracked.current) {
      impressionTracked.current = true;
      trackAdEvent(bannerId, 'impression', validImages[currentImageIndex]);
    }
  }, [bannerId, validImages.length, currentImageIndex]);

  // Track view when banner comes into viewport
  useEffect(() => {
    if (!bannerId || validImages.length === 0 || viewTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !viewTracked.current) {
            viewTracked.current = true;
            trackAdEvent(bannerId, 'view', validImages[currentImageIndex]);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the ad is visible
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [bannerId, validImages, currentImageIndex]);
  
  // Rotate images based on configured interval
  useEffect(() => {
    if (validImages.length <= 1 || rotationInterval === 0) return; // No rotation for single image or static setting
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % validImages.length;
        // Track impression for new image
        if (bannerId) {
          trackAdEvent(bannerId, 'impression', validImages[newIndex]);
        }
        return newIndex;
      });
    }, rotationInterval);
    
    return () => clearInterval(interval);
  }, [validImages.length, bannerId, rotationInterval]);
  
  const handleClick = async () => {
    // Track click event
    if (bannerId && validImages.length > 0) {
      await trackAdEvent(bannerId, 'click', validImages[currentImageIndex]);
    }
    
    // Use individual image URL if available, otherwise fall back to general clickUrl
    const targetUrl = imageUrls[currentImageIndex] || clickUrl;
    
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      setLocation('/advertise');
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={`${className}`} ref={adRef}>
        <Card 
          className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 text-center animate-pulse"
          style={{ width: '160px', height: '600px' }}
        >
          <div className="text-gray-400 h-full flex flex-col justify-center">
            <div className="text-sm font-medium mb-2">Loading...</div>
          </div>
        </Card>
      </div>
    );
  }

  // If no images are provided, show the default "Available for Rent" banner
  if (validImages.length === 0) {
    return (
      <div className={`${className}`} ref={adRef}>
        {/* Advertisement Space - 160x600 dimensions */}
        <Card 
          className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:bg-gray-200 transition-colors"
          style={{ width: '160px', height: '600px' }}
          onClick={handleClick}
        >
          <div className="text-gray-500 h-full flex flex-col justify-center">
            <div className="text-sm font-medium mb-2">Advertisement Space</div>
            <div className="text-sm opacity-75 mb-4">Available for Rent</div>
            <div className="bg-gray-200 rounded px-4 py-2 text-sm font-medium">
              Contact Us
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  // Show rotating banner ads
  return (
    <div className={`${className}`} ref={adRef}>
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 group"
        style={{ width: '160px', height: '600px' }}
        onClick={handleClick}
      >
        <div className="relative w-full h-full">
          <img 
            src={validImages[currentImageIndex]}
            alt={`Banner Ad ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // If image fails to load, try to show next image or fallback
              console.warn(`Failed to load banner image: ${validImages[currentImageIndex]}`);
              e.currentTarget.src = '/api/placeholder/160/600?text=Ad+Error';
            }}
          />
          
          {/* Image counter indicator */}
          {validImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <span>{currentImageIndex + 1} / {validImages.length}</span>
              {rotationInterval === 0 && (
                <span title="Static mode - no auto rotation">🔒</span>
              )}
            </div>
          )}
          
          {/* Smooth transition overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
        </div>
      </Card>
    </div>
  );
}

// Default banner ad images - you can replace these with actual ad images
export const DEFAULT_BANNER_IMAGES = [
  // Add your banner image URLs here
  // Example:
  // '/uploads/banner1.jpg',
  // '/uploads/banner2.jpg',
  // '/uploads/banner3.jpg',
];

// Helper function to create banner ads with default or custom images
export function createBannerAd(images?: string[], clickUrl?: string) {
  return { images: images || DEFAULT_BANNER_IMAGES, clickUrl };
}