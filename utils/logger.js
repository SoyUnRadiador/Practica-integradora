const { createLogger, format, transports } = require('winston');

// Niveles de prioridad
const logLevels = {
  debug: 0,
  http: 1,
  info: 2,
  warning: 3,
  error: 4,
  fatal: 5,
};

// Configura los formatos de log
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] [${level}] ${stack || message}`;
  })
);

// Crea el logger de desarrollo
const developmentLogger = createLogger({
  levels: logLevels,
  format: logFormat,
  transports: [new transports.Console()],
});

// Crea el logger de producción
const productionLogger = createLogger({
  levels: logLevels,
  format: logFormat,
  transports: [
    new transports.Console({ level: 'info' }), 
    new transports.File({ filename: 'errors.log', level: 'error' }), 
  ],
});

// Función para obtener el logger adecuado según el entorno
const getLogger = () => {
  if (process.env.NODE_ENV === 'production') {
    return productionLogger;
  } else {
    return developmentLogger;
  }
};

module.exports = getLogger();
