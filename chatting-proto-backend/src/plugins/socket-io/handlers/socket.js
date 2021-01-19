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

  socket.on(Interface.Request.User.LOGIN, this.userLogin.bind(this))
  socket.on(Interface.Request.User.LIST, this.userList.bind(this))
  socket.on(Interface.Request.User.IS_VALID, this.userIsValid.bind(this))

  socket.on(Interface.Request.Room.LIST, this.roomList.bind(this))
  socket.on(Interface.Request.Room.JOIN, this.roomJoin.bind(this))
  socket.on(Interface.Request.Room.CREATE, this.roomCreate.bind(this))
  socket.on(Interface.Request.Room.UPDATE, this.roomUpdate.bind(this))
  socket.on(Interface.Request.Room.LEAVE, this.roomLeave.bind(this))
  socket.on(Interface.Request.Room.DELETE, this.roomDelete.bind(this))

  socket.on(Interface.Request.Message.LIST, this.messageList.bind(this))
  socket.on(Interface.Request.Message.WRITE, this.messageWrite.bind(this))
  socket.on(Interface.Request.Message.RECONNECT, this.messageReconnect.bind(this))

  socket.on(Interface.DISCONNECT, this.disconnect.bind(this))
  socket.on(Interface.ERROR, this.onError.bind(this))
}

SocketHandler.prototype.userIsValid = async function (req, callback) {
  const { userName } = req.body
  const { code, body } = await this.socketIoHandler.isValidUser(userName)
  const res = new Res(callback)
  res.status(code).send(body)
}
SocketHandler.prototype.userLogin = async function (req, callback) {
  const { userName = '', room = '' } = req.body
  const { id: socketId } = this.socket

  const { code, body } = await this.socketIoHandler.loginUser(socketId, userName, room)
  const res = new Res(callback)
  res.status(code).send(body)

  if (!room) return
  const { code: codeUserMap, body: bodyUserMap } = await this.socketIoHandler.getUsers(body.roomKey)
  megaphone(Interface.Broadcast.User.LIST).to(room).status(codeUserMap).send(bodyUserMap)
}
SocketHandler.prototype.userList = async function (req, callback) {
  const { roomTitle = '', startIndex } = req.body
  const { code, body } = await this.socketIoHandler.getUsers(roomTitle, startIndex)

  const res = new Res(callback)
  res.status(code).send(body)
}
SocketHandler.prototype.roomList = async function (req, callback) {
  const { startIndex = 0 } = req.body
  const { code, body } = await this.socketIoHandler.getRooms(startIndex)
  const res = new Res(callback)
  res.status(code).send(body)
}
SocketHandler.prototype.roomJoin = async function (req, callback) {
  const { id: socketId } = this.socket
  const { roomTitle = '' } = req.body
  const { code, body } = await this.socketIoHandler.joinRoom(roomTitle)
  if (code === 200) {
    this.socketIoHandler.io.of('/').adapter.remoteJoin(socketId, roomTitle)
  }
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.JOIN).status(code).send(body)
}
SocketHandler.prototype.roomCreate = async function (req, callback) {
  const {
    title,
    createBy,
    pw,
    maxJoin,
    description
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
    roomKey,
    roomName,
    roomPassword,
    roomMaxJoin,
    roomDesc
  } = req.body

  const { code, body } = await this.socketIoHandler.updateRoom(roomKey, roomName, roomPassword, roomMaxJoin, roomDesc)
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.UPDATE).status(code).send(body)
}
SocketHandler.prototype.roomLeave = async function (req, callback) {
  const { roomKey } = req.body
  const {
    id: socketId,
    rooms: socketRooms
  } = this.socket
  const { code, body } = await this.socketIoHandler.leaveRoom(socketId, socketRooms, roomKey)
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.LEAVE).status(code).send(body)
}
SocketHandler.prototype.roomDelete = async function (req, callback) {
  const { id: socketId } = this.socket
  const { roomKey } = req.body
  const { code, body } = await this.socketIoHandler.deleteRoom(socketId, roomKey)
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.DELETE).status(code).send(body)
}
SocketHandler.prototype.messageList = async function (req, callback) {
  const { roomKey, minIndex = -1 } = req.body
  const { code, body } = await this.socketIoHandler.getMessages(roomKey, minIndex)
  const res = new Res(callback)
  res.status(code).send(body)
}
SocketHandler.prototype.messageWrite = async function (req, callback) {
  const { id: socketId } = this.socket
  const { roomKey, text } = req.body
  const { code, body } = await this.socketIoHandler.writeMessage(socketId, roomKey, text)
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Message.WRITE).to(roomKey).status(code).send(body)
}
SocketHandler.prototype.messageReconnect = async function (req, callback) {
  const { roomKey, minIndex = -1 } = req.body
  const { code, body } = await this.socketIoHandler.getMessages(roomKey, minIndex, true)
  const res = new Res(callback)
  res.status(code).send(body)
}
SocketHandler.prototype.disconnect = async function () {
  const { id: socketId } = this.socket
  logger.info(`${socketId} has disconnect`)

  const { body: { rooms } } = await this.socketIoHandler.disconnect(socketId)

  await Promise.all(
    rooms.map(async (roomTitle) => {
      megaphone(Interface.Broadcast.Room.LEAVE).status(200).send({ roomTitle, socketId })
    })
  )
}
SocketHandler.prototype.onError = async function (err) {
  logger.error(err)
}

export default SocketHandler
