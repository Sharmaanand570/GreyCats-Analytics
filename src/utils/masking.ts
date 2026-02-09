/**
 * PII Masking Utilities
 * Mask sensitive personal information for display
 */

/**
 * Mask email address
 * @example maskEmail('example@domain.com') → 'ex***@domain.com'
 */
export const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local.slice(0, 2)}***@${domain}`;
};

/**
 * Mask phone number
 * @example maskPhone('+1234567890') → '+123***7890'
 */
export const maskPhone = (phone: string): string => {
    if (!phone || phone.length <= 6) return phone;
    return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
};

/**
 * Mask API key/token
 * @example maskToken('sk_live_abc123def456') → 'sk_live_***456'
 */
export const maskToken = (token: string): string => {
    if (!token || token.length <= 10) return '***';
    return `${token.slice(0, 8)}***${token.slice(-3)}`;
};

/**
 * Mask credit card number
 * @example maskCard('1234567890123456') → '****3456'
 */
export const maskCard = (card: string): string => {
    if (!card || card.length < 4) return '****';
    return `****${card.slice(-4)}`;
};

/**
 * Mask generic sensitive string
 * Shows first 3 and last 3 characters
 */
export const maskSensitive = (value: string, showChars: number = 3): string => {
    if (!value || value.length <= showChars * 2) return '***';
    return `${value.slice(0, showChars)}***${value.slice(-showChars)}`;
};
