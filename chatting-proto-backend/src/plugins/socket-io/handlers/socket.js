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
  this.socket.on(Interface.Request.User.LIST, this.userList.bind(this))
  this.socket.on(Interface.Request.User.SIGNIN, this.signIn.bind(this))
  this.socket.on(Interface.Request.User.SIGNUP, this.signUp.bind(this))

  this.socket.on(Interface.Request.Room.LIST, this.roomList.bind(this))
  this.socket.on(Interface.Request.Room.CREATE, this.roomCreate.bind(this))
  this.socket.on(Interface.Request.Room.UPDATE, this.roomUpdate.bind(this))
  this.socket.on(Interface.Request.Room.DELETE, this.roomDelete.bind(this))
  this.socket.on(Interface.Request.Room.JOIN, this.roomJoin.bind(this))
  this.socket.on(Interface.Request.Room.JOIN_FORCE, this.roomJoinForce.bind(this))
  this.socket.on(Interface.Request.Room.LEAVE, this.roomLeave.bind(this))
  this.socket.on(Interface.Request.Room.SEARCH, this.roomSearch.bind(this))
  this.socket.on(Interface.Request.Room.JOINED, this.roomJoined.bind(this))
  this.socket.on(Interface.Request.Member.Online.ROOM, this.onlineMemberInRoom.bind(this))

  this.socket.on(Interface.Request.Message.LIST, this.messageList.bind(this))
  this.socket.on(Interface.Request.Message.WRITE, this.messageWrite.bind(this))
  this.socket.on(Interface.Request.Message.RECONNECT, this.messageListReconnect.bind(this))

  this.socket.on(Interface.DISCONNECT, this.disconnect.bind(this))
  this.socket.on(Interface.ERROR, this.onError.bind(this))
}

SocketHandler.prototype.disconnect = async function () {
  const { id: socketId = '' } = this.socket
  logger.info(`${socketId} has disconnect`)

  try {
    const { code, body } = await this.socketIoHandler.disconnect(socketId)
    const { rooms, user } = body
    await Promise.all(
      rooms.map(async (roomId) => {
        megaphone(Interface.Broadcast.Room.LEAVE).status(code).send({ roomId, user })
      })
    )
  } catch (e) {
    // user not signin
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
  const { roomId = null } = req.body
  const { code, body } = await this.socketIoHandler.getUsers(roomId)

  res.status(code).send(body)
}

SocketHandler.prototype.signIn = async function (req, callback) {
  const { id = '', pw = '' } = req.body
  const { id: socketId = '' } = this.socket
  const res = new Res(callback)

  try {
    const { code, body } = await this.socketIoHandler.signIn(socketId, id, pw)
    res.status(code).send(body)
  } catch (err) {
    res.status(304).send(err.message)
  }
}

SocketHandler.prototype.signUp = async function (req, callback) {
  const { id = '', pw = '', name = '', email = '', phone = '' } = req.body
  const { id: socketId = '' } = this.socket
  const res = new Res(callback)

  try {
    const { code, body } = await this.socketIoHandler.signUp(socketId, id, pw, name, email, phone)
    res.status(code).send(body)
  } catch (err) {
    res.status(304).send(err.message)
  }
}

SocketHandler.prototype.roomList = async function (req, callback) {
  const res = new Res(callback)
  const { startIndex = 0, limit = 0 } = req.body
  const { code, body } = await this.socketIoHandler.getRooms(startIndex, limit)
  res.status(code).send(body)
}

SocketHandler.prototype.roomJoined = async function (req, callback) {
  const res = new Res(callback)
  const { userId = '' } = req.body
  const { code, body } = await this.socketIoHandler.getRoomsJoined(userId)
  res.status(code).send(body)
}

SocketHandler.prototype.roomSearch = async function (req, callback) {
  const res = new Res(callback)
  const { title = '' } = req.body
  const { code, body } = await this.socketIoHandler.getRoomsSearched(title)
  res.status(code).send(body)
}

SocketHandler.prototype.roomCreate = async function (req, callback) {
  const res = new Res(callback)
  const {
    title = '',
    createBy = '',
    pw = '',
    maxJoin = 0,
    description = ''
  } = req.body

  try {
    const { code, body } = await this.socketIoHandler.createRoom(
      title,
      createBy,
      pw,
      maxJoin,
      description
    )

    res.status(code).send(body)

    megaphone(Interface.Broadcast.Room.CREATE).status(code).send(body)
  } catch (e) {
    logger.error(e)
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
  const { id = null, pw = '', userId = '' } = req.body
  const { id: socketId = '' } = this.socket
  try {
    const { code, body } = await this.socketIoHandler.joinRoom(userId, socketId, id, pw)
    res.status(code).send(body)

    megaphone(Interface.Broadcast.Room.JOIN).status(code).send(body)
  } catch (e) {
    if (e.message === '비밀번호가 틀렸습니다') {
      return res.status(304).send({ code: 201, message: e.message })
    }
    if (e.message === '이미 방에 참여했습니다') {
      return res.status(401).send({ code: 202, message: e.message })
    }
    throw new Error(e)
  }
}

SocketHandler.prototype.roomJoinForce = async function (req, callback) {
  const res = new Res(callback)
  const { id = null, pw = '', userId = '' } = req.body
  const { id: socketId = '' } = this.socket
  try {
    const { code, body } = await this.socketIoHandler.joinRoomForce(userId, socketId, id, pw)
    res.status(code).send(body.join)
    megaphone(Interface.Broadcast.Room.JOIN).status(code).send(body.join)

    megaphone(Interface.Response.Room.JOIN_FORCE).to(body.prevSocketId).send()
    megaphone(Interface.Broadcast.Room.LEAVE).status(code).send(body.leave)
  } catch (e) {
    if (e.message === '비밀번호가 틀렸습니다') {
      return res.status(304).send({ code: 201, message: e.message })
    }
    if (e.message === '이미 방에 참여했습니다') {
      return res.status(401).send({ code: 202, message: e.message })
    }
    throw new Error(e)
  }
}
SocketHandler.prototype.roomLeave = async function (req, callback) {
  const res = new Res(callback)
  const { id = null, userId = '' } = req.body
  const { id: socketId = '' } = this.socket
  const { code, body } = await this.socketIoHandler.leaveRoom(userId, socketId, id)
  res.status(code).send(body)

  megaphone(Interface.Broadcast.Room.LEAVE).status(code).send(body)
}

SocketHandler.prototype.onlineMemberInRoom = async function (req, callback) {
  const res = new Res(callback)
  const { roomId = null } = req.body
  const { code, body } = await this.socketIoHandler.getOnlineMemberInRoom(roomId)
  res.status(code).send(body)
}

SocketHandler.prototype.messageList = async function (req, callback) {
  const res = new Res(callback)
  const { userId = '', roomId = null, minIndex = -1 } = req.body
  const { code, body } = await this.socketIoHandler.getMessagesInRoom(userId, roomId, minIndex)
  res.status(code).send(body)
}

SocketHandler.prototype.messageListReconnect = async function (req, callback) {
  const res = new Res(callback)
  const { userId = '', roomId = null, startIndex = 0 } = req.body
  const { code, body } = await this.socketIoHandler.getMessagesInRoomReconnect(userId, roomId, startIndex)
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
