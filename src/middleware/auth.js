const jwt = require('jsonwebtoken');

/**
 * Auth Middleware - JWT Token Verification
 * 
 * Verifies the JWT token from Authorization header and attaches user info to request.
 * Use this middleware on all protected routes.
 */

// JWT_SECRET must be set in environment — no fallback to prevent token forgery
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Cannot start server.');
}

/**
 * Verify JWT token from Authorization header
 * Expects: Authorization: Bearer <token>
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: 'Token de autenticación requerido',
            code: 'NO_TOKEN'
        });
    }

    // Check format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            error: 'Formato de token inválido. Use: Bearer <token>',
            code: 'INVALID_FORMAT'
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request for downstream use
        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado. Por favor inicie sesión nuevamente.',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
        }

        console.error('JWT verification error:', error);
        return res.status(500).json({ error: 'Error verificando token' });
    }
}

/**
 * Optional auth - doesn't fail if no token, just doesn't set userId
 * Useful for endpoints that have different behavior for authenticated users
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return next();
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
    } catch (error) {
        // Token invalid but optional, continue without user
    }

    next();
}

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id_usuario and correo
 * @returns {string} JWT token
 */
function generateToken(user) {
    const payload = {
        userId: user.id_usuario,
        email: user.correo
    };

    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = {
    verifyToken,
    optionalAuth,
    generateToken
};
