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
    },
    async leaveRoom () {
      const req = new Req('req:room:leave', { id: store.room.id })
      await this.$request(req)
      store.room = {}
      sessionStorage.setItem('chatting-store', JSON.stringify({
        userName: store.userName,
        userId: store.userId
      }))
    },
    async search () {
      const req = store.searchRoomText === ''
        ? new Req('req:room:list', { userId: store.userId, startIndex: 0 })
        : new Req('req:room:search', { userId: store.userId, startIndex: store.startIndexRoom, title: store.searchRoomText })

      const res = await this.$request(req)
      const { rooms = [] } = res.body
      store.rooms = rooms

      if (store.searchRoomText === '') {
        store.startIndexRoom = store.rooms.length
      }
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
      this.leaveRoom()
    }
  }
}
