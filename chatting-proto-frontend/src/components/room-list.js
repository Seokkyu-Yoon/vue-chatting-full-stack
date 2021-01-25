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
    setCurrRoom (room) {
      if (room.joining === room.maxJoin) {
        if (room.maxJoin !== 0) {
          alert('인원이 꽉 찼습니다')
          return
        }
      }
      if (room.pw) {
        store.room = room
        this.$refs.password.$refs.modal.show()
        return
      }
      const req = new Req('req:room:join', { id: room.id })
      this.$request(req).then((res) => {
        const { room } = res.body
        if (res.status === 200) {
          store.room = room
          this.$router.push({ name: 'Chat', params: { roomId: room.id, userName: store.userName, pw: room.pw } })
        }
      }).catch(console.log)
    },
    deleteRoom (id) {
      const req = new Req('req:room:delete', { id })
      this.$request(req)
        .then((res) => {
          if (res.status === 200) {
            store.room = {}
            const reqRoomList = new Req('req:room:list', { startIndex: store.startIndexRoom })
            return this.$request(reqRoomList)
          }
        })
        .then((res) => {
          if (!res) return
          const { rooms, roomCount } = res.body
          store.rooms = rooms
          store.roomCount = roomCount
        })
        .catch(console.log)
    }
  },
  beforeMount () {
    store.startIndexRoom = 0
  }
}
