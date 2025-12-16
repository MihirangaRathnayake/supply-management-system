/**
 * Error Handling Middleware
 * =========================
 * Centralized error handling for the API
 */

// Custom API Error class
class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    static conflict(message) {
        return new ApiError(409, message);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, message);
    }
}

// 404 Not Found Handler
const notFoundHandler = (req, res, next) => {
    const error = ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`);
    next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = typeof err.message === 'string' ? err.message : 'Something went wrong';
    let errors = [];

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate field value entered';
        const field = Object.keys(err.keyValue)[0];
        errors = [{ field, message: `${field} already exists` }];
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Preserve ApiError-provided errors only if they are safe (plain arrays/strings/objects)
    if (Array.isArray(err.errors)) {
        errors = err.errors.map((e) => {
            if (typeof e === 'string') return e;
            if (e && typeof e === 'object') {
                return {
                    field: e.field,
                    message: e.message || JSON.stringify(e, null, 2)
                };
            }
            return String(e);
        });
    }
    // Handle Mongo validation errors explicitly to avoid circular refs
    if (!errors.length && err.name === 'MongoServerError' && err.errInfo?.details) {
        errors = [{ message: 'Mongo validation failed', details: err.errInfo.details }];
        statusCode = 400;
        message = 'Validation failed';
    }
    if (!errors.length && err.code === 121 && err.errInfo?.details) {
        errors = [{ message: 'Mongo schema validation failed', details: err.errInfo.details }];
        statusCode = 400;
        message = 'Validation failed';
    }

    // Send error response safely
    try {
        return res.status(statusCode).json({
            success: false,
            status: statusCode,
            message,
            errors: errors.length > 0 ? errors : undefined,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    } catch (serializationError) {
        console.error('Error serializing error response:', serializationError);
        return res.status(500).send(typeof message === 'string' ? message : 'Internal server error');
    }
};

// Async handler wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    ApiError,
    notFoundHandler,
    errorHandler,
    asyncHandler
};
