import path from 'path'
import nodemonJson from '../nodemon.json'

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

const ConfigMysql = {
  host: process.env.MYSQL_IP || nodemonJson.env.MYSQL_IP,
  port: Number(process.env.MYSQL_PORT) || nodemonJson.env.MYSQL_PORT,
  user: 'root',
  password: 'qwer1234',
  database: process.env.MYSQL_DATABASE || nodemonJson.env.MYSQL_DATABASE
}

export {
  ConfigPino,
  ConfigSocketIo,
  ConfigMysql
}
export default {
  ConfigPino,
  ConfigSocketIo,
  ConfigMysql
}
