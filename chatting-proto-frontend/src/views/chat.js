import Req from '@/core/request'
import store from '@/store'
import UpsertRoom from '@/components/UpsertRoom.vue'
import MessageList from '@/components/MessageList.vue'
import UserList from '@/components/UserList.vue'

export default {
  name: 'Chat',
  components: {
    UpsertRoom,
    MessageList,
    UserList
  },
  data () {
    return {
      store,
      newMessage: '',
      blockSend: false,
      sended: false
    }
  },
  computed: {
    recipients () {
      console.log(this.$refs.users)
      // if (this.$refs.users.checked.length === 0) {
      //   return '전체'
      // }
      // console.log(this.$refs.users)
      // const users = this.$refs.users.checked.join(', ')
      // if (users.length > 50) {
      //   return `${users.slice(0, 50)}...`
      // }
      // return users
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
    }
  },
  beforeCreate () {
    if (typeof store.room.roomKey === 'undefined' || store.userName === '') {
      this.$router.go(-1)
      return
    }

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
  beforeUpdate () {
    if (typeof store.room.roomKey === 'undefined' || store.userName === '') {
      this.$router.go(-1)
    }
  },
  beforeDestroy () {
    store.messages = []
  }
}
