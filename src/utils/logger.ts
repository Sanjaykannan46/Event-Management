import winston from 'winston';
import dotenv from 'dotenv';
import Transport from 'winston-transport';
import LokiTransport from 'winston-loki';

dotenv.config();

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const humanFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}] ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`;
  })
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const transports: Transport[] = [
  //new winston.transports.Console({ format: humanFormat }),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error', format: jsonFormat }),
  new winston.transports.File({ filename: 'logs/all.log', format: jsonFormat }),
];

if (process.env.LOKI_URL) {
  transports.push(
    new LokiTransport({
      host: process.env.LOKI_URL!,
      labels: { job: 'daddy-ems-backend', app: 'daddy-ems' },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    })
  );
}

const logger = winston.createLogger({
  level,
  levels,
  transports,
});

export default logger;
