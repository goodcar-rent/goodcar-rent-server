import winston from 'winston'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error'
  }),
  new winston.transports.File({ filename: 'logs/all.log' })
]

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
})

export default (app, opt) => {
  const aLogger = Logger()

  return {
    // generic module API:
    initSync: (app, opt) => {},
    init: async (app, opt) => Promise.resolve(),

    // notify API:
    log: (...msg) => aLogger.log(...msg),
    error: (...msg) => aLogger.error(...msg),
    warn: (...msg) => aLogger.warn(...msg),
    info: (...msg) => aLogger.info(...msg),
    debug: (...msg) => aLogger.debug(...msg)
  }
}
