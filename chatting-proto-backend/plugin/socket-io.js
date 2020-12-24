import logger from 'debug'

import SocketIo from 'socket.io'
import socketIoRedis from 'socket.io-redis'
import socketIoEmitter from 'socket.io-emitter'

import Response from '../core/response'

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
  const connectingSocketIds = [...await this.io.of('/').adapter.sockets([])]
  const savedSocketIds = await this.redis.getSocketIds()
  const trashUsers = await getTrashUsers(connectingSocketIds, savedSocketIds)

  if (trashUsers.length === 0) return
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
  emitter.broadcast.emit(Interface.Broadcast.User.LIST, userMap)
  debug('finished cleaning')
}

SocketHandler.prototype.getUserMap = async function getUserMap (roomKey) {
  if (roomKey === null) {
    return {
      code: 304,
      body: {
        userMap: {}
      }
    }
  }
  const socketIds = await this.io.of('/').adapter.sockets([roomKey])

  const userMap = {}
  await Promise.all([...socketIds].map(async (socketId) => {
    const userName = await this.redis.getUserName(socketId)
    if (userName === null) return
    userMap[socketId] = { userName }
  }))

  Object.keys(userMap).sort().reduce((bucket, socketId) => {
    const temp = {}
    temp[socketId] = userMap[socketId]
    return {
      ...bucket,
      ...temp
    }
  }, {})

  return {
    body: {
      userMap
    }
  }
}

SocketHandler.prototype.getRoomMap = async function getRoomMap () {
  const rooms = await this.redis.getRoom()
  const roomMap = {}
  await Promise.all(Object.keys(rooms).map(async (roomKey) => {
    const roomSockets = (await this.io.of('/').adapter.sockets([roomKey])) || new Set()
    roomMap[roomKey] = {
      ...rooms[roomKey],
      sockets: [...roomSockets]
    }
  }))
  return {
    body: {
      roomMap
    }
  }
}

SocketHandler.prototype.getMessages = async function getMessages (roomKey) {
  const messages = await this.redis.getMessages(roomKey)
  return {
    body: {
      messages
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

  const resBody = { ...body, userName, roomKey: null }
  const roomKeys = new Set()
  if (roomKey !== null && this.redis.existsRoom(roomKey)) {
    await this.io.of('/').adapter.remoteJoin(socketId, roomKey)
    roomKeys.add(roomKey)
    resBody.roomKey = roomKey
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
  await this.redis.createRoom(
    {
      userName,
      roomKey,
      roomName,
      roomPassword,
      roomMaxJoin,
      roomDesc
    }
  )
  const { body } = await this.joinRoom(socketId, roomKey)
  return {
    body: {
      join: body.join,
      roomKey
    }
  }
}

SocketHandler.prototype.joinRoom = async function joinRoom (socketId, roomKey) {
  const userName = await this.redis.getUserName(socketId)
  debug(`${userName} join ${roomKey}`)
  await this.redis.joinRoom({ userName, roomKey })
  this.io.of('/').adapter.remoteJoin(socketId, roomKey)
  this.sockets[socketId].add(roomKey)
  return {
    body: {
      joined: true
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
      joined: false
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
  await this.redis.writeMessage({
    type: 'message',
    userName,
    roomKey,
    text
  })
  return {
    body: {
      wrote: true
    }
  }
}

function activate (server, redis) {
  const sockets = {}

  debug('activate socket.io')
  const io = SocketIo(server, Config.SocketIo)
  io.adapter(socketIoRedis(Config.Redis))

  const socketHandler = new SocketHandler(io, redis)
  socketHandler.init()

  async function disconnect (socket) {
    const socketId = socket.id
    const socketRooms = socket.rooms
    debug(`${socket.id} has disconnect`)
    if (typeof sockets[socketId] === 'undefined') return

    const roomKeys = sockets[socketId]
    await Promise.all(
      [...roomKeys].map(async (roomKey) => {
        await socketHandler.leaveRoom(socketId, socketRooms, roomKey)
        const { code, body } = await socketHandler.getUserMap(roomKey)
        const callback = makeCallback(Interface.Broadcast.User.LIST, emitter.to(roomKey))
        const res = new Response(callback)
        res.status(code).send(body)
      })
    )
    await redis.deleteUser(socketId)
    delete sockets[socketId]
  }

  async function connection (socket) {
    debug(`${socket.id} has connect`)

    // * Broadcast Events
    // *** User List
    socket.on(Interface.Broadcast.User.LIST, async (req) => {
      const { roomKey } = req.body
      const { code, body } = await socketHandler.getUserMap(roomKey)

      const callback = makeCallback(Interface.Broadcast.User.LIST, emitter.to(roomKey))
      const res = new Response(callback)
      res.status(code).send(body)
    })

    // *** Room List
    socket.on(Interface.Broadcast.Room.LIST, async (req) => {
      const { code, body } = await socketHandler.getRoomMap()

      const callback = makeCallback(Interface.Broadcast.Room.LIST, emitter.broadcast)
      const res = new Response(callback)
      res.status(code).send(body)
    })

    // *** Messages in room
    socket.on(Interface.Broadcast.Room.MESSAGES, async (req) => {
      const { roomKey } = req.body
      const { code, body } = await socketHandler.getMessages(roomKey)

      const callback = makeCallback(Interface.Broadcast.Room.MESSAGES, emitter.in(roomKey))
      const res = new Response(callback)
      res.status(code).send(body)
    })

    // * request
    // *** User List
    socket.on(Interface.Request.User.LIST, async (req, callback) => {
      const { roomKey } = req.body
      const { code, body } = await socketHandler.getUserMap(roomKey)

      const res = new Response(callback)
      res.status(code).send(body)
    })

    // *** User Login
    socket.on(Interface.Request.User.LOGIN, async (req, callback) => {
      const { userName, roomKey = null } = req.body
      const { id: socketId } = socket

      const { code, body } = await socketHandler.loginUser(socketId, userName, roomKey)
      const res = new Response(callback)
      res.status(code).send(body)

      if (body.roomKey === null) return
      const { code: codeUserMap, body: bodyUserMap } = await socketHandler.getUserMap(body.roomKey)
      const callbackUserMap = makeCallback(Interface.Broadcast.User.LIST, emitter.to(roomKey))
      const resUserMap = new Response(callbackUserMap)
      resUserMap.status(codeUserMap).send(bodyUserMap)
    })

    // *** Check valid user
    socket.on(Interface.Request.User.IS_VALID, async (req, callback) => {
      const { userName } = req.body
      const { code, body } = await socketHandler.isValidUser(userName)
      const res = new Response(callback)
      res.status(code).send(body)
    })

    // *** Room List
    socket.on(Interface.Request.Room.LIST, async (req, callback) => {
      const { code, body } = await socketHandler.getRoomMap()
      const res = new Response(callback)
      res.status(code).send(body)
    })

    // *** Join Room
    socket.on(Interface.Request.Room.JOIN, async (req, callback) => {
      const { id: socketId } = socket
      const { roomKey } = req.body
      const { code, body } = await socketHandler.joinRoom(socketId, roomKey)
      const res = new Response(callback)
      res.status(code).send(body)

      const [
        { code: codeUserMap, body: bodyUserMap },
        { code: codeMessages, body: bodyMessages },
        { code: codeRoomMap, body: bodyRoomMap }
      ] = await Promise.all([
        socketHandler.getUserMap(roomKey),
        socketHandler.getMessages(roomKey),
        socketHandler.getRoomMap()
      ])

      const callbackUserMap = makeCallback(Interface.Broadcast.User.LIST, emitter.to(roomKey))
      const resUserMap = new Response(callbackUserMap)
      resUserMap.status(codeUserMap).send(bodyUserMap)

      const callbackMessages = makeCallback(Interface.Broadcast.Room.MESSAGES, emitter.to(roomKey))
      const resMessages = new Response(callbackMessages)
      resMessages.status(codeMessages).send(bodyMessages)

      const callbackRoomMap = makeCallback(Interface.Broadcast.Room.LIST, emitter.broadcast)
      const resRoomMap = new Response(callbackRoomMap)
      resRoomMap.status(codeRoomMap).send(bodyRoomMap)
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
      const res = new Response(callback)
      res.status(code).send(body)

      const { code: codeRoomMap, body: bodyRoomMap } = await socketHandler.getRoomMap()
      const callbackRoomMap = makeCallback(Interface.Broadcast.Room.LIST, emitter.broadcast)
      const resRoomMap = new Response(callbackRoomMap)
      resRoomMap.status(codeRoomMap).send(bodyRoomMap)
    })

    // *** Leave Room
    socket.on(Interface.Request.Room.LEAVE, async (req, callback) => {
      const { roomKey } = req.body
      const {
        id: socketId,
        rooms: socketRooms
      } = socket
      const { code, body } = await socketHandler.leaveRoom(socketId, socketRooms, roomKey)
      const res = new Response(callback)
      res.status(code).send(body)

      const [
        { code: codeUserMap, body: bodyUserMap },
        { code: codeMessages, body: bodyMessages },
        { code: codeRoomMap, body: bodyRoomMap }
      ] = await Promise.all([
        socketHandler.getUserMap(roomKey),
        socketHandler.getMessages(roomKey),
        socketHandler.getRoomMap()
      ])

      const callbackUserMap = makeCallback(Interface.Broadcast.User.LIST, emitter.to(roomKey))
      const resUserMap = new Response(callbackUserMap)
      resUserMap.status(codeUserMap).send(bodyUserMap)

      const callbackMessages = makeCallback(Interface.Broadcast.Room.MESSAGES, emitter.to(roomKey))
      const resMessages = new Response(callbackMessages)
      resMessages.status(codeMessages).send(bodyMessages)

      const callbackRoomMap = makeCallback(Interface.Broadcast.Room.LIST, emitter.broadcast)
      const resRoomMap = new Response(callbackRoomMap)
      resRoomMap.status(codeRoomMap).send(bodyRoomMap)
    })

    // *** Delete Room
    socket.on(Interface.Request.Room.DELETE, async (req) => {
      const { id: socketId } = socket
      const { roomKey } = req.body
      const { code, body } = await socketHandler.deleteRoom(socketId, roomKey)

      const { code: codeRoomMap, body: bodyRoomMap } = await socketHandler.getRoomMap()
      const callbackRoomMap = makeCallback(Interface.Broadcast.Room.LIST, emitter.broadcast)
      const resRoomMap = new Response(callbackRoomMap)
      resRoomMap.status(codeRoomMap).send(bodyRoomMap)

      body.socketIds.forEach((socketId) => {
        const callback = makeCallback(Interface.Broadcast.Room.DELETE, emitter.to(socketId))
        const resRoomDelete = new Response(callback)
        resRoomDelete.status(code).send({ roomKey: body.roomKey })
      })
    })

    // *** Get messages of room
    socket.on(Interface.Request.Room.MESSAGES, async (req, callback) => {
      const { roomKey } = req.body
      const { code, body } = await socketHandler.getMessages(roomKey)
      const res = new Response(callback)
      res.status(code).send(body)
    })

    // *** Write messages to room
    socket.on(Interface.Request.Room.WRITE, async (req, callback) => {
      const { id: socketId } = socket
      const { roomKey, text } = req.body
      const { code, body } = await socketHandler.writeMessage(socketId, roomKey, text)
      const res = new Response(callback)
      res.status(code).send(body)

      const { code: codeMessages, body: bodyMessages } = await socketHandler.getMessages(roomKey)
      const callbackMessages = makeCallback(Interface.Broadcast.Room.MESSAGES, emitter.broadcast)
      const resMessages = new Response(callbackMessages)
      resMessages.status(codeMessages).send(bodyMessages)
    })

    socket.on(Interface.DISCONNECT, disconnect.bind(null, socket))
    socket.on('error', (e) => console.log(e))
  }

  io.on(Interface.CONNECTION, connection)
}

export default activate
