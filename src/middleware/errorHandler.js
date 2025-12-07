// src/middleware/errorHandler.js

export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            statusCode: err.statusCode,
            stack: err.stack,
            details: err
        });
    } else {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                error: err.message
            });
        } else {
            console.error('ERROR 💥:', err);
            res.status(500).json({
                success: false,
                error: 'Something went wrong'
            });
        }
    }
};

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export const handleDatabaseError = (error) => {
    if (error.code === 'ER_DUP_ENTRY') {
        return new AppError('Duplicate entry. This record already exists.', 409);
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return new AppError('Invalid reference. Related record does not exist.', 400);
    }

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return new AppError('Cannot delete. Record is being used elsewhere.', 400);
    }

    if (error.code === 'ER_DATA_TOO_LONG') {
        return new AppError('Data is too long for the field.', 400);
    }

    return error;
};