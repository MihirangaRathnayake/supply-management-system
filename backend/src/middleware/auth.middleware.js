/**
 * Authentication Middleware
 * =========================
 * JWT token verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const { ApiError } = require('./error.middleware');

// Verify JWT token
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw ApiError.unauthorized('No token provided');
        }

        if (!authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('Invalid token format');
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            firstName: decoded.firstName,
            lastName: decoded.lastName
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            next(ApiError.unauthorized('Token expired'));
        } else if (error.name === 'JsonWebTokenError') {
            next(ApiError.unauthorized('Invalid token'));
        } else {
            next(error);
        }
    }
};

// Role-based authorization
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource`));
        }

        next();
    };
};

// Check if user owns the resource or is admin
const authorizeOwner = (getOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        // Admins can access any resource
        if (req.user.role === 'ADMIN') {
            return next();
        }

        try {
            const ownerId = await getOwnerId(req);

            if (ownerId !== req.user.id) {
                return next(ApiError.forbidden('Not authorized to access this resource'));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Permission levels for different operations
const PERMISSIONS = {
    ADMIN: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT', 'MANAGE_USERS'],
    MANAGER: ['CREATE', 'READ', 'UPDATE', 'APPROVE', 'EXPORT'],
    STAFF: ['CREATE', 'READ', 'UPDATE'],
    VIEWER: ['READ']
};

// Check specific permission
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        const userPermissions = PERMISSIONS[req.user.role] || [];

        if (!userPermissions.includes(requiredPermission)) {
            return next(ApiError.forbidden(`Permission '${requiredPermission}' required`));
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize,
    authorizeOwner,
    checkPermission,
    PERMISSIONS
};
