import Req from '@/core/request'
import store from '@/store'
import UpsertRoom from '@/components/UpsertRoom.vue'
import MessageList from '@/components/MessageList.vue'
import UserList from '@/components/UserList.vue'
import FileList from '@/components/FileList.vue'
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
      newMessage: '',
      blockSend: false,
      sended: false,
      showType: 'users'
    }
  },
  computed: {
    recipients () {
      // 선택된 사용자가 있으면 '전체'가 아닌 해당 사용자 반환
      return '전체'
    }
  },
  methods: {
    send () {
      if (this.newMessage.trim() === '') {
        this.newMessage = ''
        return
      }
      if (this.blockSend) return

      const req = new Req('req:message:write', { roomKey: store.room.roomKey, text: this.newMessage })
      this.$request(req).then((res) => {
        const { wrote } = res.body
        if (wrote) {
          this.newMessage = ''
          this.sended = !this.sended
        }
      })
    },
    updateRoom () {
      this.$refs.upsertRoom.$refs.modal.show()
    },
    leaveRoom () {
      const req = new Req('req:room:leave', { roomKey: store.room.roomKey })
      this.$request(req).then((res) => {
        const { joined } = res.body
        if (!joined) {
          store.room = {}
          this.$router.go(-1)
        }
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
    store.minIndexMessage = -1
    const reqMessages = new Req('req:message:list', { roomKey: store.room.roomKey, minIndex: store.minIndexMessage })
    this.$request(reqMessages).then((res) => {
      const { messages, minIndex } = res.body
      store.messages = messages
      store.minIndexMessage = minIndex
    })

    const reqUsers = new Req('req:user:list', { roomKey: store.room.roomKey, startIndex: store.startIndexUser })
    this.$request(reqUsers).then((res) => {
      const { users = [] } = res.body
      store.users = users
    })
  },
  beforeDestroy () {
    store.messages = []
  }
}
