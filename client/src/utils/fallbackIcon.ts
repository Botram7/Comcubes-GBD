// Fallback icon generator with company initials and brand colors

interface FallbackIconOptions {
  size?: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
}

// Brand color palette based on company name hash
const BRAND_COLORS = [
  '#1f77b4', // Blue
  '#ff7f0e', // Orange
  '#2ca02c', // Green
  '#d62728', // Red
  '#9467bd', // Purple
  '#8c564b', // Brown
  '#e377c2', // Pink
  '#7f7f7f', // Gray
  '#bcbd22', // Olive
  '#17becf', // Cyan
  '#aec7e8', // Light Blue
  '#ffbb78', // Light Orange
  '#98df8a', // Light Green
  '#ff9896', // Light Red
  '#c5b0d5', // Light Purple
  '#c49c94', // Light Brown
  '#f7b6d3', // Light Pink
  '#c7c7c7', // Light Gray
  '#dbdb8d', // Light Olive
  '#9edae5', // Light Cyan
];

// Generate company initials from name
export function getCompanyInitials(companyName: string): string {
  if (!companyName) return 'CO';
  
  // Clean the company name - remove common suffixes and special characters
  const cleanName = companyName
    .replace(/\b(Inc\.?|LLC|Corp\.?|Corporation|Ltd\.?|Limited|Co\.?|Company|Group|Holdings?|International|Global|Solutions?|Services?|Technologies?|Systems?|Enterprises?|Partners?|Associates?|Consulting|Management)\b/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .trim();
  
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    // Fallback to original name if cleaning removed everything
    const originalWords = companyName.split(/\s+/).filter(word => word.length > 0);
    return originalWords.length >= 2 
      ? originalWords[0][0].toUpperCase() + originalWords[1][0].toUpperCase()
      : originalWords[0]?.substring(0, 2).toUpperCase() || 'CO';
  }
  
  if (words.length === 1) {
    // Single word - take first 2 characters
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple words - take first letter of first two words
  return words[0][0].toUpperCase() + words[1][0].toUpperCase();
}

// Generate consistent brand color based on company name
export function getBrandColor(companyName: string): string {
  if (!companyName) return BRAND_COLORS[0];
  
  // Create a simple hash from the company name
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    const char = companyName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % BRAND_COLORS.length;
  return BRAND_COLORS[index];
}

// Generate fallback icon as SVG data URL
export function generateFallbackIcon(
  companyName: string, 
  options: FallbackIconOptions = {}
): string {
  const {
    size = 120,
    fontSize = 48,
    fontWeight = '600',
    fontFamily = 'Inter, system-ui, sans-serif'
  } = options;
  
  const initials = getCompanyInitials(companyName);
  const brandColor = getBrandColor(companyName);
  
  // Create gradient background for more visual appeal
  const lightColor = adjustColorBrightness(brandColor, 20);
  const darkColor = adjustColorBrightness(brandColor, -10);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient-${Math.abs(companyName.length)}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${lightColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#gradient-${Math.abs(companyName.length)})" />
      <text x="50%" y="50%" 
            font-family="${fontFamily}" 
            font-size="${fontSize}" 
            font-weight="${fontWeight}" 
            fill="white" 
            text-anchor="middle" 
            dominant-baseline="central"
            style="user-select: none;">
        ${initials}
      </text>
    </svg>
  `.trim();
  
  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
  return dataUrl;
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const num = parseInt(hex, 16);
  const r = (num >> 16) + percent;
  const g = (num >> 8 & 0x00FF) + percent;
  const b = (num & 0x0000FF) + percent;
  
  // Clamp values to 0-255 range
  const clamp = (val: number) => Math.min(255, Math.max(0, val));
  
  return `#${((clamp(r) << 16) | (clamp(g) << 8) | clamp(b)).toString(16).padStart(6, '0')}`;
}

// Generate multiple sizes for different contexts
export function generateFallbackIconSet(companyName: string) {
  return {
    small: generateFallbackIcon(companyName, { size: 40, fontSize: 16 }),
    medium: generateFallbackIcon(companyName, { size: 80, fontSize: 32 }),
    large: generateFallbackIcon(companyName, { size: 120, fontSize: 48 }),
    xlarge: generateFallbackIcon(companyName, { size: 200, fontSize: 80 })
  };
}