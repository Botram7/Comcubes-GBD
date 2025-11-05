import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize analytics
const initializeAnalytics = () => {
  // Google Analytics 4
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (gaId && gaId !== '' && !gaId.includes('PLACEHOLDER')) {
    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      send_page_view: true,
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    console.log('Google Analytics 4 initialized with ID:', gaId);
  } else {
    console.warn('Google Analytics 4 not configured - set VITE_GA_MEASUREMENT_ID');
  }

  // Microsoft Clarity
  const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;
  if (clarityId && clarityId !== '' && !clarityId.includes('PLACEHOLDER')) {
    (function (c: any, l: Document, a: string, r: string, i: string, t: HTMLScriptElement, y: Element) {
      c[a] =
        c[a] ||
        function (...args: any[]) {
          (c[a].q = c[a].q || []).push(args);
        };
      t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode!.insertBefore(t, y);
    })(window, document, 'clarity', 'script', clarityId, {} as HTMLScriptElement, document.getElementsByTagName('script')[0]);

    console.log('Microsoft Clarity initialized with ID:', clarityId);
  } else {
    console.warn('Microsoft Clarity not configured - set VITE_CLARITY_PROJECT_ID');
  }
};

// Initialize analytics before rendering app
initializeAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
