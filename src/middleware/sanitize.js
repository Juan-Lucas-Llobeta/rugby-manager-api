/**
 * Middleware: Input Sanitization
 * 
 * recursively iterates through req.body, req.query, and req.params to:
 * 1. Trim whitespace from strings
 * 2. Escape HTML entities to prevent XSS (Basic)
 */

const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        // 1. Trim whitespace
        let sanitized = value.trim();

        // 2. Escape HTML characters (Basic XSS prevention)
        // Replaces < > & " ' with HTML entities
        sanitized = sanitized
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        return sanitized;
    }
    return value;
};

const sanitizeObject = (obj, parentKey = null) => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map(item => {
            if (typeof item === 'object' && item !== null) {
                return sanitizeObject(item, parentKey);
            }
            return sanitizeValue(item);
        });
    }

    // Handle Objects
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(obj)) {
        // Skip sanitization for password fields (they're hashed, never rendered)
        if (key === 'password' || key === 'password_hash' || key === 'newPassword' || key === 'currentPassword') {
            sanitizedObj[key] = value;
        } else if (typeof value === 'object' && value !== null) {
            sanitizedObj[key] = sanitizeObject(value, key);
        } else {
            sanitizedObj[key] = sanitizeValue(value);
        }
    }
    return sanitizedObj;
};

const sanitizeInputs = (req, res, next) => {
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);
    next();
};

module.exports = sanitizeInputs;
