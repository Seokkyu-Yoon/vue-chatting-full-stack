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
    Object.assign(store, JSON.parse(sessionStorage.getItem('chatting-store')))
    sessionStorage.setItem('chatting-store', JSON.stringify({
      userName: store.userName,
      userId: store.userId
    }))
    if (store.userName === '') {
      this.$router.push('/')
      return
    }
    if (typeof store.room.id !== 'undefined') {
      const req = new Req('req:room:leave', { id: store.room.id })
      this.$request(req).then(() => {
        store.room = {}
        sessionStorage.setItem('chatting-store', JSON.stringify({
          userName: store.userName,
          userId: store.userId
        }))
      })
    }
    store.startIndexRoom = 0
    const req = new Req('req:room:list', { userId: store.userId, startIndex: store.startIndexRoom })
    this.$request(req).then((res) => {
      const { rooms = [] } = res.body
      store.rooms = rooms
    })
  }
}
