const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;

const metricsLogger = createLogger({
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new transports.File({ filename: 'metrics.log' })
  ]
});

module.exports = metricsLogger;
