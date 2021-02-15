import { logger } from '@/core'

function SocketIoHandler (io, db) {
  this.io = io
  this.db = db
}

SocketIoHandler.prototype.init = async function () {
  logger.info('initializing db')
  await this.db.init()

  const allSockets = await this.io.of('/').adapter.sockets([])
  const connectingSocketIds = [...allSockets]
  await this.db.removeTrashUser(connectingSocketIds)
}

SocketIoHandler.prototype.disconnect = async function (socketId = '') {
  const { rooms } = await this.db.logout({ socketId })
  const body = await Promise.all(
    rooms.map(async (roomId) => ({ roomId }))
  )
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

SocketIoHandler.prototype.loginUser = async function (socketId = '', userName = '', userId = Math.round(Math.random() * 9999999), id = null, pw = '') {
  const body = await this.db.login({ socketId, userName, userId })
  if (id) {
    const bodyJoin = await this.db.joinRoom({ id, socketId, pw })
    this.io.of('/').adapter.remoteJoin(socketId, String(id))
    return {
      body: {
        ...body,
        ...bodyJoin
      }
    }
  }
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getRooms = async function (startIndex = 0, userId = -1) {
  const body = await this.db.getRooms({ startIndex, userId })
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

SocketIoHandler.prototype.joinRoom = async function (id = null, socketId = '', pw = '') {
  const body = await this.db.joinRoom({ id, socketId, pw })
  this.io.of('/').adapter.remoteJoin(socketId, String(id))
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.leaveRoom = async function (id = '', socketId = '') {
  const body = await this.db.leaveRoom({ id, socketId })
  this.io.of('/').adapter.remoteLeave(socketId, String(id))
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getMessages = async function (roomId = null, minIndex = -1) {
  const body = await this.db.getMessages({ roomId, minIndex })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getMessageReconnect = async function (roomId = null, startIndex = 0) {
  const body = await this.db.getMessageReconnect({ roomId, startIndex })
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
