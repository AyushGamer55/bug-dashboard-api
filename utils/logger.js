const winston = require('winston');

// Custom IST timestamp format
const istTimestamp = winston.format((info) => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value.padStart(2, '0');
  const day = parts.find(p => p.type === 'day').value.padStart(2, '0');
  const hour = parts.find(p => p.type === 'hour').value.padStart(2, '0');
  const minute = parts.find(p => p.type === 'minute').value.padStart(2, '0');
  const second = parts.find(p => p.type === 'second').value.padStart(2, '0');
  info.timestamp = ` ${day}-${month}-${year} Time: ${hour}:${minute}:${second}`;
  return info;
})();

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    istTimestamp,
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bug-dashboard-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        istTimestamp,
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = { logger };
