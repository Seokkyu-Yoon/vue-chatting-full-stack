import io from 'socket.io-client'
import SocketHandler from '@/core/socket-handler'

function getSocket ({
  NODE_ENV,
  VUE_APP_SERVER_PROTOCOL = 'http:',
  VUE_APP_SERVER_IP = 'localhost',
  VUE_APP_SERVER_PORT = '3000'
}) {
  const opts = {
    transports: ['websocket']
  }
  if (NODE_ENV === 'development') {
    const devServer = `${VUE_APP_SERVER_PROTOCOL}//${VUE_APP_SERVER_IP}:${VUE_APP_SERVER_PORT}`
    return io(devServer, opts)
  }
  return io(opts)
}

const socket = getSocket(process.env)
const $socketHandler = new SocketHandler(socket)

const SocketPlugin = {
  install (vue) {
    vue.mixin({})

    Object.assign(vue.prototype, { $socketHandler })
  }
}

export default SocketPlugin
