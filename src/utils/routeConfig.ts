// List of all valid routes in the application
export const validRoutes = [
  // Root
  "/",

  // Auth routes
  "/auth",
  "/auth/login",
  "/auth/signup",

  // Protected routes
  "/edit-dashboard",
  "/data-sources",
  "/data-sources/youtube",
  "/data-sources/woocommerce",
  "/data-sources/shopify",
  "/data-sources/google-analytics",
  "/data-sources/google-console",
  "/data-sources/meta-ads",
  "/data-sources/meta-facebook",
  "/data-sources/meta-instagram",
  "/integrations",
  "/reports",
  "/goals",
  "/alerts",
  "/tasks",
  "/account-setup",
  "/404",

  // OAuth callback routes
  "/youtube/callback",
  "/google/callback",
  "/google-console/callback",
  "/shopify/callback",
  "/meta/callback",
];

// Dynamic route patterns (routes with parameters)
const dynamicRoutePatterns = [
  /^\/reports\/[^/]+$/, // /reports/:id
];

/**
 * Checks if a path is valid
 * @param path - The path to validate
 * @returns true if the path is valid, false otherwise
 */
export const isValidPath = (path: string): boolean => {
  // Normalize the path
  const normalizedPath = path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";

  // Check exact match
  if (validRoutes.includes(normalizedPath)) {
    return true;
  }

  // Check dynamic route patterns
  for (const pattern of dynamicRoutePatterns) {
    if (pattern.test(normalizedPath)) {
      return true;
    }
  }

  return false;
};
