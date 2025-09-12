export interface UrlValidationResult {
  normalizedUrl: string;
  isValid: boolean;
  error?: string;
}

/**
 * Normalizes and validates a URL input to support various common formats
 * Accepts: oil.com, www.oil.com, https://oil.com, https://www.oil.com, etc.
 * Returns: normalized https URL and validation status
 */
export function normalizeUrl(input: string): UrlValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      normalizedUrl: '',
      isValid: false,
      error: 'Website URL is required'
    };
  }

  // Trim whitespace
  let url = input.trim();
  
  if (!url) {
    return {
      normalizedUrl: '',
      isValid: false,
      error: 'Website URL is required'
    };
  }

  // Remove any spaces within the URL
  url = url.replace(/\s+/g, '');

  // Add https:// if no protocol is specified
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`;
  }

  try {
    // Create URL object to validate and normalize
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        normalizedUrl: url,
        isValid: false,
        error: 'Only http and https URLs are allowed'
      };
    }

    // Ensure hostname has at least one dot and proper TLD
    const hostname = urlObj.hostname.toLowerCase();
    const parts = hostname.split('.');
    
    if (parts.length < 2 || parts[parts.length - 1].length < 2) {
      return {
        normalizedUrl: url,
        isValid: false,
        error: 'Please enter a valid domain name'
      };
    }

    // Prefer https over http
    if (urlObj.protocol === 'http:') {
      urlObj.protocol = 'https:';
    }

    const normalizedUrl = urlObj.toString();

    return {
      normalizedUrl,
      isValid: true
    };
  } catch (error) {
    return {
      normalizedUrl: url,
      isValid: false,
      error: 'Please enter a valid website URL'
    };
  }
}

/**
 * Formats URL for display to users
 */
export function formatUrlForDisplay(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    // Remove trailing slash and show clean format
    return urlObj.href.replace(/\/$/, '');
  } catch {
    return url;
  }
}