import winston from 'winston';
import config from '../config';

const wConfig = winston.config;

const logger = winston.createLogger({
  level: config.log.level,
  transports: [
    new (winston.transports.Console)({
      formatter(options) {
        const logMsg = {
          workerId: process.pid,
          timestamp: new Date(),
          level: options.level,
          message: (options.message ? options.message : ''),
        };

        if (options.meta && Object.keys(options.meta).length > 0) {
          logMsg.data = options.meta;
        }

        if (config.log.colorize) {
          return wConfig.colorize(options.level, JSON.stringify(logMsg));
        }

        return JSON.stringify(logMsg);
      },
    }),
  ],
});

logger.stream = {
  write: (message) => {
    const msg = JSON.parse(message);
    let level = 'debug';

    switch (Number(msg.status)) {
      case 200:
        level = 'verbose';
        break;
      case 500:
        level = 'error';
        break;
      case 401:
      case 404:
      default:
        level = 'debug';
        break;
    }

    logger.log(level, 'HTTP request', msg);
  },
};

// Morgan formatter
const formatter = (tokens, req, res) => {
  const userUuid = (req.user && req.user.sub) ? req.user.sub : null;

  const format = {
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    remoteAddr: tokens['remote-addr'](req, res),
    userAgent: tokens['user-agent'](req, res),
    responseTime: `${tokens['response-time'](req, res)} ms`,
    userUuid,
  };

  return JSON.stringify(format);
};


export { logger };
