import type { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaYoutube, FaGoogle, FaCartShopping } from "react-icons/fa6";
import { SiGoogleads, SiGoogleanalytics } from "react-icons/si";

export type PlatformConfig = {
  name: string;
  icon: IconType;
  link: string;
};

const platformMap: Record<string, PlatformConfig> = {
  facebook: {
    name: "Facebook",
    icon: FaFacebook,
    link: "/integrations/facebook",
  },
  instagram: {
    name: "Instagram",
    icon: FaInstagram,
    link: "/integrations/instagram",
  },
  youtube: {
    name: "YouTube",
    icon: FaYoutube,
    link: "/data-sources/youtube",
  },
  "google-analytics": {
    name: "google Analytics",
    icon: SiGoogleads,
    link: "/integrations/google-analytics",
  },
  "google-analytics": {
    name: "Google Analytics 4",
    icon: SiGoogleanalytics,
    link: "/integrations/google-analytics",
  },
  "google-console": {
    name: "Google Search Console",
    icon: FaGoogle,
    link: "/integrations/google-console",
  },
  woo: {
    name: "WooCommerce",
    icon: FaCartShopping,
    link: "/integrations/woo",
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

