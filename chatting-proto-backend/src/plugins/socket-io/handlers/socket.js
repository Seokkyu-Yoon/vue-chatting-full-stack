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

  const { body: { rooms } } = await this.socketIoHandler.disconnect(userId)

  await Promise.all(
    rooms.map(async (roomTitle) => {
      megaphone(Interface.Broadcast.Room.LEAVE).status(200).send({ roomTitle, socketId: userId })
    })
  )
}

SocketHandler.prototype.userIsValid = async function (req, callback) {
  const { userName } = req.body
  const { code, body } = await this.socketIoHandler.isValidUser(userName)
  const res = new Res(callback)
  res.status(code).send(body)
}

SocketHandler.prototype.userList = async function (req, callback) {
  const { roomTitle = '', startIndex = 0 } = req.body
  const { code, body } = await this.socketIoHandler.getUsers(roomTitle, startIndex)

  const res = new Res(callback)
  res.status(code).send(body)
}

SocketHandler.prototype.userLogin = async function (req, callback) {
  const { userName = '', room = '' } = req.body
  const { id: userId = '' } = this.socket
  const res = new Res(callback)

  try {
    const { code, body } = await this.socketIoHandler.loginUser(userId, userName, room)
    res.status(code).send(body)

    if (!room) return
    const { code: codeUserMap, body: bodyUserMap } = await this.socketIoHandler.getUsers(body.roomKey)
    megaphone(Interface.Broadcast.User.LIST).to(room).status(codeUserMap).send(bodyUserMap)
  } catch (err) {
    res.status(304).send(err.message)
  }
}

SocketHandler.prototype.roomList = async function (req, callback) {
  const { startIndex = 0 } = req.body
  const { code, body } = await this.socketIoHandler.getRooms(startIndex)
  const res = new Res(callback)
  res.status(code).send(body)
}

SocketHandler.prototype.roomCreate = async function (req, callback) {
  const {
    title = '',
    createBy = '',
    pw = '',
    maxJoin = 0,
    description = ''
  } = req.body
  const { code, body } = await this.socketIoHandler.createRoom({
    title,
    createBy,
    pw,
    maxJoin,
    description
  })
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.CREATE).status(code).send(body)
}
SocketHandler.prototype.roomUpdate = async function (req, callback) {
  const {
    title = '',
    pw = '',
    maxJoin = 0,
    description = ''
  } = req.body

  const { code, body } = await this.socketIoHandler.updateRoom(
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
  const { title = '' } = req.body
  const { code, body } = await this.socketIoHandler.deleteRoom(title)
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.DELETE).status(code).send(body)
}

SocketHandler.prototype.roomJoin = async function (req, callback) {
  const { title = '' } = req.body
  const { id: userId = '' } = this.socket
  const { code, body } = await this.socketIoHandler.joinRoom(title, userId)
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.JOIN).status(code).send(body)
}

SocketHandler.prototype.roomLeave = async function (req, callback) {
  const { title = '' } = req.body
  const {
    id: userId = ''
  } = this.socket
  const { code, body } = await this.socketIoHandler.leaveRoom(userId, title)
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.LEAVE).status(code).send(body)
}

SocketHandler.prototype.messageList = async function (req, callback) {
  const { title = '', minIndex = -1 } = req.body
  const { code, body } = await this.socketIoHandler.getMessages(title, minIndex)
  const res = new Res(callback)
  res.status(code).send(body)
}

SocketHandler.prototype.messageListReconnect = async function (req, callback) {
  const { title = '', startIndex = 0 } = req.body
  const { code, body } = await this.socketIoHandler.getMessages(title, startIndex)
  const res = new Res(callback)
  res.status(code).send(body)
}

SocketHandler.prototype.messageWrite = async function (req, callback) {
  const {
    title = '',
    typeIdx = 1,
    writter = '',
    content = '',
    recipients = []
  } = req.body
  const { code, body } = await this.socketIoHandler.writeMessage(
    title,
    typeIdx,
    writter,
    content,
    recipients
  )
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Message.WRITE).to(title).status(code).send(body)
}

SocketHandler.prototype.onError = async function (err) {
  logger.error(err)
}

export default SocketHandler
