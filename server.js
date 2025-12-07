// server.js - Main Entry Point
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDB } from './src/config/database.js';
import routes from './src/routes/index.js';
import { notFoundHandler, errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logger (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// ===== ROUTES =====
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ===== ERROR HANDLING =====
app.use(notFoundHandler);
app.use(errorHandler);

// ===== START SERVER =====
const startServer = async () => {
    try {
        // Initialize database connection
        await initDB();

        // Start Express server
        app.listen(PORT, () => {
            console.log('╔════════════════════════════════════════╗');
            console.log('║  Class Management API Server          ║');
            console.log('╠════════════════════════════════════════╣');
            console.log(`║  🚀 Server: http://localhost:${PORT.toString().padEnd(8)} ║`);
            console.log(`║  📡 API: http://localhost:${PORT}/api     ║`);
            console.log(`║  💚 Health: http://localhost:${PORT}/health║`);
            console.log(`║  🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(17)}║`);
            console.log('╚════════════════════════════════════════╝');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Start the server
startServer();

export default app;