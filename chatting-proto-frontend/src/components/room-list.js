import store from '@/store'
import Req from '@/core/request'
import Password from '@/components/Password.vue'

export default {
  name: 'RoomList',
  components: {
    Password
  },
  data () {
    return {
      store,
      newRoomName: ''
    }
  },
  methods: {
    getClassBadgeSecret ({ pw }) {
      const classBadge = ['badge', 'text-center', 'align-middle']
      if (pw) {
        classBadge.push('badge-secondary')
      } else {
        classBadge.push('badge-info')
      }
      return classBadge.join(' ')
    },
    getClassBadgeMaxJoin ({ joining, maxJoin }) {
      const classBadge = ['badge', 'text-center', 'ml-1']
      if (maxJoin === 0) {
        classBadge.push('badge-dark')
      } else if (joining === maxJoin) {
        classBadge.push('badge-danger')
      } else if (joining >= maxJoin * 0.5) {
        classBadge.push('badge-warning')
      } else {
        classBadge.push('badge-success')
      }
      return classBadge.join(' ')
    },
    isFull (room) {
      return room.maxJoin > 0 && room.joining === room.maxJoin
    },
    isJoinedRoom (room) {
      const joinedRooms = new Set(JSON.parse(this.$cookies.get(store.userName)) || [])
      return joinedRooms.has(room.id)
    },
    removeRoomIdFromCookie (room) {
      const joinedRooms = new Set(JSON.parse(this.$cookies.get(store.userName)) || [])
      joinedRooms.delete(room.id)
    },
    async join (room) {
      const req = new Req('req:room:join', { id: room.id, pw: room.pw || '' })
      const res = await this.$request(req)
      const { room: resRoom } = res.body
      if (res.status === 200) {
        store.room = resRoom
        this.$router.push({ name: 'Chat', params: { roomId: resRoom.id, userName: store.userName, userId: store.userId, pw: resRoom.pw } })
      }
    },
    async setCurrRoom (room) {
      if (this.isFull(room)) {
        alert('인원이 꽉 찼습니다')
        return
      }
      try {
        if (this.isJoinedRoom(room)) {
          await this.join(room)
          return
        }
      } catch (e) {
        console.error(e)
        this.removeRoomIdFromCookie(room)
      }
      if (room.pw) {
        store.room = room
        this.$refs.password.$refs.modal.show()
        return
      }
      await this.join(room)
    },
    async deleteRoom (id) {
      const reqDelete = new Req('req:room:delete', { id })
      const resDelete = await this.$request(reqDelete)
      if (resDelete.status === 200) {
        store.room = {}
      }
    },
    async getRooms () {
      const req = new Req('req:room:list', { userId: store.userId, startIndex: store.startIndexRoom })
      this.$request(req).then((res) => {
        const { rooms = [] } = res.body
        console.log(rooms)
        store.rooms = [
          ...store.rooms,
          ...rooms
        ]
        store.startIndexRoom += store.rooms.length
      })
    }
  },
  beforeMount () {
    store.startIndexRoom = 0
    store.rooms = []
    this.getRooms()
  },
  mounted () {
    const { rooms } = this.$refs
    rooms.addEventListener('scroll', async (e) => {
      if (e.target.scrollTop !== e.target.scrollHeight - e.target.clientHeight) return
      this.getRooms()
    })
  }
}
