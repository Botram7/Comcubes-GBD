// Analytics utility functions for tracking events across GA4 and Clarity

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    clarity?: (...args: any[]) => void;
  }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: title || document.title,
    });
  }

  // Microsoft Clarity
  if (window.clarity) {
    window.clarity('set', 'page', url);
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }

  // Microsoft Clarity custom tags
  if (window.clarity && params) {
    Object.entries(params).forEach(([key, value]) => {
      window.clarity?.('set', key, String(value));
    });
  }
};

// Track conversions
export const trackConversion = (
  type: 'ad_purchase' | 'company_claim' | 'company_listing',
  value: number,
  currency: string = 'USD'
) => {
  trackEvent('purchase', {
    transaction_type: type,
    value,
    currency,
  });
};

// Track ad interactions
export const trackAdClick = (
  adType: 'adsense' | 'affiliate',
  position: string,
  adId?: string
) => {
  trackEvent('ad_click', {
    ad_type: adType,
    ad_position: position,
    ad_id: adId,
  });
};

// Track search queries
export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
  });
};

// Track user engagement
export const trackEngagement = (
  action: 'scroll' | 'time_on_page' | 'bounce',
  value?: number
) => {
  trackEvent('user_engagement', {
    engagement_type: action,
    engagement_value: value,
  });
};
