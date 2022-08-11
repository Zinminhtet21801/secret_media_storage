import { createLogger, transports, format } from 'winston';

// logging function

const customLogger = createLogger({
  transports: [
    new transports.File({
      filename: 'debug.log',
      level: 'debug',
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: 'error.log',
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

export default customLogger;
