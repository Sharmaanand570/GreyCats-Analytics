export const getProfileImageUrl = (path: string | undefined | null): string | undefined => {
    if (!path) return undefined;

    // If it's already a full URL or a data URL, return it
    if (path.startsWith("http") || path.startsWith("data:")) {
        return path;
    }

    // Get base URL from env
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!baseUrl) return path; // Should not happen if env is set

    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    // Remove /api from the base URL since the backend mounts uploads at the root level (/uploads)
    const originBase = cleanBase.endsWith("/api") ? cleanBase.slice(0, -4) : cleanBase;

    // Ensure path starts with /uploads/
    let cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (!cleanPath.startsWith("/uploads/")) {
        cleanPath = `/uploads${cleanPath}`;
    }

    return `${originBase}${cleanPath}`;
};
