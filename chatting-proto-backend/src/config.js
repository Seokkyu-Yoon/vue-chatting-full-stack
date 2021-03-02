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
  database: process.env.MYSQL_DATABASE || nodemonJson.env.MYSQL_DATABASE,
  user: 'root',
  password: 'qwer1234',
  timezone: 'Asia/Seoul',
  charset: 'utf8mb4'
}

const filedbAccessInfo = {
  host: '192.168.1.221',
  port: 3306,
  database: 'MMS',
  user: 'modutech',
  password: 'qwer1234',
  connectionLimit: 20
}

export {
  ConfigPino,
  ConfigSocketIo,
  ConfigMysql,
  filedbAccessInfo
}
export default {
  ConfigPino,
  ConfigSocketIo,
  ConfigMysql,
  filedbAccessInfo
}
