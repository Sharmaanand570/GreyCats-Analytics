import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
];

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate image file for size and type
 * Shows toast notifications on validation failure
 */
export const validateImageFile = (file: File): FileValidationResult => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0);

        toast.error('File too large', {
            description: `Maximum file size is ${maxSizeMB}MB. Your file is ${fileSizeMB}MB.`
        });
        return { valid: false, error: 'File too large' };
    }

    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Invalid file type', {
            description: 'Only JPEG, PNG, WebP, and GIF images are allowed.'
        });
        return { valid: false, error: 'Invalid file type' };
    }

    return { valid: true };
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Sanitize filename to prevent path traversal and special characters
 * Removes dangerous characters and limits length
 */
export const sanitizeFilename = (filename: string): string => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
        .replace(/\.{2,}/g, '.') // Remove multiple consecutive dots
        .replace(/^\./, '') // Remove leading dot
        .replace(/\.$/, '') // Remove trailing dot
        .slice(0, 255); // Limit to 255 characters
};
