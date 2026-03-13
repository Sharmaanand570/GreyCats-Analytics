import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "gc_cookie_consent";

type ConsentValue = "granted" | "denied" | null;

function getStoredConsent(): ConsentValue {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    // ignore
  }
  return null;
}

function applyConsent(value: "granted" | "denied") {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: value,
      ad_storage: value,
    });
  }
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // ignore
  }
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      // Re-apply on every page load so consent persists across sessions
      applyConsent(stored);
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function handleAccept() {
    applyConsent("granted");
    setVisible(false);
  }

  function handleDecline() {
    applyConsent("denied");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 bg-background border-t border-border shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-muted-foreground">
          We use analytics cookies to understand how our platform is used and to
          improve your experience. Your data is never sold or shared with third
          parties. You can change your preference at any time.{" "}
          <Link to="/cookies" className="underline hover:text-foreground">
            Learn more
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
