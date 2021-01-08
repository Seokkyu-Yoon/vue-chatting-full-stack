import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

const logger = pino({
  prettyPrint: {
    colorize: true
  },
  level: isDev ? 'debug' : 'info'
})

export default logger
