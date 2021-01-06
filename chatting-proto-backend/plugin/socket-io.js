import logger from 'debug'

import SocketIo from 'socket.io'
import socketIoRedis from 'socket.io-redis'
import socketIoEmitter from 'socket.io-emitter'

import Res from '../core/response'

import Interface from './interface'

const debug = logger('chatting-proto-backend:server:socket')

const Config = {
  SocketIo: {
    cors: {
      origin: '*',
      method: ['GET', 'POST']
    }
  },
  Redis: {
    host: 'localhost',
    port: 6379
  }
}

const emitter = socketIoEmitter(Config.Redis)

async function getTrashUsers (connectingSocketIds = [], savedSocketIds = []) {
  const trashUsersSet = new Set(savedSocketIds)
  await Promise.all(connectingSocketIds.map(async (socketId) => {
    trashUsersSet.delete(socketId)
  }))
  return [...trashUsersSet]
}

function getBase36RandomStr () {
  return Math.random().toString(36).substring(2, 15)
}
async function getRandomHash () {
  return `${getBase36RandomStr()}${getBase36RandomStr()}${getBase36RandomStr()}`
}

function makeCallback (type, eventEmitter) {
  return (payload) => {
    eventEmitter.emit(type, payload)
  }
}

function SocketHandler (io, redis) {
  this.io = io
  this.redis = redis
  this.sockets = {}
}
SocketHandler.prototype.getRoomKey = async function getRoomKey () {
  let roomKey = await getRandomHash()
  while (await this.redis.existsRoom({ roomKey })) {
    roomKey = await getRandomHash()
  }
  return roomKey
}
SocketHandler.prototype.init = async function init () {
  debug('cleaning users')
  const allSockets = await this.io.of('/').adapter.sockets([])
  const connectingSocketIds = [...allSockets]
  const savedSocketIds = await this.redis.getSocketIds()
  const trashUsers = await getTrashUsers(connectingSocketIds, savedSocketIds)

  if (trashUsers.length === 0) {
    debug('finished cleaning')
    return
  }
  await Promise.all(
    trashUsers.map(async (socketId) => {
      await this.redis.deleteUser(socketId)
      if (this.sockets[socketId]) {
        delete this.sockets[socketId]
      }
    })
  )

  const userMap = {}
  await Promise.all(connectingSocketIds.map(async (socketId) => {
    const userName = await this.redis.getUserName(socketId)
    if (userName === null) return
    userMap[socketId] = { userName }
  }))
  debug('finished cleaning')
}

SocketHandler.prototype.getUsers = async function getUserMap (roomKey = null, startIndex = 0) {
  if (roomKey === null) {
    return {
      code: 304,
      body: {
        users: []
      }
    }
  }
  const socketIds = await this.io.of('/').adapter.sockets([roomKey])

  const users = await Promise.all([...socketIds].map(async (socketId) => {
    const userName = await this.redis.getUserName(socketId)
    if (userName === null) return
    return {
      socketId,
      userName
    }
  }))

  return {
    body: {
      users: users.slice(startIndex, startIndex + 10)
    }
  }
}

SocketHandler.prototype.getRooms = async function getRooms (roomKey = null, startIndex = 0) {
  const roomMap = await this.redis.getRoom(roomKey)

  const rooms = await Promise.all(Object.keys(roomMap).map(async (savedRoomKey) => {
    const roomSockets = (await this.io.of('/').adapter.sockets([savedRoomKey])) || new Set()
    const roomData = roomMap[savedRoomKey]
    return {
      roomKey: savedRoomKey,
      ...roomData,
      joining: roomSockets.size
    }
  }))
  return {
    body: {
      rooms: rooms.slice(startIndex, startIndex + 10)
    }
  }
}

SocketHandler.prototype.getMessages = async function getMessages (roomKey = null, finalPosition = -1) {
  if (roomKey === null) {
    return {
      code: 304,
      body: {
        messages: []
      }
    }
  }
  const messages = await this.redis.getMessages(roomKey)
  let tail = messages.length
  if (finalPosition > -1) {
    tail = finalPosition
  }
  if (finalPosition > messages.length) {
    tail = messages.length
  }
  return {
    body: {
      messages: messages.slice(tail - 50, tail),
      lastIndex: finalPosition
    }
  }
}

SocketHandler.prototype.isValidUser = async function isValidUser (userName) {
  if (userName === '') {
    return {
      body: {
        isValid: false
      }
    }
  }
  const socketIds = await this.io.of('/').adapter.sockets([])
  for (const socketId of [...socketIds]) {
    const redisUserName = await this.redis.getUserName(socketId)
    if (redisUserName === userName) {
      return {
        body: {
          isValid: false
        }
      }
    }
  }
  return {
    body: {
      isValid: true
    }
  }
}

SocketHandler.prototype.loginUser = async function loginUser (socketId, userName, roomKey = null) {
  const { code, body } = await this.isValidUser(userName)

  if (!body.isValid) {
    return {
      body: {
        ...body,
        userName: '',
        roomKey: null
      }
    }
  }
  await this.redis.addUser(socketId, userName)

  const resBody = { ...body, userName, roomKey }
  const roomKeys = new Set()
  if (roomKey !== null && this.redis.existsRoom(roomKey)) {
    await this.io.of('/').adapter.remoteJoin(socketId, roomKey)
    roomKeys.add(roomKey)
  }

  this.sockets[socketId] = roomKeys
  return {
    code,
    body: resBody
  }
}

SocketHandler.prototype.createRoom = async function createRoom (socketId, roomName, roomPassword, roomMaxJoin, roomDesc) {
  const userName = await this.redis.getUserName(socketId)
  debug(`${userName} create room`)
  const roomKey = await this.getRoomKey()
  await this.redis.createRoom({
    userName,
    roomKey,
    roomName,
    roomPassword,
    roomMaxJoin,
    roomDesc
  })
  const { code, body } = await this.joinRoom(socketId, roomKey)
  return {
    code,
    body
  }
}

SocketHandler.prototype.updateRoom = async function updateRoom (roomKey, roomName, roomPassword, roomMaxJoin, roomDesc) {
  await this.redis.updateRoom({
    roomKey,
    roomName,
    roomPassword,
    roomMaxJoin,
    roomDesc
  })

  return {
    body: {
      room: {
        roomKey,
        roomName,
        roomPassword,
        roomMaxJoin,
        roomDesc
      }
    }
  }
}

SocketHandler.prototype.joinRoom = async function joinRoom (socketId, roomKey) {
  const userName = await this.redis.getUserName(socketId)
  debug(`${userName} join ${roomKey}`)
  await this.redis.joinRoom({ userName, roomKey })
  this.io.of('/').adapter.remoteJoin(socketId, roomKey)
  this.sockets[socketId].add(roomKey)

  const room = await this.redis.getRoom(roomKey)
  return {
    body: {
      room: {
        roomKey,
        ...room
      }
    }
  }
}

SocketHandler.prototype.leaveRoom = async function leaveRoom (socketId, socketRooms, roomKey) {
  const userName = await this.redis.getUserName(socketId)
  debug(`${userName} leave ${roomKey}`)
  await this.redis.leaveRoom({ userName, roomKey })
  this.sockets[socketId].delete(roomKey)
  if (socketRooms.has(roomKey)) {
    this.io.of('/').adapter.remoteLeave(socketId, roomKey)
  }
  return {
    body: {
      socketId,
      roomKey
    }
  }
}

SocketHandler.prototype.deleteRoom = async function deleteRoom (socketId, roomKey) {
  const userName = await this.redis.getUserName(socketId)
  debug(`${userName} delete ${roomKey}`)
  const joiningSocketIds = await this.io.of('/').adapter.sockets([roomKey])
  await this.redis.deleteRoom({ roomKey })

  const socketIds = [...joiningSocketIds]
  socketIds.forEach((socketId) => {
    this.io.of('/').adapter.remoteLeave(socketId, roomKey)
  })

  return {
    body: {
      socketIds,
      roomKey
    }
  }
}

SocketHandler.prototype.writeMessage = async function writeMessage (socketId, roomKey, text) {
  const userName = await this.redis.getUserName(socketId)
  const message = await this.redis.writeMessage({
    type: 'message',
    userName,
    roomKey,
    text
  })
  return {
    body: {
      wrote: true,
      message
    }
  }
}

async function activate (server, redis) {
  const sockets = {}

  debug('activate socket.io')
  const io = SocketIo(server, Config.SocketIo)
  io.adapter(socketIoRedis(Config.Redis))

  const socketHandler = new SocketHandler(io, redis)

  async function disconnect (socket) {
    const socketId = socket.id
    const socketRooms = socket.rooms
    debug(`${socket.id} has disconnect`)
    if (typeof sockets[socketId] === 'undefined') return

    const roomKeys = sockets[socketId]
    await Promise.all(
      [...roomKeys].map(async (roomKey) => {
        const { code, body } = await socketHandler.leaveRoom(socketId, socketRooms, roomKey)
        const callback = makeCallback(Interface.Broadcast.Room.LEAVE, emitter.broadcast)
        const res = new Res(callback)
        res.status(code).send(body)
      })
    )
    await redis.deleteUser(socketId)
    delete sockets[socketId]
  }

  async function connection (socket) {
    debug(`${socket.id} has connect`)
    // *** User Login
    socket.on(Interface.Request.User.LOGIN, async (req, callback) => {
      const { userName, roomKey = null } = req.body
      const { id: socketId } = socket

      const { code, body } = await socketHandler.loginUser(socketId, userName, roomKey)
      const res = new Res(callback)
      res.status(code).send(body)

      if (roomKey === null) return
      const { code: codeUserMap, body: bodyUserMap } = await socketHandler.getUsers(body.roomKey)
      const callbackUserMap = makeCallback(Interface.Broadcast.User.LIST, emitter.to(roomKey))
      const resUserMap = new Res(callbackUserMap)
      resUserMap.status(codeUserMap).send(bodyUserMap)
    })

    // *** User List
    socket.on(Interface.Request.User.LIST, async (req, callback) => {
      const { roomKey, startIndex } = req.body
      const { code, body } = await socketHandler.getUsers(roomKey, startIndex)

      const res = new Res(callback)
      res.status(code).send(body)
    })

    // *** Check valid user
    socket.on(Interface.Request.User.IS_VALID, async (req, callback) => {
      const { userName } = req.body
      const { code, body } = await socketHandler.isValidUser(userName)
      const res = new Res(callback)
      res.status(code).send(body)
    })

    // *** Room List
    socket.on(Interface.Request.Room.LIST, async (req, callback) => {
      const { roomKey = null, startIndex = 0 } = req.body
      const { code, body } = await socketHandler.getRooms(roomKey, startIndex)
      const res = new Res(callback)
      res.status(code).send(body)
    })

    // *** Join Room
    socket.on(Interface.Request.Room.JOIN, async (req, callback) => {
      const { id: socketId } = socket
      const { roomKey } = req.body
      const { code, body } = await socketHandler.joinRoom(socketId, roomKey)
      const res = new Res(callback)
      res.status(code).send(body)

      const callbackRoomJoin = makeCallback(Interface.Broadcast.Room.JOIN, emitter.broadcast)
      const resRoomJoin = new Res(callbackRoomJoin)
      resRoomJoin.status(code).send(body)
    })

    // *** Create Room
    socket.on(Interface.Request.Room.CREATE, async (req, callback) => {
      const { id: socketId } = socket
      const {
        roomName,
        roomPassword,
        roomMaxJoin,
        roomDesc
      } = req.body
      const { code, body } = await socketHandler.createRoom(socketId, roomName, roomPassword, roomMaxJoin, roomDesc)
      const res = new Res(callback)
      res.status(code).send(body)

      const callbackCreateRoom = makeCallback(Interface.Broadcast.Room.CREATE, emitter.broadcast)
      const resCreateRoom = new Res(callbackCreateRoom)
      resCreateRoom.status(code).send(body)
    })

    // *** Update Room
    socket.on(Interface.Request.Room.UPDATE, async (req, callback) => {
      const {
        roomKey,
        roomName,
        roomPassword,
        roomMaxJoin,
        roomDesc
      } = req.body

      const { code, body } = await socketHandler.updateRoom(roomKey, roomName, roomPassword, roomMaxJoin, roomDesc)
      const res = new Res(callback)
      res.status(code).send(body)

      const callbackUpdateRoom = makeCallback(Interface.Broadcast.Room.UPDATE, emitter.broadcast)
      const resUpdateRoom = new Res(callbackUpdateRoom)
      resUpdateRoom.status(code).send(body)
    })

    // *** Leave Room
    socket.on(Interface.Request.Room.LEAVE, async (req, callback) => {
      const { roomKey } = req.body
      const {
        id: socketId,
        rooms: socketRooms
      } = socket
      const { code, body } = await socketHandler.leaveRoom(socketId, socketRooms, roomKey)
      const res = new Res(callback)
      res.status(code).send(body)

      const callbackLeaveRoom = makeCallback(Interface.Broadcast.Room.LEAVE, emitter.broadcast)
      const resLeaveRoom = new Res(callbackLeaveRoom)
      resLeaveRoom.status(code).send(body)
    })

    // *** Delete Room
    socket.on(Interface.Request.Room.DELETE, async (req, callback) => {
      const { id: socketId } = socket
      const { roomKey } = req.body
      const { code, body } = await socketHandler.deleteRoom(socketId, roomKey)
      const res = new Res(callback)
      res.status(code).send(body)

      const callbackRoomDelete = makeCallback(Interface.Broadcast.Room.DELETE, emitter.broadcast)
      const resRoomDelete = new Res(callbackRoomDelete)
      resRoomDelete.status(code).send(body)
    })

    // *** Get messages of room
    socket.on(Interface.Request.Room.MESSAGES, async (req, callback) => {
      const { roomKey } = req.body
      const { code, body } = await socketHandler.getMessages(roomKey)
      const res = new Res(callback)
      res.status(code).send(body)
    })

    // *** Write messages to room
    socket.on(Interface.Request.Room.WRITE, async (req, callback) => {
      const { id: socketId } = socket
      const { roomKey, text } = req.body
      const { code, body } = await socketHandler.writeMessage(socketId, roomKey, text)
      const res = new Res(callback)
      res.status(code).send(body)

      const callbackWrite = makeCallback(Interface.Broadcast.Room.WRITE, emitter.to(roomKey))
      const resWrite = new Res(callbackWrite)
      resWrite.status(code).send(body)
    })

    socket.on(Interface.DISCONNECT, disconnect.bind(null, socket))
    socket.on('error', (e) => console.log(e))
  }

  io.on(Interface.CONNECTION, connection)
  setTimeout(() => {
    socketHandler.init()
  }, 50)
}

export default activate
