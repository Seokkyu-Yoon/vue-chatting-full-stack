import store from '@/store'
import UpsertRoom from '@/components/UpsertRoom.vue'
import MessageList from '@/components/MessageList.vue'
import FileList from '@/components/FileList.vue'
import UserList from '@/components/UserList.vue'
import RoomDetail from '@/components/RoomDetail.vue'

export default {
  name: 'Chat',
  components: {
    UpsertRoom,
    MessageList,
    UserList,
    FileList,
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
      const type = this.type
      const content = this.content
      this.content = ''
      try {
        await this.$socketHandler.writeMessage({
          roomId: store.room.id,
          type: type,
          writter: store.user.id,
          content: content,
          recipients: []
        })
        this.sended = !this.sended
      } catch (e) {
        console.error(e)
        this.content = `${content}${this.content}`
      } finally {
        this.blockSend = false
      }
    },
    updateRoom () {
      this.$refs.upsertRoom.$refs.modal.show()
    },
    async leaveRoom () {
      await this.$socketHandler.leaveRoom({ id: store.room.id, userId: store.user.id })
      store.room = null
      sessionStorage.setItem('chatting-store', JSON.stringify({ user: store.user }))
      this.$router.push('/rooms')
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
  async beforeCreate () {
    store.minIndexMessage = -1
    store.messages = []
    store.recipients = []

    const storageData = JSON.parse(sessionStorage.getItem('chatting-store')) || {}
    const { user: storageUser = {}, room: storageRoom = {} } = storageData
    if (store.user === null) {
      try {
        const res = await this.$socketHandler.signIn({
          id: this.$route.params.userId || storageUser.id,
          pw: this.$route.params.userPw || storageUser.pw || ''
        })
        const { user } = res.body
        store.user = user
      } catch (e) {
        this.$router.push('/')
        return
      }
    }
    if (store.room === null) {
      try {
        const resJoin = await this.$socketHandler.joinRoom({
          id: this.$route.params.roomId || storageRoom.id,
          pw: this.$route.params.roomPw || storageRoom.pw || '',
          userId: this.$route.params.userId || storageUser.id
        })
        const { room } = resJoin.body
        store.room = room
      } catch (e) {
        store.room = null
        this.$router.push('/rooms')
      }
    }
    sessionStorage.setItem('chatting-store', JSON.stringify({ user: store.user, room: store.room }))

    const resMessages = await this.$socketHandler.getMessagesInRoom({ userId: store.user.id, roomId: store.room.id, minIndex: store.minIndexMessage })
    const { messages, minIndex } = resMessages.body
    store.messages = messages.length > 0 ? messages : [{ type: 'dummy', content: '대화가 없습니다' }]
    store.minIndexMessage = minIndex

    const resUsers = await this.$socketHandler.getOnlineMembersInRoom({ roomId: store.room.id })
    const { users } = resUsers.body
    store.users = users
  },
  beforeUpdate () {
    if (store.room === null) {
      this.$router.push('/rooms')
    }
  }
}
