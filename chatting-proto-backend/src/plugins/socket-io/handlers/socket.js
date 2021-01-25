import socketIoEmitter from 'socket.io-emitter'

import { logger, MegaphoneFactory, Res } from '@/core'

import Interface from '../interface'

const { REDIS_IP, REDIS_PORT } = process.env
const emitter = socketIoEmitter({
  host: REDIS_IP,
  port: REDIS_PORT
})
const megaphoneFactory = new MegaphoneFactory(emitter)
const megaphone = megaphoneFactory.create.bind(megaphoneFactory)

/**
 *
 * @param {*} socket
 * @param {SocketIoHandler} socketIoHandler
 */
function SocketHandler (socket, socketIoHandler) {
  logger.info(`${socket.id} has connect`)
  this.socket = socket
  this.socketIoHandler = socketIoHandler
  this.init()
}

SocketHandler.prototype.init = function () {
  this.socket.on(Interface.Request.User.IS_VALID, this.userIsValid.bind(this))
  this.socket.on(Interface.Request.User.LIST, this.userList.bind(this))
  this.socket.on(Interface.Request.User.LOGIN, this.userLogin.bind(this))

  this.socket.on(Interface.Request.Room.LIST, this.roomList.bind(this))
  this.socket.on(Interface.Request.Room.CREATE, this.roomCreate.bind(this))
  this.socket.on(Interface.Request.Room.UPDATE, this.roomUpdate.bind(this))
  this.socket.on(Interface.Request.Room.DELETE, this.roomDelete.bind(this))
  this.socket.on(Interface.Request.Room.JOIN, this.roomJoin.bind(this))
  this.socket.on(Interface.Request.Room.LEAVE, this.roomLeave.bind(this))

  this.socket.on(Interface.Request.Message.LIST, this.messageList.bind(this))
  this.socket.on(Interface.Request.Message.WRITE, this.messageWrite.bind(this))
  this.socket.on(Interface.Request.Message.RECONNECT, this.messageListReconnect.bind(this))

  this.socket.on(Interface.DISCONNECT, this.disconnect.bind(this))
  this.socket.on(Interface.ERROR, this.onError.bind(this))
}

SocketHandler.prototype.disconnect = async function () {
  const { id: userId = '' } = this.socket
  logger.info(`${userId} has disconnect`)

  try {
    const { code, body } = await this.socketIoHandler.disconnect(userId)

    await Promise.all(
      body.map(async ({ roomId }) => {
        megaphone(Interface.Broadcast.Room.LEAVE).status(code).send({ roomId })
      })
    )
  } catch (e) {
    // user not logined
  }
}

SocketHandler.prototype.userIsValid = async function (req, callback) {
  const res = new Res(callback)
  const { userName } = req.body
  const { code, body } = await this.socketIoHandler.isValidUser(userName)
  res.status(code).send(body)
}

SocketHandler.prototype.userList = async function (req, callback) {
  const res = new Res(callback)
  // const { roomId = null, startIndex = 0 } = req.body
  // const { code, body } = await this.socketIoHandler.getUsers(roomId, startIndex)
  const { roomId = null } = req.body
  const { code, body } = await this.socketIoHandler.getUsers(roomId)

  res.status(code).send(body)
}

SocketHandler.prototype.userLogin = async function (req, callback) {
  const { userName = '', roomId = null, pw = '' } = req.body
  const { id: userId = '' } = this.socket
  const res = new Res(callback)

  try {
    const { code, body } = await this.socketIoHandler.loginUser(userId, userName, roomId, pw)
    res.status(code).send(body)

    if (typeof body.room.id === 'undefined') return
    megaphone(Interface.Broadcast.Room.JOIN).status(code).send(body)
  } catch (err) {
    res.status(304).send(err.message)
  }
}

SocketHandler.prototype.roomList = async function (req, callback) {
  const res = new Res(callback)
  const { startIndex = 0 } = req.body
  const { code, body } = await this.socketIoHandler.getRooms(startIndex)
  res.status(code).send(body)
}

SocketHandler.prototype.roomCreate = async function (req, callback) {
  const res = new Res(callback)
  const {
    id = null,
    title = '',
    createBy = '',
    pw = '',
    maxJoin = 0,
    description = ''
  } = req.body

  try {
    const { code, body } = await this.socketIoHandler.createRoom(
      id,
      title,
      createBy,
      pw,
      maxJoin,
      description
    )
    res.status(code).send(body)

    megaphone(Interface.Broadcast.Room.CREATE).status(code).send(body)
  } catch (e) {
    res.status(403).send(e.message)
  }
}
SocketHandler.prototype.roomUpdate = async function (req, callback) {
  const {
    id = null,
    title = '',
    pw = '',
    maxJoin = 0,
    description = ''
  } = req.body

  const { code, body } = await this.socketIoHandler.updateRoom(
    id,
    title,
    pw,
    maxJoin,
    description
  )
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.UPDATE).status(code).send(body)
}

SocketHandler.prototype.roomDelete = async function (req, callback) {
  const res = new Res(callback)
  const { id = null } = req.body
  const { code, body } = await this.socketIoHandler.deleteRoom(id)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.DELETE).status(code).send(body)
}

SocketHandler.prototype.roomJoin = async function (req, callback) {
  const res = new Res(callback)
  const { id = null, pw = '' } = req.body
  const { id: userId = '' } = this.socket
  const { code, body } = await this.socketIoHandler.joinRoom(id, userId, pw)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.JOIN).status(code).send(body)
}

SocketHandler.prototype.roomLeave = async function (req, callback) {
  const res = new Res(callback)
  const { id = null } = req.body
  const {
    id: userId = ''
  } = this.socket
  const { code, body } = await this.socketIoHandler.leaveRoom(id, userId)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.LEAVE).status(code).send(body)
}

SocketHandler.prototype.messageList = async function (req, callback) {
  const res = new Res(callback)
  const { roomId = null, minIndex = -1 } = req.body
  const { code, body } = await this.socketIoHandler.getMessages(roomId, minIndex)
  res.status(code).send(body)
}

SocketHandler.prototype.messageListReconnect = async function (req, callback) {
  const res = new Res(callback)
  const { roomId = null, startIndex = 0 } = req.body
  const { code, body } = await this.socketIoHandler.getMessages(roomId, startIndex)
  res.status(code).send(body)
}

SocketHandler.prototype.messageWrite = async function (req, callback) {
  const res = new Res(callback)
  const {
    roomId = null,
    type = '',
    writter = '',
    content = '',
    recipients = []
  } = req.body
  const { code, body } = await this.socketIoHandler.writeMessage(
    roomId,
    type,
    writter,
    content,
    recipients
  )
  res.status(code).send(body)
  megaphone(Interface.Broadcast.Message.WRITE).to(String(roomId)).status(code).send(body)
}

SocketHandler.prototype.onError = async function (err) {
  logger.error(err)
}

export default SocketHandler
