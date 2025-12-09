// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required'
        });
    }
    const SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};