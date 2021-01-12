import SocketIo from 'socket.io'
import socketIoRedis from 'socket.io-redis'

import { ConfigRedis, ConfigSocketIo } from '../../config'
import { logger } from '../../core'

import Interface from './interface'
import { HandlerSocket, HandlerSocketIo } from './handlers'

async function activate (server, db) {
  logger.info('activate socket.io')
  const io = SocketIo(server, ConfigSocketIo)
  io.adapter(socketIoRedis(ConfigRedis))

  const socketIoHandler = new HandlerSocketIo(io, db)
  setTimeout(() => {
    socketIoHandler.init()
  }, 100)

  io.on(Interface.CONNECTION, async (socket) => {
    return new HandlerSocket(socket, socketIoHandler)
  })
}

export default activate
