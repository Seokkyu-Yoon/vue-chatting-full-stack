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

SocketIoHandler.prototype.disconnect = async function (userId = '') {
  const body = await this.db.logout({ userId })
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

SocketIoHandler.prototype.getUsers = async function (roomTitle = '', startIndex = 0) {
  const body = await this.db.getUsers({ roomTitle, startIndex })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.loginUser = async function (socketId, userName, roomTitle) {
  const body = await this.db.login({ socketId, userName, roomTitle })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getRooms = async function (startIndex = 0) {
  const body = await this.db.getRooms({ startIndex })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.createRoom = async function (
  title = '',
  createBy = '',
  pw = '',
  maxJoin = 0,
  description = ''
) {
  const body = await this.db.createRoom({
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
  title = '',
  pw = '',
  maxJoin = 0,
  description = ''
) {
  const body = await this.db.updateRoom({
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

SocketIoHandler.prototype.deleteRoom = async function (title = '') {
  const body = await this.db.deleteRoom({ title })

  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.joinRoom = async function (title = '', userId = '', pw = '') {
  const body = await this.db.joinRoom({ title, userId, pw })
  this.socketIoHandler.io.of('/').adapter.remoteJoin(userId, title)
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.leaveRoom = async function (title = '', userId = '') {
  const body = await this.db.leaveRoom({ title, userId })
  this.socketIoHandler.io.of('/').adapter.remoteLeave(userId, title)
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getMessages = async function (title = '', minIndex = -1) {
  const body = await this.db.getMessages({ title, minIndex })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.getMessageReconnect = async function (title = '', startIndex = 0) {
  const body = await this.db.getMessageReconnect({ title, startIndex })
  return {
    code: 200,
    body
  }
}

SocketIoHandler.prototype.writeMessage = async function (
  title = '',
  typeIdx = 1,
  writter = '',
  content = '',
  recipients = []
) {
  const body = await this.db.writeMessage({
    title,
    typeIdx,
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
