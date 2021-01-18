import SocketIo from 'socket.io'
import socketIoRedis from 'socket.io-redis'

import { ConfigSocketIo } from '@/config'
import { logger } from '@/core'

import Interface from './interface'
import { HandlerSocket, HandlerSocketIo } from './handlers'

async function activate (server, db) {
  logger.info('activate socket.io')
  const io = SocketIo(server, ConfigSocketIo)
  const { REDIS_IP, REDIS_PORT } = process.env
  io.adapter(socketIoRedis({
    host: REDIS_IP,
    port: REDIS_PORT
  }))

  const socketIoHandler = new HandlerSocketIo(io, db)
  await socketIoHandler.init()

  io.on(Interface.CONNECTION, async (socket) => {
    return new HandlerSocket(socket, socketIoHandler)
  })
}

export default activate
