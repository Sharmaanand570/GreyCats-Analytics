export const getProfileImageUrl = (path: string | undefined | null): string | undefined => {
    if (!path) return undefined;

    // If it's already a full URL or a data URL, return it
    if (path.startsWith("http") || path.startsWith("data:")) {
        return path;
    }

    // Get base URL from env
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    // Remove leading slash from path if present to avoid double slashes if base has trailing
    // But usually base doesn't have trailing. Let's handle both cleanly.
    // Actually, standard URL constructor is safer, but just simple string concat is fine for now.

    if (!baseUrl) return path; // Should not happen if env is set

    // Ensure path starts with / if it doesn't (assuming baseUrl doesn't have trailing slash)
    // commonly VITE_API_BASE_URL might be "http://localhost:3000/api/v1"
    // and path might be "uploads/file.png"

    // Let's try to handle slashes correctly.
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    // If cleanBase ends with /api, remove it because uploads are likely at root
    const originBase = cleanBase.endsWith("/api") ? cleanBase.slice(0, -4) : cleanBase;

    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${originBase}${cleanPath}`;
};
