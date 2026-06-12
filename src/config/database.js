const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Database configuration — no fallback defaults (env validation catches missing vars)
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// SSL configuration for cloud databases (e.g. Aiven)
if (process.env.DB_SSL === 'true') {
    if (process.env.DB_SSL_CA && fs.existsSync(process.env.DB_SSL_CA)) {
        // Best: verify server certificate with CA
        dbConfig.ssl = {
            ca: fs.readFileSync(process.env.DB_SSL_CA),
            rejectUnauthorized: true
        };
    } else {
        // Fallback: encrypted but no cert verification (vulnerable to MITM)
        dbConfig.ssl = {
            rejectUnauthorized: false
        };
        if (isProduction) {
            console.warn('⚠ DB_SSL is enabled but DB_SSL_CA is not set. Connection is encrypted but not verified.');
            console.warn('  Download the CA certificate from Aiven and set DB_SSL_CA=/path/to/ca.pem');
        }
    }
} else if (isProduction) {
    console.warn('⚠ DB_SSL is not enabled. Database connections are unencrypted!');
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };
