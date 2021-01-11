import SocketIo from 'socket.io'
import socketIoRedis from 'socket.io-redis'
import socketIoEmitter from 'socket.io-emitter'

import logger from '../core/logger'
import Res from '../core/response'
import MegaphoneFactory from '../core/megaphone-factory'

import Interface from './interface'
import { ConfigRedis, ConfigSocketIo } from '../config'

const emitter = socketIoEmitter(ConfigRedis)
const megaphoneFactory = new MegaphoneFactory(emitter)
const megaphone = megaphoneFactory.create.bind(megaphoneFactory)

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

function SocketIoHandler (io, db) {
  this.io = io
  this.db = db
  this.sockets = {}
}
SocketIoHandler.prototype.getRoomKey = async function getRoomKey () {
  let roomKey = await getRandomHash()
  while (await this.db.existsRoom({ roomKey })) {
    roomKey = await getRandomHash()
  }
  return roomKey
}
SocketIoHandler.prototype.init = async function init () {
  logger.info('cleaning users')
  const allSockets = await this.io.of('/').adapter.sockets([])
  const connectingSocketIds = [...allSockets]
  const savedSocketIds = await this.db.getSocketIds()
  const trashUsers = await getTrashUsers(connectingSocketIds, savedSocketIds)

  if (trashUsers.length === 0) {
    await Promise.all(
      trashUsers.map(async (socketId) => {
        await this.db.deleteUser(socketId)
        if (this.sockets[socketId]) {
          delete this.sockets[socketId]
        }
      })
    )

    const userMap = {}
    await Promise.all(connectingSocketIds.map(async (socketId) => {
      const userName = await this.db.getUserName(socketId)
      if (userName === null) return
      userMap[socketId] = { userName }
    }))
  }

  logger.info('finished cleaning')
}

SocketIoHandler.prototype.getUsers = async function getUserMap (roomKey = null, startIndex = 0) {
  if (roomKey === null) {
    return {
      code: 304,
      body: {
        users: []
      }
    }
  }
  const COUNT = 10
  const socketIds = await this.io.of('/').adapter.sockets([roomKey])

  const users = await Promise.all([...socketIds].map(async (socketId) => {
    const userName = await this.db.getUserName(socketId)
    if (userName === null) return
    return {
      socketId,
      userName
    }
  }))

  return {
    body: {
      users: users.slice(startIndex, startIndex + COUNT)
    }
  }
}

SocketIoHandler.prototype.getRooms = async function getRooms (roomKey = null, startIndex = 0) {
  const COUNT = 10
  const roomMap = await this.db.getRoom(roomKey)

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
      rooms: rooms.slice(startIndex, startIndex + COUNT)
    }
  }
}

SocketIoHandler.prototype.getMessages = async function getMessages (roomKey = null, minIndex = -1, reconnect = false) {
  if (roomKey === null) {
    return {
      code: 500,
      body: {
        minIndex: -1,
        messages: []
      }
    }
  }
  const COUNT = 50
  const messages = await this.db.getMessages(roomKey)

  if (reconnect && minIndex > 0) {
    return {
      body: {
        messages: messages.slice(minIndex),
        minIndex
      }
    }
  }

  let tail = messages.length
  if (minIndex > -1) {
    tail = minIndex
  }
  if (minIndex > messages.length) {
    tail = messages.length
  }

  const head = tail < COUNT ? 0 : tail - COUNT
  return {
    body: {
      messages: messages.slice(head, tail),
      minIndex: head
    }
  }
}

SocketIoHandler.prototype.isValidUser = async function isValidUser (userName) {
  if (userName === '') {
    return {
      body: {
        isValid: false
      }
    }
  }
  const socketIds = await this.io.of('/').adapter.sockets([])
  for (const socketId of [...socketIds]) {
    const redisUserName = await this.db.getUserName(socketId)
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

SocketIoHandler.prototype.loginUser = async function loginUser (socketId, userName, roomKey = null) {
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
  await this.db.addUser(socketId, userName)

  const resBody = { ...body, userName, roomKey }
  const roomKeys = new Set()
  if (roomKey !== null && this.db.existsRoom(roomKey)) {
    await this.io.of('/').adapter.remoteJoin(socketId, roomKey)
    roomKeys.add(roomKey)
  }

  this.sockets[socketId] = roomKeys
  return {
    code,
    body: resBody
  }
}

SocketIoHandler.prototype.createRoom = async function createRoom (socketId, roomName, roomPassword, roomMaxJoin, roomDesc) {
  const userName = await this.db.getUserName(socketId)
  logger.debug(`${userName} create room`)
  const roomKey = await this.getRoomKey()
  await this.db.createRoom({
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

SocketIoHandler.prototype.joinRoom = async function joinRoom (socketId, roomKey) {
  if (roomKey === null || typeof roomKey === 'undefined') {
    return {
      code: 500,
      body: {
        room: {},
        message: {}
      }
    }
  }
  const userName = await this.db.getUserName(socketId)
  logger.debug(`${userName} join ${roomKey}`)
  const message = await this.db.joinRoom({ userName, roomKey })
  this.io.of('/').adapter.remoteJoin(socketId, roomKey)
  this.sockets[socketId].add(roomKey)

  const roomMap = await this.db.getRoom(roomKey)
  const room = Object.assign({ roomKey }, roomMap[roomKey])
  return {
    body: {
      room,
      message
    }
  }
}

SocketIoHandler.prototype.updateRoom = async function updateRoom (roomKey, roomName, roomPassword, roomMaxJoin, roomDesc) {
  if (roomKey === null || typeof roomKey === 'undefined') {
    return {
      code: 500,
      body: {
        room: {},
        message: {}
      }
    }
  }
  await this.db.updateRoom({
    roomKey,
    roomName,
    roomPassword,
    roomMaxJoin,
    roomDesc
  })
  const roomSockets = (await this.io.of('/').adapter.sockets([roomKey])) || new Set()

  return {
    body: {
      room: {
        roomKey,
        roomName,
        roomPassword,
        roomMaxJoin,
        roomDesc,
        joining: roomSockets.size
      }
    }
  }
}

SocketIoHandler.prototype.leaveRoom = async function leaveRoom (socketId, socketRooms, roomKey) {
  if (roomKey === null || typeof roomKey === 'undefined') {
    return {
      code: 500,
      body: {
        room: {},
        message: {}
      }
    }
  }
  const userName = await this.db.getUserName(socketId)
  logger.debug(`${userName} leave ${roomKey}`)
  const message = await this.db.leaveRoom({ userName, roomKey })
  this.sockets[socketId].delete(roomKey)
  if (socketRooms.has(roomKey)) {
    this.io.of('/').adapter.remoteLeave(socketId, roomKey)
  }
  const roomMap = await this.db.getRoom(roomKey)
  const room = Object.assign({ roomKey }, roomMap[roomKey])
  return {
    body: {
      socketId,
      room,
      message
    }
  }
}

SocketIoHandler.prototype.deleteRoom = async function deleteRoom (socketId, roomKey) {
  const userName = await this.db.getUserName(socketId)
  logger.debug(`${userName} delete ${roomKey}`)
  const roomMap = await this.db.getRoom(roomKey)
  const room = Object.assign({ roomKey }, roomMap[roomKey])
  const joiningSocketIds = await this.io.of('/').adapter.sockets([roomKey])
  await this.db.deleteRoom({ roomKey })

  const socketIds = [...joiningSocketIds]
  socketIds.forEach((socketId) => {
    this.io.of('/').adapter.remoteLeave(socketId, roomKey)
  })

  return {
    body: {
      socketIds,
      room
    }
  }
}

SocketIoHandler.prototype.writeMessage = async function writeMessage (socketId, roomKey, text) {
  const userName = await this.db.getUserName(socketId)
  const message = await this.db.writeMessage({
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

async function activate (server, db) {
  logger.info('activate socket.io')
  const io = SocketIo(server, ConfigSocketIo)
  io.adapter(socketIoRedis(ConfigRedis))

  const socketIoHandler = new SocketIoHandler(io, db)
  setTimeout(() => {
    // 왜인지 모르겠지만... 대략 딜레이가 없으면 socketIo redis adapter가 초기화되지 않는 것으로 추정
    // io.adapter를 await으로 하여도 문제가 있음...
    socketIoHandler.init()
  }, 100)

  async function disconnect (socket) {
    const socketId = socket.id
    const socketRooms = socket.rooms
    logger.info(`${socket.id} has disconnect`)
    if (typeof socketIoHandler.sockets[socketId] === 'undefined') return

    const roomKeys = socketIoHandler.sockets[socketId]
    await Promise.all(
      [...roomKeys].map(async (roomKey) => {
        const { code, body } = await socketIoHandler.leaveRoom(socketId, socketRooms, roomKey)

        megaphone(Interface.Broadcast.Room.LEAVE).status(code).send(body)
      })
    )
    await db.deleteUser(socketId)
    delete socketIoHandler.sockets[socketId]
  }

  async function connection (socket) {
    logger.info(`${socket.id} has connect`)
    // *** User Login
    socket.on(Interface.Request.User.LOGIN, async (req, callback) => {
      const { userName, roomKey = null } = req.body
      const { id: socketId } = socket

      const { code, body } = await socketIoHandler.loginUser(socketId, userName, roomKey)
      const res = new Res(callback)
      res.status(code).send(body)

      if (roomKey === null) return
      const { code: codeUserMap, body: bodyUserMap } = await socketIoHandler.getUsers(body.roomKey)
      megaphone(Interface.Broadcast.User.LIST).to(roomKey).status(codeUserMap).send(bodyUserMap)
    })

    // *** User List
    socket.on(Interface.Request.User.LIST, async (req, callback) => {
      const { roomKey, startIndex } = req.body
      const { code, body } = await socketIoHandler.getUsers(roomKey, startIndex)

      const res = new Res(callback)
      res.status(code).send(body)
    })

    // *** Check valid user
    socket.on(Interface.Request.User.IS_VALID, async (req, callback) => {
      const { userName } = req.body
      const { code, body } = await socketIoHandler.isValidUser(userName)
      const res = new Res(callback)
      res.status(code).send(body)
    })

    // *** Room List
    socket.on(Interface.Request.Room.LIST, async (req, callback) => {
      const { roomKey = null, startIndex = 0 } = req.body
      const { code, body } = await socketIoHandler.getRooms(roomKey, startIndex)
      const res = new Res(callback)
      res.status(code).send(body)
    })

    // *** Join Room
    socket.on(Interface.Request.Room.JOIN, async (req, callback) => {
      const { id: socketId } = socket
      const { roomKey } = req.body
      const { code, body } = await socketIoHandler.joinRoom(socketId, roomKey)
      const res = new Res(callback)
      res.status(code).send(body)

      megaphone(Interface.Broadcast.Room.JOIN).status(code).send(body)
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
      const { code, body } = await socketIoHandler.createRoom(socketId, roomName, roomPassword, roomMaxJoin, roomDesc)
      const res = new Res(callback)
      res.status(code).send(body)

      megaphone(Interface.Broadcast.Room.CREATE).status(code).send(body)
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

      const { code, body } = await socketIoHandler.updateRoom(roomKey, roomName, roomPassword, roomMaxJoin, roomDesc)
      const res = new Res(callback)
      res.status(code).send(body)

      megaphone(Interface.Broadcast.Room.UPDATE).status(code).send(body)
    })

    // *** Leave Room
    socket.on(Interface.Request.Room.LEAVE, async (req, callback) => {
      const { roomKey } = req.body
      const {
        id: socketId,
        rooms: socketRooms
      } = socket
      const { code, body } = await socketIoHandler.leaveRoom(socketId, socketRooms, roomKey)
      const res = new Res(callback)
      res.status(code).send(body)

      megaphone(Interface.Broadcast.Room.LEAVE).status(code).send(body)
    })

    // *** Delete Room
    socket.on(Interface.Request.Room.DELETE, async (req, callback) => {
      const { id: socketId } = socket
      const { roomKey } = req.body
      const { code, body } = await socketIoHandler.deleteRoom(socketId, roomKey)
      const res = new Res(callback)
      res.status(code).send(body)

      megaphone(Interface.Broadcast.Room.DELETE).status(code).send(body)
    })

    // *** Get messages of room
    socket.on(Interface.Request.Message.LIST, async (req, callback) => {
      const { roomKey, minIndex = -1 } = req.body
      const { code, body } = await socketIoHandler.getMessages(roomKey, minIndex)
      const res = new Res(callback)
      res.status(code).send(body)
    })

    // *** Write messages to room
    socket.on(Interface.Request.Message.WRITE, async (req, callback) => {
      const { id: socketId } = socket
      const { roomKey, text } = req.body
      const { code, body } = await socketIoHandler.writeMessage(socketId, roomKey, text)
      const res = new Res(callback)
      res.status(code).send(body)

      megaphone(Interface.Broadcast.Message.WRITE).to(roomKey).status(code).send(body)
    })

    socket.on(Interface.Request.Message.RECONNECT, async (req, callback) => {
      const { roomKey, minIndex = -1 } = req.body
      const { code, body } = await socketIoHandler.getMessages(roomKey, minIndex, true)
      const res = new Res(callback)
      res.status(code).send(body)
    })

    socket.on(Interface.DISCONNECT, disconnect.bind(null, socket))
    socket.on('error', (e) => logger.error(e))
  }

  io.on(Interface.CONNECTION, connection)
}

export default activate
