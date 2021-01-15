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

const ConfigMessages = {
  path: path.join(__dirname, '..', 'messages')
}

export {
  ConfigPino,
  ConfigSocketIo,
  ConfigMessages
}
export default {
  ConfigPino,
  ConfigSocketIo,
  ConfigMessages
}
