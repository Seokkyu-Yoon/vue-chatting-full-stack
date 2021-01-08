const isDev = process.env.NODE_ENV === 'development'

const ConfigPino = {
  prettyPrint: {
    colorize: true
  },
  level: isDev ? 'debug' : 'info'
}

const ConfigSocketIo = {
  cors: {
    origin: '*',
    method: ['GET', 'POST']
  }
}

const ConfigRedis = {
  host: 'localhost',
  port: 6379
}

export {
  ConfigPino,
  ConfigSocketIo,
  ConfigRedis
}
export default {
  ConfigPino,
  ConfigSocketIo,
  ConfigRedis
}
