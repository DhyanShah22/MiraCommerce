const client = require('prom-client');
const metricsLogger = require('../Logger/metricsLogger'); // Adjust the path as necessary

// Create a Registry to register metrics
const register = new client.Registry();

// Create a counter metric
const requestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

// Create a histogram metric for response times
const responseTimeHistogram = new client.Histogram({
    name: 'http_response_time_seconds',
    help: 'HTTP response time in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5] // Define time buckets
});

register.registerMetric(requestCounter);
register.registerMetric(responseTimeHistogram);

// Middleware to collect metrics
const collectMetrics = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        requestCounter.labels(req.method, req.url, res.statusCode).inc();
        responseTimeHistogram.labels(req.method, req.url, res.statusCode).observe(duration);

        // Log the metrics to the file
        metricsLogger.info({
            method: req.method,
            route: req.url,
            status_code: res.statusCode,
            duration: duration
        });
    });

    next();
};

const metricsEndpoint = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

module.exports = { collectMetrics, metricsEndpoint };