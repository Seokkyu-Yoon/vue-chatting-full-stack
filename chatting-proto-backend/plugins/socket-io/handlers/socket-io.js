import { logger } from '../../../core'

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

SocketIoHandler.prototype.getRoomKey = async function () {
  let roomKey = await getRandomHash()
  while (await this.db.existsRoom({ roomKey })) {
    roomKey = await getRandomHash()
  }
  return roomKey
}
SocketIoHandler.prototype.init = async function () {
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

SocketIoHandler.prototype.getUsers = async function (roomKey = null, startIndex = 0) {
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

SocketIoHandler.prototype.getRooms = async function (roomKey = null, startIndex = 0) {
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
  const { code, body } = await this.getRoomCount()
  return {
    code,
    body: {
      ...body,
      rooms: rooms.slice(startIndex, startIndex + COUNT)
    }
  }
}

SocketIoHandler.prototype.getMessages = async function (roomKey = null, minIndex = -1, reconnect = false) {
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

SocketIoHandler.prototype.isValidUser = async function (userName) {
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

SocketIoHandler.prototype.loginUser = async function (socketId, userName, roomKey = null) {
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

SocketIoHandler.prototype.getRoomCount = async function () {
  const roomMap = await this.db.getRoom(null)
  const roomCount = Object.keys(roomMap).length
  return {
    code: 200,
    body: {
      count: roomCount
    }
  }
}

SocketIoHandler.prototype.createRoom = async function (socketId, roomName, roomPassword, roomMaxJoin, roomDesc) {
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
  const { code: codeJoinRoom, body: bodyJoinRoom } = await this.joinRoom(socketId, roomKey)
  const { code: codeRoomCount, body: bodyRoomCount } = await this.getRoomCount()

  if (codeJoinRoom !== 200 && codeRoomCount !== 200) {
    return {
      code: 403,
      body: {}
    }
  }
  return {
    code: 200,
    body: {
      ...bodyJoinRoom,
      ...bodyRoomCount
    }
  }
}

SocketIoHandler.prototype.joinRoom = async function (socketId, roomKey) {
  if (roomKey === null || typeof roomKey === 'undefined') {
    return {
      code: 403,
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
    code: 200,
    body: {
      room,
      message
    }
  }
}

SocketIoHandler.prototype.updateRoom = async function (roomKey, roomName, roomPassword, roomMaxJoin, roomDesc) {
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

SocketIoHandler.prototype.leaveRoom = async function (socketId, socketRooms, roomKey) {
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

SocketIoHandler.prototype.deleteRoom = async function (socketId, roomKey) {
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

  const { code, body } = await this.getRoomCount()

  return {
    code,
    body: {
      ...body,
      socketIds,
      room
    }
  }
}

SocketIoHandler.prototype.writeMessage = async function (socketId, roomKey, text) {
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

export default SocketIoHandler
