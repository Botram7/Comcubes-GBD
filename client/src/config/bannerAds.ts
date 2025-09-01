// Banner Ad Configuration
// This file manages all banner advertisements across the COMCUBES website

export interface BannerAdConfig {
  id: string;
  name: string;
  images: string[];
  clickUrl?: string;
  isActive: boolean;
}

// LEFT SIDE BANNER ADS CONFIGURATION
export const LEFT_BANNER_ADS: BannerAdConfig = {
  id: 'left-main',
  name: 'Left Sidebar Banner',
  images: [
    // Replace these URLs with your actual banner image URLs
    // You can upload images to /uploads/ directory or use external URLs
    
    // Example with external placeholder images (replace these):
    'https://via.placeholder.com/160x600/FF6B6B/FFFFFF?text=Your+Ad+1',
    'https://via.placeholder.com/160x600/4ECDC4/FFFFFF?text=Your+Ad+2',
    'https://via.placeholder.com/160x600/45B7D1/FFFFFF?text=Your+Ad+3',
    'https://via.placeholder.com/160x600/96CEB4/FFFFFF?text=Your+Ad+4',
    'https://via.placeholder.com/160x600/FECA57/000000?text=Your+Ad+5',
    
    // Example with uploaded images (uncomment and use your actual files):
    // '/uploads/banner-left-1.jpg',
    // '/uploads/banner-left-2.jpg',
    // '/uploads/banner-left-3.jpg',
    // '/uploads/banner-left-4.jpg',
    // '/uploads/banner-left-5.jpg',
  ],
  clickUrl: 'https://www.your-advertiser-website.com',
  isActive: true
};

// RIGHT SIDE BANNER ADS CONFIGURATION  
export const RIGHT_BANNER_ADS: BannerAdConfig = {
  id: 'right-main',
  name: 'Right Sidebar Banner',
  images: [
    // Replace these URLs with your actual banner image URLs
    
    // Example with external placeholder images (replace these):
    'https://via.placeholder.com/160x600/8B5CF6/FFFFFF?text=Promo+A',
    'https://via.placeholder.com/160x600/F59E0B/FFFFFF?text=Promo+B',
    'https://via.placeholder.com/160x600/10B981/FFFFFF?text=Promo+C',
    
    // Example with uploaded images (uncomment and use your actual files):
    // '/uploads/banner-right-1.jpg',
    // '/uploads/banner-right-2.jpg',
    // '/uploads/banner-right-3.jpg',
  ],
  clickUrl: 'https://www.your-business-partner.com',
  isActive: true
};

// HELPER FUNCTIONS
export function getBannerConfig(position: 'left' | 'right'): BannerAdConfig {
  return position === 'left' ? LEFT_BANNER_ADS : RIGHT_BANNER_ADS;
}

export function getActiveBannerImages(position: 'left' | 'right'): string[] {
  const config = getBannerConfig(position);
  return config.isActive ? config.images.filter(img => img && img.trim() !== '') : [];
}

export function getBannerClickUrl(position: 'left' | 'right'): string | undefined {
  const config = getBannerConfig(position);
  return config.isActive ? config.clickUrl : undefined;
}

// BANNER AD SETTINGS
export const BANNER_SETTINGS = {
  rotationInterval: 7000, // 7 seconds (7000 milliseconds)
  maxImages: 10, // Maximum number of images per banner
  fallbackToDefault: true, // Show "Available for Rent" when no images
  enableHoverEffects: true,
  showImageCounter: true,
};

/* 
HOW TO CONFIGURE YOUR BANNER ADS:

1. UPLOAD YOUR IMAGES:
   - Upload your banner images (160x600 pixels recommended) to the server/uploads/ directory
   - Or use external image URLs (must be HTTPS for security)

2. UPDATE IMAGE PATHS:
   - For uploaded images: use '/uploads/your-image-name.jpg'
   - For external images: use full HTTPS URL

3. SET CLICK DESTINATIONS:
   - Update clickUrl to where users should go when they click the banner
   - Use external URLs (with https://) for advertiser websites

4. ENABLE/DISABLE BANNERS:
   - Set isActive: true to show the rotating banners
   - Set isActive: false to show "Available for Rent" placeholder

5. CUSTOMIZE ROTATION:
   - Change rotationInterval in BANNER_SETTINGS to adjust timing
   - Default is 7000ms (7 seconds)

EXAMPLE CONFIGURATION:
{
  images: [
    '/uploads/my-company-ad.jpg',
    '/uploads/special-offer.png',
    'https://example.com/banner.jpg'
  ],
  clickUrl: 'https://www.advertiser-website.com',
  isActive: true
}
*/