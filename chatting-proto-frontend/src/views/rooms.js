import Request from '@/core/request'
import store from '@/store'
import RoomList from '@/components/RoomList.vue'
import UpsertRoom from '@/components/UpsertRoom.vue'

export default {
  name: 'Rooms',
  components: {
    RoomList,
    UpsertRoom
  },
  data () {
    return {
      store
    }
  },
  methods: {
    createRoom () {
      this.$refs.upsertRoom.$refs.modal.show()
    }
  },
  beforeMount () {
    if (typeof store.room.roomKey !== 'undefined') {
      const body = { roomKey: store.room.roomKey }
      const req = new Request('req:room:leave', body)
      this.$request(req).then((res) => {
        if (res.status === 200) {
          store.room = {}
        }
      })
    }
    if (store.userName === '') {
      this.$router.go(-1)
      return
    }
    const body = {}
    const req = new Request('req:room:list', body)
    this.$request(req).then((res) => {
      const { rooms = [] } = res.body
      store.rooms = rooms
    })
  }
}
