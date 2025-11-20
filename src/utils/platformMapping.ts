import type { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaYoutube, FaGoogle, FaCartShopping } from "react-icons/fa6";
import { SiGoogleanalytics, SiShopify } from "react-icons/si";

export type PlatformConfig = {
  name: string;
  icon: IconType;
  link: string;
  color: string; // Brand color for the icon
};

const platformMap: Record<string, PlatformConfig> = {
  facebook: {
    name: "Facebook",
    icon: FaFacebook,
    link: "/integrations/facebook",
    color: "#1877F2", // Facebook blue
  },
  instagram: {
    name: "Instagram",
    icon: FaInstagram,
    link: "/integrations/instagram",
    color: "#E4405F", // Instagram pink/red
  },
  youtube: {
    name: "YouTube",
    icon: FaYoutube,
    link: "/data-sources/youtube",
    color: "#FF0000", // YouTube red
  },
  google: {
    name: "Google Analytics",
    icon: SiGoogleanalytics,
    link: "/integrations/google-analytics",
    color: "#F4B400", // Google Analytics yellow/orange
  },
  "google-console": {
    name: "Google Search Console",
    icon: FaGoogle,
    link: "/integrations/google-console",
    color: "#4285F4", // Google blue
  },
  woo: {
    name: "WooCommerce",
    icon: FaCartShopping,
    link: "/integrations/woo",
    color: "#96588A", // WooCommerce purple
  },
  shopify: {
    name: "Shopify",
    icon: SiShopify,
    link: "/integrations/shopify",
    color: "#96BF48", // Shopify green
  },
};

/**
 * Get platform configuration by platform name
 */
export const getPlatformConfig = (
  platform: string
): PlatformConfig | null => {
  const normalizedPlatform = platform.toLowerCase().replace(/_/g, "-");
  return platformMap[normalizedPlatform] || null;
};

/**
 * Capitalize first letter of status
 */
export const capitalizeStatus = (status: string): string => {
  if (!status) return status;
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

