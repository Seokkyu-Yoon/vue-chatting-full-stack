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
      store
    }
  },
  methods: {
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
