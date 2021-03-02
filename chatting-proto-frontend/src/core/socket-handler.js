import store from '@/store'

function Handler (socket) {
  this.socket = socket
  this.isWaiting = {}
  this.running = {}
  this.initSocket()
}

Handler.prototype.onConnect = async function () {
  if (store.user === null) return
  const resSignIn = await this.signIn({ id: store.user.id, pw: store.user.pw })
  const { user } = resSignIn.body
  store.user = user

  if (store.room === null) {
    const resRooms = await this.getRooms({ startIndex: store.startIndexRoom })
    const { rooms = [] } = resRooms.body
    store.rooms = [...store.rooms, ...rooms]
    store.startIndexRoom = store.rooms.length

    const resRoomsJoined = await this.getRoomsJoined({ userId: store.user.id })
    const { rooms: roomsJoined = [] } = resRoomsJoined.body
    store.roomsJoined = roomsJoined
    store.startIndexRoomJoined = store.roomsJoined.length
  } else {
    const resJoin = await this.joinRoom({ id: store.room.id, pw: store.room.pw, userId: store.user.id })
    const { room } = resJoin.body
    store.room = room

    const resOnlineMembersInRoom = await this.getOnlineMembersInRoom({ roomId: store.room.id })
    const { users = [] } = resOnlineMembersInRoom.body
    store.users = users

    const resMessagesInRoomReconnect = await this.getMessagesInRoomReconnect({ userId: store.user.id, roomId: store.room.id, startIndex: store.messages.length + store.minIndexMessage })
    const { messages = [] } = resMessagesInRoomReconnect.body
    store.messages = [
      ...store.messages,
      ...messages
    ]
  }
}

Handler.prototype.onRoomCreate = async function () {
  if (store.room !== null) return
  if (store.searchRoomText !== '') return
  const res = await this.getRooms({ startIndex: 0, limit: Math.ceil(store.startIndexRoom / 30) * 30 })
  const { rooms } = res.body
  store.rooms = rooms
  store.startIndexRoom = rooms.length
}

Handler.prototype.onRoomUpdate = async function (res) {
  const { room } = res.body

  if (store.room !== null && store.room.id === room.id) {
    Object.assign(store.room, room)
    return
  }

  const roomIndex = store.rooms.findIndex(({ id }) => id === room.id)
  const roomIndexJoined = store.roomsJoined.findIndex(({ id }) => id === room.id)
  const roomIndexSearched = store.roomsSearched.findIndex(({ id }) => id === room.id)
  if (roomIndex > -1) store.rooms.splice(roomIndex, 1, room)
  if (roomIndexJoined > -1) store.roomsJoined.splice(roomIndexJoined, 1, room)
  if (roomIndexSearched > -1) store.roomsSearched.splice(roomIndexSearched, 1, room)
}

Handler.prototype.onRoomDelete = async function (res) {
  const { id: roomId } = res.body

  if (store.room !== null && store.room.id === roomId) {
    store.room = null
  }

  const roomIndex = store.rooms.findIndex(({ id }) => id === roomId)
  const roomIndexJoined = store.roomsJoined.findIndex(({ id }) => id === roomId)
  const roomIndexSearched = store.roomsSearched.findIndex(({ id }) => id === roomId)
  if (roomIndex > -1) store.rooms.splice(roomIndex, 1)
  if (roomIndexJoined > -1) store.roomsJoined.splice(roomIndexJoined, 1)
  if (roomIndexSearched > -1) store.roomsSearched.splice(roomIndexSearched, 1)
}

Handler.prototype.onRoomJoin = async function (res) {
  const { room } = res.body

  if (store.room !== null && store.room.id === room.id) {
    store.room.joining += 1
    const res = await this.getOnlineMembersInRoom({ roomId: room.id })
    const { users = [] } = res.body
    store.users = users
  }
  const roomIndex = store.rooms.findIndex(({ id }) => id === room.id)
  const roomIndexJoined = store.roomsJoined.findIndex(({ id }) => id === room.id)
  const roomIndexSearched = store.roomsSearched.findIndex(({ id }) => id === room.id)

  if (roomIndex > -1) {
    const target = Object.assign({}, store.rooms[roomIndex])
    target.joining += 1
    store.rooms.splice(roomIndex, 1, target)
  }
  if (roomIndexJoined > -1) {
    const target = Object.assign({}, store.roomsJoined[roomIndexJoined])
    target.joining += 1
    store.roomsJoined.splice(roomIndexJoined, 1, target)
  }
  if (roomIndexSearched > -1) {
    const target = Object.assign({}, store.roomsSearched[roomIndexSearched])
    target.joining += 1
    store.roomsSearched.splice(roomIndexSearched, 1, target)
  }
}

Handler.prototype.onRoomLeave = async function (res) {
  const { roomId } = res.body

  if (store.room !== null && store.room.id === roomId) {
    store.room.joining -= 1

    const res = await this.getOnlineMembersInRoom({ roomId })
    const { users = [] } = res.body
    store.users = users

    store.recipients = store.recipients.reduce((bucket, user) => {
      if (users.some(({ id }) => id === user.id)) bucket.push(user)
      return bucket
    }, [])
    return
  }

  const roomIndex = store.rooms.findIndex(({ id }) => id === roomId)
  const roomIndexJoined = store.roomsJoined.findIndex(({ id }) => id === roomId)
  const roomIndexSearched = store.roomsSearched.findIndex(({ id }) => id === roomId)

  if (roomIndex > -1) {
    const target = Object.assign({}, store.rooms[roomIndex])
    target.joining -= 1
    store.rooms.splice(roomIndex, 1, target)
  }
  if (roomIndexJoined > -1) {
    const target = Object.assign({}, store.roomsJoined[roomIndexJoined])
    target.joining -= 1
    store.roomsJoined.splice(roomIndexJoined, 1, target)
  }
  if (roomIndexSearched > -1) {
    const target = Object.assign({}, store.roomsSearched[roomIndexSearched])
    target.joining -= 1
    store.roomsSearched.splice(roomIndexSearched, 1, target)
  }
}

Handler.prototype.onMessage = async function (res) {
  const { message } = res.body
  if (store.messages[0].type === 'dummy') {
    store.messages = []
  }
  store.messages.push(message)
}

// return pre request action
Handler.prototype.emitPre = function (event = '', body = {}, defaultRes = {}) {
  this.running[event] = new Promise((resolve, reject) => {
    if (typeof this.running[event] !== 'undefined') return resolve(defaultRes)
    this.socket.emit(event, { body }, (res) => {
      res.status === 200 ? resolve(res) : reject(res)
      this.running[event] = undefined
    })
  })
  return this.running[event]
}
// return post request action
Handler.prototype.emitPost = function (event = '', body = {}) {
  const promise = new Promise((resolve, reject) => {
    this.socket.emit(event, { body }, async (res) => {
      if (this.running[event] !== promise) return this.running[event]
      this.running[event] = undefined
      res.status === 200 ? resolve(res) : reject(res)
    })
  })
  this.running[event] = promise
  return this.running[event]
}

Handler.prototype.initSocket = function () {
  this.socket.on('connect', this.onConnect.bind(this))
  this.socket.on('broadcast:room:create', this.onRoomCreate.bind(this))
  this.socket.on('broadcast:room:update', this.onRoomUpdate.bind(this))
  this.socket.on('broadcast:room:delete', this.onRoomDelete.bind(this))
  this.socket.on('broadcast:room:join', this.onRoomJoin.bind(this))
  this.socket.on('broadcast:room:leave', this.onRoomLeave.bind(this))
  this.socket.on('broadcast:message:write', this.onMessage.bind(this))
}

Handler.prototype.signIn = function ({ id = '', pw = '' }) {
  if (store.user !== null) return { body: { user: store.user } }
  return this.emitPost('req:user:signin', { id, pw })
}
Handler.prototype.signUp = function ({ id = '', pw = '', name = '', email = '', phone = '' }) {
  return this.emitPost('req:user:signup', { id, pw, name, email, phone })
}

Handler.prototype.getRooms = function ({ startIndex = 0, limit = 0 }) {
  return this.emitPost('req:room:list', { startIndex, limit })
}
Handler.prototype.getRoomsJoined = async function ({ userId = '' }) {
  return await this.emitPost('req:room:joined', { userId })
}
Handler.prototype.getRoomsSearched = async function ({ title = '' }) {
  return await this.emitPost('req:room:search', { title })
}
Handler.prototype.createRoom = async function ({ title = '', pw = '', createBy = '', maxJoin = 0, description = '' }) {
  return await this.emitPost('req:room:create', { title, pw, createBy, maxJoin, description })
}
Handler.prototype.updateRoom = async function ({ id = -1, title = '', pw = '', maxJoin = 0, description = '' }) {
  return await this.emitPost('req:room:update', { id, title, pw, maxJoin, description })
}
Handler.prototype.deleteRoom = async function ({ id = -1 }) {
  return await this.emitPost('req:room:delete', { id })
}
Handler.prototype.joinRoom = async function ({ id = -1, pw = '', userId = '' }) {
  return await this.emitPost('req:room:join', { id, pw, userId })
}
Handler.prototype.leaveRoom = async function ({ id = -1, userId = '' }) {
  return await this.emitPost('req:room:leave', { id, userId })
}

Handler.prototype.getMessagesInRoom = async function ({ userId = '', roomId = -1, minIndex = -1 }) {
  return await this.emitPost('req:message:list', { userId, roomId, minIndex })
}
Handler.prototype.getMessagesInRoomReconnect = async function ({ userId = '', roomId = -1, startIndex = 0 }) {
  return await this.emitPost('req:message:reconnect', { userId, roomId, startIndex })
}
Handler.prototype.getOnlineMembersInRoom = async function ({ roomId = -1 }) {
  return await this.emitPost('req:member:online:room', { roomId })
}
Handler.prototype.writeMessage = async function ({ type = '', writter = '', content = '', roomId = -1, recipients = [] }) {
  return await this.emitPost('req:message:write', { type, writter, content, roomId, recipients })
}

export default Handler
