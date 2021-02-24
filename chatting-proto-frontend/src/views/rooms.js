import store from '@/store'
import RoomList from '@/components/RoomList.vue'
import Password from '@/components/Password.vue'
import UpsertRoom from '@/components/UpsertRoom.vue'

export default {
  name: 'Rooms',
  components: {
    RoomList,
    UpsertRoom,
    Password
  },
  data () {
    return {
      store,
      selectedRoom: null
    }
  },
  computed: {
    searching () {
      return store.searchRoomText !== ''
    },
    visibleJoined () {
      return !this.searching
    }
  },
  methods: {
    isFull (room) {
      return room.maxJoin > 0 && room.joining === room.maxJoin
    },
    createRoom () {
      this.$refs.upsertRoom.$refs.modal.show()
    },
    async getRooms () {
      const res = await this.$socketHandler.getRooms({ startIndex: store.startIndexRoom })
      const { rooms = [] } = res.body
      store.rooms = [
        ...store.rooms,
        ...rooms
      ]
      store.startIndexRoom = store.rooms.length
    },
    async getRoomsJoined () {
      const res = await this.$socketHandler.getRoomsJoined({ userId: store.user.id })
      const { rooms = [] } = res.body
      store.roomsJoined = rooms
    },
    async getRoomsSearched (e) {
      const res = await this.$socketHandler.getRoomsSearched({ title: e.target.value })
      const { rooms = [] } = res.body
      store.roomsSearched = rooms
    },
    async leaveRoom () {
      await this.$socketHandler.leaveRoom({ id: store.room.id })
      store.room = null
    },
    async join (room, pw = '') {
      if (this.isFull(room)) {
        alert('인원이 꽉 찼습니다')
        return
      }
      try {
        const res = await this.$socketHandler.joinRoom({ id: room.id, userId: store.user.id, pw })
        const { room: resRoom = null } = res.body
        store.room = resRoom
        this.$router.push({ name: 'Chat', params: { user: store.user, room: store.room } })
      } catch (e) {
        console.log(e)
        const { code } = e.body
        if (code === 201) {
          this.selectedRoom = room
          this.$refs.password.$refs.modal.show()
        }
      }
    },
    async selectRoom (room) {
      this.selectRoom = room
    }
  },
  async created () {
    store.startIndexRoom = 0
    store.rooms = []
    store.roomsJoined = []
    store.roomsSearched = []
    if (store.room !== null) {
      this.leaveRoom()
    }

    Object.assign(store, JSON.parse(sessionStorage.getItem('chatting-store')))

    if (store.user === null) {
      this.$router.push('/')
      return
    }

    try {
      const res = await this.$socketHandler.signIn({ id: store.user.id, pw: store.user.pw })
      const { user } = res.body
      store.user = user

      sessionStorage.setItem('chatting-store', JSON.stringify({ user: store.user }))
    } catch (e) {
      return this.$router.push('/')
    }
  }
}
