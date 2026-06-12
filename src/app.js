const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const logger = require('./utils/logger');

const { testConnection } = require('./config/database');
const { validateEnv } = require('./config/validateEnv');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const sanitizeInputs = require('./middleware/sanitize');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Trust Proxy (P3) - Essential for correct rate limiting behind proxies (e.g. Aiven/Nginx)
app.set('trust proxy', 1);

// Security Headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false, // Disable CSP in dev for easier debugging
    crossOriginEmbedderPolicy: false // Required for Swagger UI
}));

// Request Logging (P3) - Audit trail
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.request(req, res, duration);
    });
    next();
});

// CORS Configuration - restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn('CORS blocked request', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with size limit (P2)
app.use(express.json({ limit: '10kb' }));

// Input Sanitization (P2) - Prevent XSS and trim inputs
app.use(sanitizeInputs);

// Swagger Documentation - ONLY in development
if (!isProduction) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Rugby Manager API Docs'
    }));
}

// General API rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 100 : 1000, // Relaxed in dev for testing
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Intente nuevamente en unos minutos.' }
});
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: isProduction ? 'production' : 'development'
    });
});

// Root redirect
app.get('/', (req, res) => {
    if (isProduction) {
        res.json({ message: 'Rugby Manager API', status: 'running' });
    } else {
        res.redirect('/api-docs');
    }
});

// Error handling middleware - sanitize errors in production
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { message: err.message });

    if (isProduction) {
        // Don't leak error details in production
        res.status(err.status || 500).json({
            error: err.status === 500 ? 'Error interno del servidor' : err.message
        });
    } else {
        // Full error details in development
        res.status(err.status || 500).json({
            error: err.message || 'Error interno del servidor',
            stack: err.stack
        });
    }
});

// Start server
async function startServer() {
    // Validate environment before anything else
    validateEnv();

    const dbConnected = await testConnection();

    if (!dbConnected) {
        logger.error('Database connection failed');
        process.exit(1);
    }

    app.listen(PORT, () => {
        logger.info('Rugby Manager API started', { port: PORT, environment: isProduction ? 'production' : 'development' });
        if (!isProduction) {
            logger.info('API docs available', { url: `http://localhost:${PORT}/api-docs` });
        }
    });
}

module.exports = app;

if (require.main === module) {
    startServer();
}

