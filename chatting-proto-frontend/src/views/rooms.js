import Req from '@/core/request'
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
    if (typeof store.room.id !== 'undefined') {
      const req = new Req('req:room:leave', { id: store.room.id })
      this.$request(req).then((res) => {
        if (res.status === 200) {
          store.room = {}
        }
      })
    }

    store.startIndexRoom = 0
    const req = new Req('req:room:list', { startIndex: store.startIndexRoom })
    this.$request(req).then((res) => {
      const { rooms = [] } = res.body
      store.rooms = rooms
    })
  }
}
