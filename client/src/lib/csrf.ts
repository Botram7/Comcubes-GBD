/**
 * CSRF Protection utilities for COMCUBES application
 * Implements anti-CSRF tokens for forms and state-changing requests
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

interface CSRFTokenData {
  token: string;
  expires: number;
}

/**
 * Generate a new CSRF token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or generate CSRF token
 */
export function getCSRFToken(): string {
  const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (stored) {
    try {
      const tokenData: CSRFTokenData = JSON.parse(stored);
      
      // Check if token is still valid
      if (Date.now() < tokenData.expires) {
        return tokenData.token;
      }
    } catch (error) {
      // Invalid stored data, generate new token
    }
  }
  
  // Generate new token
  const token = generateToken();
  const tokenData: CSRFTokenData = {
    token,
    expires: Date.now() + CSRF_TOKEN_EXPIRY
  };
  
  sessionStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify(tokenData));
  return token;
}

/**
 * Add CSRF token to headers for API requests
 */
export function addCSRFHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...headers,
    'X-CSRF-Token': getCSRFToken()
  };
}

/**
 * Clear CSRF token (e.g., on logout)
 */
export function clearCSRFToken(): void {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
}

/**
 * Hook to get CSRF token for forms
 */
export function useCSRFToken(): string {
  return getCSRFToken();
}