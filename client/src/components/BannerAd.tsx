import { Card } from "@/components/ui/card";
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';

interface BannerAdProps {
  className?: string;
  images?: string[]; // Array of up to 10 image URLs
  clickUrl?: string; // URL to navigate to when banner is clicked
}

export function BannerAd({ className = "", images = [], clickUrl }: BannerAdProps) {
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Filter out empty/null images and ensure we have valid images
  const validImages = images.filter(img => img && img.trim() !== '');
  
  // Rotate images every 7 seconds
  useEffect(() => {
    if (validImages.length <= 1) return; // No need to rotate if 0 or 1 image
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % validImages.length
      );
    }, 7000); // 7 seconds
    
    return () => clearInterval(interval);
  }, [validImages.length]);
  
  const handleClick = () => {
    if (clickUrl) {
      window.open(clickUrl, '_blank', 'noopener,noreferrer');
    } else {
      setLocation('/advertise');
    }
  };
  
  // If no images are provided, show the default "Available for Rent" banner
  if (validImages.length === 0) {
    return (
      <div className={`${className}`}>
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
    <div className={`${className}`}>
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
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              {currentImageIndex + 1} / {validImages.length}
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