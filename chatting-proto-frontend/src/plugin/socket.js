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
    function $order (req) {
      socket.emit(req.type, req)
    }
    socket.on('connect', async () => {
      if (store.userName === '') return
      const reqLogin = new Req('req:user:login', { userName: store.userName, roomKey: store.joiningRoomKey })
      const resLogin = await $request(reqLogin)
      const {
        isValid,
        userName,
        roomKey
      } = resLogin.body

      store.userName = userName
      store.joiningRoomKey = roomKey

      if (!isValid) {
        return
      }
      if (roomKey !== null) {
        const reqUser = new Req('req:user:list', { roomKey: store.joiningRoomKey })
        const reqMessages = new Req('req:room:messages', { roomKey })
        const [
          resUser,
          resMessages
        ] = await Promise.all([$request(reqUser), $request(reqMessages)])
        const { userMap } = resUser.body
        const { messages } = resMessages.body
        store.userMap = userMap
        store.messages = messages
        return
      }
      const reqRoomMap = new Req('req:room:list', {})
      const resRoomMap = await $request(reqRoomMap)
      const { roomMap } = resRoomMap.body
      store.roomMap = roomMap
    })

    socket.on('broadcast:user:list', (res) => {
      const { userMap = {} } = res.body
      store.userMap = userMap
    })

    socket.on('broadcast:room:list', (res) => {
      const { roomMap = {} } = res.body
      store.roomMap = roomMap
    })
    socket.on('broadcast:room:delete', (res) => {
      const { roomKey = null } = res.body
      if (store.joiningRoomKey === roomKey) {
        store.joiningRoomKey = null
      }
    })
    socket.on('broadcast:room:messages', (res) => {
      const { messages = [] } = res.body
      store.messages = messages
    })

    socket.on('broadcast:room:join', (res) => {
      const { roomKey, user } = res.body

      if (roomKey === store.joiningRoomKey) {
        Object.assign(store.userMap, user)
        const req = new Req('req:room:messages', { roomKey })
        $request(req).then((res) => {
          const { messages = [] } = res.body
          store.messages = messages
        })
      }

      const reqRoomMap = new Req('req:room:list', { roomKey })
      $request(reqRoomMap).then((res) => {
        const { roomMap = {} } = res.body
        Object.assign(store.roomMap, roomMap)
      })
    })

    socket.on('broadcast:room:leave', (res) => {
      const { roomKey, socketId } = res.body

      if (roomKey !== store.joiningRoomKey) {
        const req = new Req('req:room:list', { roomKey })
        $request(req).then((res) => {
          const { roomMap = {} } = res.body
          Object.assign(store.roomMap, roomMap)
        })
        return
      }

      store.userMap = Object.keys(store.userMap).reduce((bucket, userSocketId) => {
        if (userSocketId === socketId) return bucket
        bucket[userSocketId] = store.userMap[userSocketId]
        return bucket
      }, {})
      const req = new Req('req:room:messages', { roomKey })
      $request(req).then((res) => {
        const { messages = [] } = res.body
        store.messages = messages
      })
    })
    vue.mixin({})

    Object.assign(
      vue.prototype,
      {
        $request,
        $order
      }
    )
  }
}

export default SocketPlugin
