import io from 'socket.io-client'
import store from '@/store'
import Request from '@/core/request'

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
      const reqLogin = new Request('req:user:login', { userName: store.userName, roomKey: store.joiningRoomKey })
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
        const reqUser = new Request('req:user:list', { roomKey: store.joiningRoomKey })
        const reqMessages = new Request('req:room:messages', { roomKey })
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
      const reqRoomMap = new Request('req:room:list', {})
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
