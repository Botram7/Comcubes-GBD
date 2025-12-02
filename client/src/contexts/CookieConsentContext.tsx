import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    clarity?: (...args: any[]) => void;
    adsbygoogle?: any[];
  }
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  hasConsented: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
  showPreferences: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: Partial<CookiePreferences>) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  analyticsLoaded: boolean;
  marketingLoaded: boolean;
}

interface PublicConfig {
  turnstileSiteKey: string;
  gaMeasurementId: string;
  adsenseClientId: string;
}

const COOKIE_CONSENT_KEY = 'comcubes_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'comcubes_cookie_preferences';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

let cachedConfig: PublicConfig | null = null;
let configPromise: Promise<PublicConfig> | null = null;

async function getPublicConfig(): Promise<PublicConfig> {
  if (cachedConfig) return cachedConfig;
  if (configPromise) return configPromise;
  
  configPromise = fetch('/api/config/public')
    .then(res => res.json())
    .then(config => {
      cachedConfig = config;
      return config;
    })
    .catch(() => ({
      turnstileSiteKey: '',
      gaMeasurementId: '',
      adsenseClientId: 'ca-pub-5485634688028600'
    }));
  
  return configPromise;
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [analyticsLoaded, setAnalyticsLoaded] = useState<boolean>(false);
  const [marketingLoaded, setMarketingLoaded] = useState<boolean>(false);
  const previousPrefsRef = useRef<CookiePreferences | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('resetCookies') === 'true') {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      localStorage.removeItem(COOKIE_PREFERENCES_KEY);
      window.history.replaceState({}, '', window.location.pathname);
      setShowBanner(true);
      setIsInitialized(true);
      return;
    }

    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const storedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (storedConsent === 'true' && storedPreferences) {
      try {
        const parsedPrefs = JSON.parse(storedPreferences);
        const prefs = { ...defaultPreferences, ...parsedPrefs };
        setPreferences(prefs);
        previousPrefsRef.current = prefs;
        setHasConsented(true);
        setShowBanner(false);
      } catch (e) {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
    setIsInitialized(true);
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (analyticsLoaded) return;
    
    // GA4 script is already loaded in index.html with consent mode
    // Update consent to granted when user accepts analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      console.log('GA4 consent updated: analytics_storage granted');
      
      // Send a pageview event now that consent is granted
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
      console.log('GA4 page_view event sent after consent');
    }

    // Load Microsoft Clarity if configured
    const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (clarityId && clarityId !== '' && !clarityId.includes('PLACEHOLDER') && !window.clarity) {
      (function (c: any, l: Document, a: string, r: string, i: string, t: HTMLScriptElement, y: Element) {
        c[a] = c[a] || function (...args: any[]) {
          (c[a].q = c[a].q || []).push(args);
        };
        t = l.createElement(r) as HTMLScriptElement;
        t.async = true;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode!.insertBefore(t, y);
      })(window, document, 'clarity', 'script', clarityId, {} as HTMLScriptElement, document.getElementsByTagName('script')[0]);
      console.log('Microsoft Clarity initialized with consent');
    }
    
    setAnalyticsLoaded(true);
  }, [analyticsLoaded]);

  const loadMarketing = useCallback(async () => {
    if (marketingLoaded) return;
    
    // Update consent mode for marketing/advertising
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
      console.log('GA4 consent updated: ad_storage, ad_user_data, ad_personalization granted');
    }
    
    try {
      const config = await getPublicConfig();
      const adsenseClientId = config.adsenseClientId || 'ca-pub-5485634688028600';
      
      if (adsenseClientId && !adsenseClientId.includes('PLACEHOLDER') && !window.adsbygoogle) {
        const adsenseScript = document.createElement('script');
        adsenseScript.async = true;
        adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`;
        adsenseScript.crossOrigin = 'anonymous';
        document.head.appendChild(adsenseScript);
        
        window.adsbygoogle = window.adsbygoogle || [];
        console.log('Google AdSense initialized with consent, Client:', adsenseClientId);
      }
    } catch (e) {
      console.error('Failed to load AdSense config:', e);
    }
    
    setMarketingLoaded(true);
  }, [marketingLoaded]);

  useEffect(() => {
    if (!isInitialized) return;

    if (hasConsented && preferences.analytics && !analyticsLoaded) {
      loadAnalytics();
    }
  }, [hasConsented, preferences.analytics, isInitialized, analyticsLoaded, loadAnalytics]);

  useEffect(() => {
    if (!isInitialized) return;

    if (hasConsented && preferences.marketing && !marketingLoaded) {
      loadMarketing();
    }
  }, [hasConsented, preferences.marketing, isInitialized, marketingLoaded, loadMarketing]);

  const saveConsent = useCallback((prefs: CookiePreferences) => {
    const prevPrefs = previousPrefsRef.current;
    
    const analyticsRevoked = prevPrefs?.analytics === true && prefs.analytics === false;
    const marketingRevoked = prevPrefs?.marketing === true && prefs.marketing === false;
    const consentRevoked = (analyticsRevoked && analyticsLoaded) || (marketingRevoked && marketingLoaded);
    
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    previousPrefsRef.current = prefs;
    setHasConsented(true);
    setShowBanner(false);
    setShowPreferences(false);
    
    if (consentRevoked) {
      setTimeout(() => {
        if (window.confirm('To fully apply your cookie preferences, the page needs to reload. Reload now?')) {
          window.location.reload();
        }
      }, 100);
    }
  }, [analyticsLoaded, marketingLoaded]);

  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  }, [saveConsent]);

  const savePreferences = useCallback((prefs: Partial<CookiePreferences>) => {
    const newPrefs = {
      ...preferences,
      ...prefs,
      necessary: true,
    };
    saveConsent(newPrefs);
  }, [preferences, saveConsent]);

  const openPreferences = useCallback(() => {
    setShowPreferences(true);
  }, []);

  const closePreferences = useCallback(() => {
    setShowPreferences(false);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        hasConsented,
        preferences,
        showBanner,
        showPreferences,
        acceptAll,
        rejectAll,
        savePreferences,
        openPreferences,
        closePreferences,
        analyticsLoaded,
        marketingLoaded,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
