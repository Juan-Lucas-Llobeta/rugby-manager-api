/**
 * Environment variable validation
 * Validates required environment variables at startup.
 * Exits the process with clear error messages if any are missing.
 */

const REQUIRED_VARS = [
    { name: 'DB_HOST', description: 'Database host' },
    { name: 'DB_USER', description: 'Database user' },
    { name: 'DB_PASSWORD', description: 'Database password' },
    { name: 'DB_NAME', description: 'Database name' },
    { name: 'JWT_SECRET', description: 'JWT signing secret (min 32 chars)' }
];

const RECOMMENDED_VARS = [
    { name: 'NODE_ENV', description: 'Environment (development/production)', default: 'development' },
    { name: 'ALLOWED_ORIGINS', description: 'CORS allowed origins', default: 'http://localhost:5173' },
    { name: 'JWT_EXPIRES_IN', description: 'JWT expiration time', default: '24h' }
];

function validateEnv() {
    const missing = [];
    const warnings = [];

    // Check required variables
    for (const { name, description } of REQUIRED_VARS) {
        if (!process.env[name]) {
            missing.push(`  ✗ ${name} - ${description}`);
        }
    }

    // Check JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        warnings.push(`  ⚠ JWT_SECRET is only ${process.env.JWT_SECRET.length} chars (recommended: 32+)`);
    }

    // Check recommended variables
    for (const { name, description, default: defaultVal } of RECOMMENDED_VARS) {
        if (!process.env[name]) {
            warnings.push(`  ⚠ ${name} not set, using default: "${defaultVal}"`);
        }
    }

    // Production-specific checks
    if (process.env.NODE_ENV === 'production') {
        if (process.env.DB_PASSWORD === '1234' || process.env.DB_PASSWORD === 'password') {
            missing.push('  ✗ DB_PASSWORD - Using insecure default password in production!');
        }
    }

    // Report warnings
    if (warnings.length > 0) {
        console.warn('\n⚠️  Environment warnings:');
        warnings.forEach(w => console.warn(w));
    }

    // Fail on missing required vars
    if (missing.length > 0) {
        console.error('\n❌ Missing required environment variables:');
        missing.forEach(m => console.error(m));
        console.error('\nCopy .env.example to .env and fill in the values.\n');
        process.exit(1);
    }

    console.log('✓ Environment variables validated');
}

module.exports = { validateEnv };
