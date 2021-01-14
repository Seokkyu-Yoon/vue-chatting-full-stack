import socketIo from './socket-io'
import redis from './redis'
const plugins = {
  socket: socketIo,
  db: redis
}

export default plugins
