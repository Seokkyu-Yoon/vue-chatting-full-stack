import Req from '@/core/request'
import store from '@/store'
import UpsertRoom from '@/components/UpsertRoom.vue'
import MessageList from '@/components/MessageList.vue'
import UserList from '@/components/UserList.vue'
import FileList from '@/components/FileList.vue'
import RoomDetail from '@/components/RoomDetail.vue'
import FileUploader from '@/components/FileUploadModal'

export default {
  name: 'Chat',
  components: {
    UpsertRoom,
    MessageList,
    UserList,
    FileList,
    RoomDetail,
    FileUploader
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
  computed: {
    recipientsText () {
      if (store.recipients.length === 0) return '전체'
      const recipientsText = store.recipients.map(({ name }) => name).join(', ')
      if (recipientsText.length > 50) return `${recipientsText.slice(0, 47)}...`
      return recipientsText
    }
  },
  methods: {
    send () {
      if (this.content.trim() === '') {
        this.content = ''
        return
      }
      if (this.blockSend) return
      const req = new Req('req:message:write', {
        roomId: store.room.id,
        type: this.type,
        writter: store.userName,
        content: this.content,
        recipients: store.recipients.map(({ name }) => name)
      })
      this.$request(req).then(() => {
        this.content = ''
        this.sended = !this.sended
      })
    },
    updateRoom () {
      this.$refs.upsertRoom.$refs.modal.show()
    },
    leaveRoom () {
      const req = new Req('req:room:leave', { id: store.room.id })
      this.$request(req).then(() => {
        store.room = {}
        this.$router.go(-1)
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
    // store.startIndexUser = 0
    store.minIndexMessage = -1
    store.recipients = []
    const { roomId = null, userName = '', pw = '' } = this.$route.params
    if (roomId === null || !userName) {
      this.$router.go(-1)
    }
    const reqLogin = new Req('req:user:login', { userName, roomId, pw })
    const promiseLogin = store.userName === userName
      ? Promise.resolve({ body: { userName: store.userName, room: store.room } })
      : this.$request(reqLogin)

    promiseLogin.then((res) => {
      const {
        userName,
        room
      } = res.body

      store.userName = userName
      store.room = room

      const reqMessages = new Req('req:message:list', { roomId: store.room.id, minIndex: store.minIndexMessage })
      // const reqUsers = new Req('req:user:list', { roomId: store.room.id, startIndex: store.startIndexUser })
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
    }).catch(() => {
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
