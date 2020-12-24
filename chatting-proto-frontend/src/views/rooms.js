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
    if (store.userName === '') {
      this.$router.go(-1)
      return
    }
    if (store.joiningRoomKey !== null) {
      const body = { roomKey: store.joiningRoomKey }
      const req = new Request('req:room:leave', body)
      this.$request(req).then((res) => {
        if (res.status === 200) {
          store.joiningRoomKey = null
        }
      })
    }
  }
}
