import DOMPurify from 'dompurify';

/**
 * Configure DOMPurify for strict sanitization
 */
const configureDOMPurify = () => {
    // Add hooks for additional security
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        // Remove target="_blank" without rel="noopener noreferrer"
        if (node.hasAttribute('target') && node.getAttribute('target') === '_blank') {
            node.setAttribute('rel', 'noopener noreferrer');
        }
    });
};

// Initialize DOMPurify configuration
if (typeof window !== 'undefined') {
    configureDOMPurify();
}

/**
 * Sanitize HTML content (for rich text)
 * Allows only safe HTML tags and attributes
 */
export const sanitizeHTML = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target'],
        ALLOW_DATA_ATTR: false,
    });
};

/**
 * Sanitize plain text (escape HTML entities)
 * Use this for user-generated text that should be displayed as-is
 */
export const sanitizeText = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * Only allows http: and https: protocols
 */
export const sanitizeURL = (url: string): string => {
    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.toString();
    } catch {
        // Invalid URL
        return '';
    }
};

/**
 * Escape HTML special characters
 * Useful for preventing XSS in dynamic content
 */
export const escapeHTML = (text: string): string => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Strict sanitization for user-generated content
 * Strips ALL HTML tags, keeping only text content
 */
export const sanitizeUserContent = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true, // Keep text content
    });
};

/**
 * Sanitize markdown content
 * Allows only safe markdown-to-HTML tags
 */
export const sanitizeMarkdown = (markdown: string): string => {
    return DOMPurify.sanitize(markdown, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: [],
    });
};
