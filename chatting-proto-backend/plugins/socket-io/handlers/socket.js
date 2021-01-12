import socketIoEmitter from 'socket.io-emitter'

import Interface from '../interface'

import { ConfigRedis } from '../../../config'
import { logger, MegaphoneFactory, Res } from '../../../core'

const emitter = socketIoEmitter(ConfigRedis)
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

SocketHandler.prototype.userLogin = async function (req, callback) {
  const { userName, roomKey = null } = req.body
  const { id: socketId } = this.socket

  const { code, body } = await this.socketIoHandler.loginUser(socketId, userName, roomKey)
  const res = new Res(callback)
  res.status(code).send(body)

  if (roomKey === null) return
  const { code: codeUserMap, body: bodyUserMap } = await this.socketIoHandler.getUsers(body.roomKey)
  megaphone(Interface.Broadcast.User.LIST).to(roomKey).status(codeUserMap).send(bodyUserMap)
}
SocketHandler.prototype.userList = async function (req, callback) {
  const { roomKey, startIndex } = req.body
  const { code, body } = await this.socketIoHandler.getUsers(roomKey, startIndex)

  const res = new Res(callback)
  res.status(code).send(body)
}
SocketHandler.prototype.userIsValid = async function (req, callback) {
  const { userName } = req.body
  const { code, body } = await this.socketIoHandler.isValidUser(userName)
  const res = new Res(callback)
  res.status(code).send(body)
}
SocketHandler.prototype.roomList = async function (req, callback) {
  const { roomKey = null, startIndex = 0 } = req.body
  const { code, body } = await this.socketIoHandler.getRooms(roomKey, startIndex)
  const res = new Res(callback)
  res.status(code).send(body)
}
SocketHandler.prototype.roomJoin = async function (req, callback) {
  const { id: socketId } = this.socket
  const { roomKey } = req.body
  const { code, body } = await this.socketIoHandler.joinRoom(socketId, roomKey)
  const res = new Res(callback)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.JOIN).status(code).send(body)
}
SocketHandler.prototype.roomCreate = async function (req, callback) {
  const { id: socketId } = this.socket
  const {
    roomName,
    roomPassword,
    roomMaxJoin,
    roomDesc
  } = req.body
  const { code, body } = await this.socketIoHandler.createRoom(socketId, roomName, roomPassword, roomMaxJoin, roomDesc)
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
  const {
    id: socketId,
    rooms: socketRooms
  } = this.socket
  logger.info(`${socketId} has disconnect`)
  if (typeof this.socketIoHandler.sockets[socketId] === 'undefined') return

  const roomKeys = this.socketIoHandler.sockets[socketId]
  await Promise.all(
    [...roomKeys].map(async (roomKey) => {
      const { code, body } = await this.socketIoHandler.leaveRoom(socketId, socketRooms, roomKey)

      megaphone(Interface.Broadcast.Room.LEAVE).status(code).send(body)
    })
  )
  await this.socketIoHandler.db.deleteUser(socketId)
  delete this.socketIoHandler.sockets[socketId]
}
SocketHandler.prototype.onError = async function (err) {
  logger.error(err)
}

export default SocketHandler
