import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Fires a GA4 page_view event on every React Router navigation.
 * Required because GA4 only auto-tracks the initial page load in a SPA.
 * Must be called inside a component that is a child of <HashRouter>.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (!Array.isArray(window.dataLayer)) return;
    window.dataLayer.push({
      event: "page_view",
      page_path: location.pathname + location.search,
    });
  }, [location]);
}
