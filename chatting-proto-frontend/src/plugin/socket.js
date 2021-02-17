import io from 'socket.io-client'
import store from '@/store'
import Req from '@/core/request'

function getSocket ({
  NODE_ENV,
  VUE_APP_SERVER_PROTOCOL = 'http:',
  VUE_APP_SERVER_IP = 'localhost',
  VUE_APP_SERVER_PORT = '3000'
}) {
  const opts = {
    transports: ['websocket']
  }
  if (NODE_ENV === 'development') {
    const devServer = `${VUE_APP_SERVER_PROTOCOL}//${VUE_APP_SERVER_IP}:${VUE_APP_SERVER_PORT}`
    return io(devServer, opts)
  }
  return io(opts)
}

const socket = getSocket(process.env)
const SocketPlugin = {
  install (vue) {
    function $request (req) {
      return new Promise((resolve, reject) => {
        socket.emit(req.type, req, (res) => {
          if (res.status !== 200) {
            reject(res)
            return
          }
          resolve(res)
        })
      })
    }

    socket.on('connect', async () => {
      if (store.userName === '') return
      const reqLogin = new Req('req:user:login', { userName: store.userName, userId: store.userId, roomId: store.room.id, pw: store.room.pw })
      const resLogin = await $request(reqLogin)
      const {
        isValid,
        userName,
        userId,
        room
      } = resLogin.body

      store.userId = userId
      store.userName = userName
      store.room = room

      if (!isValid) {
        return
      }
      if (typeof room.id !== 'undefined') {
        // const reqUser = new Req('req:user:list', { roomId: store.room.id, startIndex: store.startIndexUser })
        const reqUser = new Req('req:user:list', { roomId: room.id })
        const reqMessages = new Req('req:message:reconnect', { roomId: room.id, startIndex: store.minIndexMessage + store.messages.length })
        const [
          resUser,
          resMessages
        ] = await Promise.all([$request(reqUser), $request(reqMessages)])
        const { users = [] } = resUser.body
        const { messages } = resMessages.body
        store.users = users
        store.messages = [
          ...store.messages,
          ...messages
        ]
      }
    })

    socket.on('broadcast:room:create', () => {
      if (store.room.id) return
      const req = new Req('req:room:list', { userId: store.userId, startIndex: 0, limit: Math.ceil(store.startIndexRoom / 30) * 30 })
      $request(req).then((res) => {
        const { rooms } = res.body
        store.rooms = rooms
        store.startIndexRoom = rooms.length
      })
    })

    socket.on('broadcast:room:update', (res) => {
      const { room } = res.body

      if (store.room.id === room.id) {
        Object.assign(store.room, room)
        return
      }

      const roomIndex = store.rooms.findIndex(({ id }) => id === room.id)
      if (roomIndex === -1) return
      store.rooms.splice(roomIndex, 1, room)
    })

    socket.on('broadcast:room:delete', (res) => {
      const { id } = res.body

      if (store.room.id === id) {
        store.room = {}
      }

      const roomIndex = store.rooms.findIndex(({ id: roomId }) => roomId === id)
      if (roomIndex === -1) return
      const reqRooms = new Req('req:room:list', { userId: store.userId, startIndex: store.startIndexRoom, limit: 1 })
      $request(reqRooms).then((resRooms) => {
        const { rooms } = resRooms.body
        store.rooms = [
          ...store.rooms.slice(0, roomIndex),
          ...store.rooms.slice(roomIndex + 1),
          ...rooms
        ]
        store.startIndexRoom = store.rooms.length
      })
    })

    socket.on('broadcast:room:join', (res) => {
      const { room } = res.body

      if (store.room.id === room.id) {
        store.room.joining += 1
        // const req = new Req('req:user:list', { roomId: room.id, startIndex: store.startIndexUser })
        const req = new Req('req:user:list', { roomId: room.id })
        $request(req).then((res) => {
          const { users = [] } = res.body
          store.users = users
        })
      }

      const roomIndex = store.rooms.findIndex(({ id }) => id === room.id)
      if (roomIndex === -1) return
      const roomTarget = store.rooms[roomIndex]
      roomTarget.joining += 1
      store.rooms.splice(roomIndex, 1, roomTarget)
    })

    socket.on('broadcast:room:leave', (res) => {
      const { id } = res.body

      if (store.room.id === id) {
        store.room.joining -= 1
        // const req = new Req('req:user:list', { roomId: id, startIndex: store.startIndexUser })
        const req = new Req('req:user:list', { roomId: id })
        $request(req).then((res) => {
          const { users = [] } = res.body
          store.users = users
          store.recipients = store.recipients.reduce((bucket, user) => {
            if (users.some(({ name }) => name === user.name)) bucket.push(user)
            return bucket
          }, [])
        })
      }

      const roomIndex = store.rooms.findIndex(({ id: savedId }) => savedId === id)
      if (roomIndex === -1) return
      const roomTarget = Object.assign({}, store.rooms[roomIndex])
      roomTarget.joining -= 1
      store.rooms.splice(roomIndex, 1, roomTarget)
    })

    socket.on('broadcast:message:write', (res) => {
      const { message } = res.body
      store.messages.push(message)
      if (store.messages[0].type === 'dummy') {
        store.messages = store.messages.slice(1)
      }
    })
    vue.mixin({})

    Object.assign(
      vue.prototype,
      {
        $request
      }
    )
  }
}

export default SocketPlugin
