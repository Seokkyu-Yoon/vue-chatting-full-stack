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
      const reqLogin = new Req('req:user:login', { userName: store.userName, roomKey: store.room.roomKey })
      const resLogin = await $request(reqLogin)
      const {
        isValid,
        userName,
        roomKey
      } = resLogin.body

      store.userName = userName
      store.room.roomKey = roomKey

      if (!isValid) {
        return
      }
      if (roomKey === null) {
        const reqRooms = new Req('req:room:list', { roomKey, startIndex: store.startIndexRoom })
        const resRooms = await $request(reqRooms)
        const { rooms = [] } = resRooms.body
        store.rooms = rooms
        return
      }
      const reqUser = new Req('req:user:list', { roomKey: store.room.roomKey, startIndex: store.startIndexUser })
      const reqMessages = new Req('req:message:reconnect', { roomKey, minIndex: store.minIndexMessage })
      const [
        resUser,
        resMessages
      ] = await Promise.all([$request(reqUser), $request(reqMessages)])
      const { users = [] } = resUser.body
      const { messages, minIndex } = resMessages.body
      store.users = users
      store.messages = messages
      store.minIndexMessage = minIndex
    })

    socket.on('broadcast:room:create', () => {
      if (typeof store.room.roomKey !== 'undefined') return
      const req = new Req('req:room:list', { roomKey: null, startIndex: store.startIndexRoom })
      $request(req).then((res) => {
        const { rooms } = res.body
        store.rooms = rooms
      })
    })

    socket.on('broadcast:room:update', (res) => {
      const { room } = res.body

      if (store.room.roomKey === room.roomKey) {
        Object.assign(store.room, room)
        return
      }

      const roomIndex = store.rooms.findIndex(({ roomKey }) => roomKey === room.roomKey)
      if (roomIndex === -1) return
      store.rooms = [
        ...store.rooms.slice(0, roomIndex),
        room,
        ...store.rooms.slice(roomIndex + 1)
      ]
    })

    socket.on('broadcast:room:join', (res) => {
      const { room, message } = res.body

      if (store.room.roomKey === room.roomKey) {
        store.room.joining += 1
        store.messages.push(message)
        const req = new Req('req:user:list', { roomKey: room.roomKey, startIndex: store.startIndexUser })
        $request(req).then((res) => {
          const { users = [] } = res.body
          store.users = users
        })
      }

      const roomIndex = store.rooms.findIndex(({ roomKey }) => roomKey === room.roomKey)
      if (roomIndex === -1) return
      const updatedRoom = Object.assign({}, store.rooms[roomIndex])
      updatedRoom.joining += 1
      store.rooms = [
        ...store.rooms.slice(0, roomIndex),
        updatedRoom,
        ...store.rooms.slice(roomIndex + 1)
      ]
    })

    socket.on('broadcast:room:leave', (res) => {
      const { room, message } = res.body

      if (store.room.roomKey === room.roomKey) {
        store.room.joining -= 1
        store.messages.push(message)
        const req = new Req('req:user:list', { roomKey: room.roomKey, startIndex: store.startIndexUser })
        $request(req).then((res) => {
          const { users = [] } = res.body
          store.users = users
        })
      }

      const roomIndex = store.rooms.findIndex(({ roomKey }) => roomKey === room.roomKey)
      if (roomIndex === -1) return
      const updatedRoom = Object.assign({}, store.rooms[roomIndex])
      updatedRoom.joining -= 1
      store.rooms = [
        ...store.rooms.slice(0, roomIndex),
        updatedRoom,
        ...store.rooms.slice(roomIndex + 1)
      ]
    })

    socket.on('broadcast:room:delete', (res) => {
      const { room } = res.body

      if (store.room.roomKey === room.roomKey) {
        store.room = {}
        return
      }

      const reqRooms = new Req('req:room:list', { roomKey: null, startIndex: store.startIndexRoom })
      $request(reqRooms).then((resRooms) => {
        const { rooms } = resRooms.body
        store.rooms = rooms
      })
    })

    socket.on('broadcast:message:write', (res) => {
      const { message } = res.body
      store.messages.push(message)
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
