import expressWinston from 'express-winston';
import logger from '../utils/logger.js';

export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  level: 'info',

  // Define a custom message format
  msg: (req, res) => {
    return `HTTP ${req.method} ${req.url}`;
  },

  // Limit which request properties to log
  requestWhitelist: ['ip', 'headers.user-agent'],
  responseWhitelist: ['statusCode'],

  // Add extra meta fields you want
  meta: true,
  dynamicMeta: (req, res) => {
    return {
      ip: req.ip,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
    };
  }
});

export const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  msg: "HTTP {{req.method}} {{req.url}}",
  meta: true,
});
