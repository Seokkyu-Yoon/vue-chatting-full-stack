import Request from '@/core/request'
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
      blockSend: false
    }
  },
  methods: {
    send () {
      if (this.newMessage.trim() === '') {
        this.newMessage = ''
        return
      }
      if (this.blockSend) return

      const req = new Request('req:room:write', { roomKey: store.joiningRoomKey, text: this.newMessage })
      this.blockSend = true
      this.$request(req).then((res) => {
        const { wrote } = res.body
        if (wrote) {
          this.newMessage = ''
          this.blockSend = false
        }
      })
    },
    updateRoom () {
      this.$refs.upsertRoom.$refs.modal.show()
    },
    leaveRoom () {
      const req = new Request('req:room:leave', { roomKey: store.joiningRoomKey })
      this.$request(req).then((res) => {
        const { joined } = res.body
        if (!joined) {
          store.joiningRoomKey = null
          this.$router.go(-1)
        }
      })
    }
  },
  beforeCreate () {
    if (store.joiningRoomKey === null || store.userName === '') {
      this.$router.go(-1)
    }
  },
  beforeUpdate () {
    if (store.joiningRoomKey === null || store.userName === '') {
      this.$router.go(-1)
    }
  },
  beforeDestroy () {
    store.messages = []
  }
}
