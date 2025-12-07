// src/config/database.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'class_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

let pool;

export const initDB = async () => {
    try {
        pool = mysql.createPool(dbConfig);

        const conn = await pool.getConnection();
        console.log('✅ Database connected successfully');
        conn.release();

        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

export const getPool = () => {
    if (!pool) {
        throw new Error('Database pool not initialized. Call initDB first.');
    }
    return pool;
};

export const query = async (sql, params) => {
    const conn = await pool.getConnection();
    try {
        const [results] = await conn.query(sql, params);
        return results;
    } finally {
        conn.release();
    }
};

export const transaction = async (callback) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await callback(conn);
        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};