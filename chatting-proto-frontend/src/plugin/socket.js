import io from 'socket.io-client'
import store from '@/store'
import Req from '@/core/request'

const socket = io(store.serverIp, {
  transports: ['websocket']
})

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
        const reqRooms = new Req('req:room:list', {})
        const resRooms = await $request(reqRooms)
        const { rooms = [] } = resRooms.body
        store.rooms = rooms
        return
      }
      const reqUser = new Req('req:user:list', { roomKey: store.room.roomKey })
      const reqMessages = new Req('req:room:messages', { roomKey })
      const [
        resUser,
        resMessages
      ] = await Promise.all([$request(reqUser), $request(reqMessages)])
      const { users = [] } = resUser.body
      const { messages } = resMessages.body
      store.users = users
      store.messages = messages
    })

    socket.on('broadcast:room:join', (res) => {
      const { room } = res.body

      if (store.room.roomKey === room.roomKey) {
        const reqUsers = new Req('req:user:list', { roomKey: room.roomKey, startIndex: store.startIndexUser })
        const reqMessages = new Req('req:room:messages', { roomKey: room.roomKey, startIndex: store.startIndexMessage })
        Promise.all([
          $request(reqUsers),
          $request(reqMessages)
        ]).then(([resUser, resMessages]) => {
          const { users = [] } = resUser.body
          const { messages = [] } = resMessages.body
          store.users = users
          store.messages = messages
        })
      }

      if (typeof store.room.roomKey === 'undefined') {
        const roomIndex = store.rooms.findIndex(({ roomKey }) => roomKey === room.roomKey)
        if (roomIndex === -1) return
        const updatedRoom = Object.assign({}, store.rooms[roomIndex])
        updatedRoom.joining += 1
        store.rooms = [
          ...store.rooms.slice(0, roomIndex),
          updatedRoom,
          ...store.rooms.slice(roomIndex + 1)
        ]
      }
    })

    socket.on('broadcast:room:leave', (res) => {
      const { roomKey } = res.body

      if (store.room.roomKey === roomKey) {
        const reqUsers = new Req('req:user:list', { roomKey, startIndex: store.startIndexUser })
        const reqMessages = new Req('req:room:messages', { roomKey, startIndex: store.startIndexMessage })
        Promise.all([
          $request(reqUsers),
          $request(reqMessages)
        ]).then(([resUser, resMessages]) => {
          const { users = [] } = resUser.body
          const { messages = [] } = resMessages.body
          store.users = users
          store.messages = messages
        })
      }

      if (typeof store.room.roomKey === 'undefined') {
        const req = new Req('req:room:list', { roomKey: null, startIndex: store.startIndexRoom })
        $request(req).then((res) => {
          const { rooms = [] } = res.body
          store.rooms = rooms
        })
      }
    })

    socket.on('broadcast:room:write', (res) => {
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
