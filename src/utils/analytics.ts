// Declare global gtag function on window interface
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let isInitialized = false;

/**
 * Initializes Google Analytics GA4 script dynamically
 */
export const initGA = (): void => {
  if (isInitialized) return;
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    return;
  }

  // Prevent multiple injections
  if (document.getElementById('ga-gtag-script')) {
    isInitialized = true;
    return;
  }

  // Inject Google Tag script into <head>
  const script = document.createElement('script');
  script.id = 'ga-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  // Disable automatic initial pageview so React Router SPA navigation tracks route changes cleanly
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  });

  isInitialized = true;
};

/**
 * Track SPA page views on route change
 */
export const trackPageView = (path: string): void => {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    });
  }
};

/**
 * Track custom user events (e.g. downloads, module clicks, logins)
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
};
