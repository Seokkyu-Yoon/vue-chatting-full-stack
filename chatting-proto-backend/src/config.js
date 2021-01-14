import path from 'path'

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

const ConfigMessages = {
  path: path.join(__dirname, '..', 'messages')
}

export {
  ConfigPino,
  ConfigSocketIo,
  ConfigRedis,
  ConfigMessages
}
export default {
  ConfigPino,
  ConfigSocketIo,
  ConfigRedis,
  ConfigMessages
}
