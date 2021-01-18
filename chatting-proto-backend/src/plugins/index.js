import socketIo from './socket-io'
import mysql from './mysql'

const plugins = {
  socket: socketIo,
  db: mysql
}

export default plugins
