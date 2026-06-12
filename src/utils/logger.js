const isProduction = process.env.NODE_ENV === 'production';

function formatMessage(level, message, meta) {
    const entry = {
        level,
        time: new Date().toISOString(),
        msg: message,
        ...meta
    };
    return JSON.stringify(entry);
}

const logger = {
    info(message, meta = {}) {
        console.log(formatMessage('info', message, meta));
    },
    warn(message, meta = {}) {
        console.warn(formatMessage('warn', message, meta));
    },
    error(message, meta = {}) {
        console.error(formatMessage('error', message, meta));
    },
    request(req, res, durationMs) {
        if (isProduction) {
            this.info('http_request', {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                durationMs,
                ip: req.ip
            });
        } else {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${req.ip} (${durationMs}ms)`);
        }
    }
};

module.exports = logger;
