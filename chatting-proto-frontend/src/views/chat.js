import Req from '@/core/request'
import store from '@/store'
import UpsertRoom from '@/components/UpsertRoom.vue'
import MessageList from '@/components/MessageList.vue'
import UserList from '@/components/UserList.vue'
import RoomDetail from '@/components/RoomDetail.vue'

export default {
  name: 'Chat',
  components: {
    UpsertRoom,
    MessageList,
    UserList,
    RoomDetail
  },
  data () {
    return {
      store,
      content: '',
      type: 'text',
      showType: 'users',
      blockSend: false,
      sended: false
    }
  },
  methods: {
    async send () {
      if (this.content.trim() === '') {
        this.content = ''
        return
      }
      if (this.blockSend) return
      this.blockSend = true
      const req = new Req('req:message:write', {
        roomId: store.room.id,
        type: this.type,
        writter: store.userName,
        content: this.content,
        recipients: []
      })
      try {
        await this.$request(req)
        this.content = ''
        this.sended = !this.sended
      } catch (e) {
        console.error(e)
      } finally {
        this.blockSend = false
      }
    },
    updateRoom () {
      this.$refs.upsertRoom.$refs.modal.show()
    },
    leaveRoom () {
      const req = new Req('req:room:leave', { id: store.room.id })
      this.$request(req).then(() => {
        store.room = {}
        sessionStorage.setItem('chatting-store', JSON.stringify({
          userName: store.userName,
          userId: store.userId
        }))
        this.$router.push('/rooms')
      })
    },
    changeShowType (type) {
      this.showType = type
    },
    getClassTapItem (type) {
      const classTapItem = [
        'h6',
        'm-0',
        'p-2',
        'tap-item',
        'ml-auto',
        `bg-${type}`
      ]
      if (type !== 'users') {
        classTapItem.push('mt-1')
      }
      if (type === this.showType) {
        classTapItem.push('curr-show-type')
      }
      return classTapItem.join(' ')
    }
  },
  beforeCreate () {
    Object.assign(store, JSON.parse(sessionStorage.getItem('chatting-store')))
    store.minIndexMessage = -1
    store.recipients = []

    const { roomId = store.room.id, userId = store.userId, userName = store.userName, pw = store.room.pw } = this.$route.params
    if (!userName) {
      this.$router.push('/')
      return
    }
    if (roomId === null || typeof roomId === 'undefined') {
      this.$router.push('/')
      return
    }
    const reqLogin = new Req('req:user:login', { userName, userId: Number(userId), roomId: Number(roomId), pw })
    const promiseLogin = store.userName === userName
      ? Promise.resolve({ body: { userName: store.userName, room: store.room, userId: store.userId } })
      : this.$request(reqLogin)

    promiseLogin.then((res) => {
      const {
        userName,
        userId,
        room
      } = res.body

      const userRooms = new Set(JSON.parse(this.$cookies.get(userName)) || [])
      userRooms.add(room.id)
      this.$cookies.set(userName, JSON.stringify([...userRooms]))

      store.userId = userId
      store.userName = userName
      store.room = room
      sessionStorage.setItem('chatting-store', JSON.stringify({
        userName: store.userName,
        userId: store.userId,
        room: store.room
      }))

      const reqMessages = new Req('req:message:list', { roomId: store.room.id, minIndex: store.minIndexMessage })
      const reqUsers = new Req('req:user:list', { roomId: store.room.id })
      return Promise.all([
        this.$request(reqMessages),
        this.$request(reqUsers)
      ])
    }).then(([resMessages, resUsers]) => {
      const { messages, minIndex } = resMessages.body
      const { users = [] } = resUsers.body
      store.messages = messages.length
        ? messages
        : [{
            type: 'dummy',
            content: '대화가 없습니다'
          }]
      store.minIndexMessage = minIndex
      store.users = users
    }).catch((e) => {
      if (!store.userName) {
        this.$router.push('/')
        return
      }
      this.$router.push('Rooms')
    })
  },
  beforeDestroy () {
    store.room = {}
    store.messages = []
    store.recipients = []
  }
}
