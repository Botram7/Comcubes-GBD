import DOMPurify from 'dompurify';

/**
 * Security utilities for the COMCUBES application
 * Provides XSS protection and input sanitization
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML content
 * @returns Sanitized HTML content safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize text input to prevent XSS in user-generated content
 * @param input - User input string
 * @returns Sanitized text safe for display
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate and sanitize URL to prevent javascript: and data: URL attacks
 * @param url - URL string to validate
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (trimmed.startsWith('javascript:') || 
      trimmed.startsWith('data:') || 
      trimmed.startsWith('vbscript:') ||
      trimmed.startsWith('file:')) {
    return '';
  }
  
  // Ensure URL starts with http or https
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${url.trim()}`;
  }
  
  return url.trim();
}

/**
 * Validate email format with additional security checks
 * @param email - Email string to validate
 * @returns True if email is valid and safe
 */
export function isSecureEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Basic format check
  if (!emailRegex.test(email)) return false;
  
  // Additional security checks
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /%[0-9a-f]{2}/i, // URL encoding
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(email));
}

/**
 * Generate CSRF token for forms
 * @returns CSRF token string
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate content length to prevent DoS attacks
 * @param content - Content to validate
 * @param maxLength - Maximum allowed length
 * @returns True if content length is within limits
 */
export function isValidContentLength(content: string, maxLength: number = 10000): boolean {
  return typeof content === 'string' && content.length <= maxLength;
}

/**
 * Remove potentially dangerous characters from filename
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\./, '')
    .substring(0, 255);
}