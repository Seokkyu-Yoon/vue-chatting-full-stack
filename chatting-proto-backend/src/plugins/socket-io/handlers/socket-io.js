import socketIoEmitter from 'socket.io-emitter'

import { logger, MegaphoneFactory } from '@/core'

import Interface from '../interface'

const { REDIS_IP, REDIS_PORT } = process.env
const emitter = socketIoEmitter({
  host: REDIS_IP,
  port: REDIS_PORT
})
const megaphoneFactory = new MegaphoneFactory(emitter)
const megaphone = megaphoneFactory.create.bind(megaphoneFactory)

function SocketIoHandler (io, db) {
  this.io = io
  this.db = db
}

SocketIoHandler.prototype.init = async function () {
  logger.info('initializing db')
  await this.db.init()

  const allSockets = await this.io.of('/').adapter.sockets([])
  const connectingSocketIds = [...allSockets]
  const body = await this.db.removeOfflineUser(connectingSocketIds)
  const { offlines } = body
  await Promise.all(
    offlines.map(({ user, rooms }) => Promise.all(
      rooms.map((roomId) => megaphone(Interface.Broadcast.Room.LEAVE).status(200).send({ roomId, user }))
    ))
  )
}

SocketIoHandler.prototype.disconnect = async function (socketId = '') {
  const body = await this.db.signOut({ socketId })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.isValidUser = async function (userName = '') {
  const body = await this.db.isValidUser({ userName })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getUsers = async function (roomId = null) {
  const body = await this.db.getUsers({ roomId })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.signIn = async function (socketId = '', id = '', pw = '') {
  const body = await this.db.signIn({ socketId, id, pw })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.signUp = async function (socketId = '', id = '', pw = '', name = '', email = '', phone = '') {
  await this.db.signUp({ id, pw, name, email, phone })
  const body = await this.db.signIn({ socketId, id, pw })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getRooms = async function (startIndex = 0, limit = 0) {
  const body = await this.db.getRooms({ startIndex, limit })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getRoomsJoined = async function (userId = '') {
  const body = await this.db.getRoomsJoined({ userId })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getRoomsSearched = async function (title = '') {
  const body = await this.db.getRoomsSearched({ title })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.createRoom = async function (
  id = null,
  title = '',
  createBy = '',
  pw = '',
  maxJoin = 0,
  description = ''
) {
  const body = await this.db.createRoom({
    id,
    title,
    createBy,
    pw,
    maxJoin,
    description
  })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.updateRoom = async function (
  id = null,
  title = '',
  pw = '',
  maxJoin = 0,
  description = ''
) {
  const body = await this.db.updateRoom({
    id,
    title,
    pw,
    maxJoin,
    description
  })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.deleteRoom = async function (id = null) {
  const body = await this.db.deleteRoom({ id })

  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.joinRoom = async function (userId = '', socketId = '', id = null, pw = '') {
  const body = await this.db.joinRoom({ id, pw, userId })
  this.io.of('/').adapter.remoteJoin(socketId, String(id))
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.leaveRoom = async function (userId = '', socketId = '', id = null) {
  const body = await this.db.leaveRoom({ id, userId })
  this.io.of('/').adapter.remoteLeave(socketId, String(id))
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getOnlineMemberInRoom = async function (roomId = null) {
  const body = await this.db.getOnlineMembersInRoom({ roomId })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getMessagesInRoom = async function (userId = '', roomId = null, minIndex = -1) {
  const body = await this.db.getMessagesInRoom({ userId, roomId, minIndex })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getMessagesInRoomReconnect = async function (userId = '', roomId = null, startIndex = 0) {
  const body = await this.db.getMessagesInRoomReconnect({ userId, roomId, startIndex })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.writeMessage = async function (
  roomId = null,
  type = '',
  writter = '',
  content = '',
  recipients = []
) {
  const body = await this.db.writeMessage({
    roomId,
    type,
    writter,
    content,
    recipients
  })
  return {
    code: 200,
    body
  }
}

export default SocketIoHandler
