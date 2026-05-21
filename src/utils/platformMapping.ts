import type { IconType } from "react-icons";
import { FaCartShopping, FaWordpress } from "react-icons/fa6";
import { FaBroadcastTower, FaBlog } from "react-icons/fa";
import { SiGoogleanalytics, SiShopify, SiMeta, SiQuora, SiYoutube, SiGooglesearchconsole, SiFacebook, SiInstagram, SiGoogleads, SiX, SiLinkedin, SiTelegram } from "react-icons/si";

export type PlatformConfig = {
  name: string;
  icon: IconType;
  link: string;
  color: string; // Brand color for the icon
};

const platformMap: Record<string, PlatformConfig> = {
  "meta-social": {
    name: "Meta Social",
    icon: SiMeta,   // or any Meta-style icon you prefer
    link: "/data-sources/meta-social",
    color: "#1877F2",    // Meta blue
  },
  "meta-business": {
    name: "Facebook",
    icon: SiMeta,
    link: "/data-sources/meta-business",
    color: "#1877F2", // Meta blue
  },
  "meta-facebook": {
    name: "Facebook",
    icon: SiFacebook,
    link: "/data-sources/meta-facebook",
    color: "#1877F2",
  },
  "meta-instagram": {
    name: "Instagram",
    icon: SiInstagram,
    link: "/data-sources/meta-instagram",
    color: "#E1306C",
  },

  youtube: {
    name: "YouTube",
    icon: SiYoutube,
    link: "/data-sources/youtube",
    color: "#FF0000", // YouTube red
  },
  google: {
    name: "Google Analytics",
    icon: SiGoogleanalytics,
    link: "/data-sources/google-analytics",
    color: "#F4B400", // Google Analytics yellow/orange
  },
  // Alias for frontend platform name "google-analytics"
  "google-analytics": {
    name: "Google Analytics",
    icon: SiGoogleanalytics,
    link: "/data-sources/google-analytics",
    color: "#F4B400",
  },
  "google-console": {
    name: "Google Search Console",
    icon: SiGooglesearchconsole,
    link: "/data-sources/google-console",
    color: "#4285F4", // Google blue
  },
  // Alias for backend platform name "google-search-console"
  "google-search-console": {
    name: "Google Search Console",
    icon: SiGooglesearchconsole,
    link: "/data-sources/google-console",
    color: "#4285F4",
  },
  woo: {
    name: "WooCommerce",
    icon: FaCartShopping,
    link: "/data-sources/woocommerce",
    color: "#96588A", // WooCommerce purple
  },
  // Alias for legacy/frontend compatibility
  "woocommerce": {
    name: "WooCommerce",
    icon: FaCartShopping,
    link: "/data-sources/woocommerce",
    color: "#96588A",
  },
  shopify: {
    name: "Shopify",
    icon: SiShopify,
    link: "/data-sources/shopify",
    color: "#96BF48", // Shopify green
  },
  "meta-ads": {
    name: "Meta Ads",
    icon: SiMeta,
    link: "/data-sources/meta-ads",
    color: "#0081FB", // Meta blue
  },
  quora: {
    name: "Quora",
    icon: SiQuora,
    link: "/data-sources/quora",
    color: "#B92B27", // Quora red
  },
  "google-ads": {
    name: "Google Ads",
    icon: SiGoogleads,
    link: "/data-sources/google-ads",
    color: "#4285F4", // Google blue
  },
  "google_ads": {
    name: "Google Ads",
    icon: SiGoogleads,
    link: "/data-sources/google-ads",
    color: "#4285F4",
  },
  twitter: {
    name: "Twitter (X)",
    icon: SiX,
    link: "/data-sources/twitter",
    color: "#000000",
  },
  linkedin: {
    name: "LinkedIn",
    icon: SiLinkedin,
    link: "/data-sources/linkedin",
    color: "#0A66C2",
  },
  wordpress: {
    name: "WordPress",
    icon: FaWordpress,
    link: "/data-sources/wordpress",
    color: "#21759b",
  },
  telegram: {
    name: "Telegram",
    icon: SiTelegram,
    link: "/data-sources/telegram",
    color: "#229ED9",
  },
  broadcast: {
    name: "Broadcast Outreach",
    icon: FaBroadcastTower,
    link: "/broadcasts",
    color: "#6366F1", // Indigo
  },
  blog: {
    name: "Blog System",
    icon: FaBlog,
    link: "/blog/scheduler",
    color: "#EC4899", // Pink
  },
};

/**
 * Get platform configuration by platform name
 */
export const getPlatformConfig = (
  platform: string
): PlatformConfig | null => {
  const normalizedPlatform = platform.toLowerCase().replace(/[ _]/g, "-");
  return platformMap[normalizedPlatform] || null;
};

/**
 * Capitalize first letter of status
 */
export const capitalizeStatus = (status: string): string => {
  if (!status) return status;
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

