import store from '@/store'
import Req from '@/core/request'

export default {
  name: 'RoomList',
  data () {
    return {
      store,
      newRoomName: '',
      password: {}
    }
  },
  methods: {
    getClassBadgeSecret ({ roomPassword }) {
      const classBadge = ['badge', 'text-center', 'align-middle']
      if (roomPassword) {
        classBadge.push('badge-secondary')
      } else {
        classBadge.push('badge-info')
      }
      return classBadge.join(' ')
    },
    getClassBadgeMaxJoin ({ joining, roomMaxJoin }) {
      const classBadge = ['badge', 'text-center', 'ml-1']
      if (roomMaxJoin === 0) {
        classBadge.push('badge-dark')
      } else if (joining === roomMaxJoin) {
        classBadge.push('badge-danger')
      } else if (joining >= roomMaxJoin * 0.5) {
        classBadge.push('badge-warning')
      } else {
        classBadge.push('badge-success')
      }
      return classBadge.join(' ')
    },
    setCurrRoom (room) {
      if (room.roomPassword) {
        if (this.password[room.roomKey] !== room.roomPassword) {
          alert('비밀번호를 확인해주세요')
          this.password[room.roomKey] = ''
          return
        }
      }
      const req = new Req('req:room:join', { roomKey: room.roomKey })
      this.$request(req).then((res) => {
        const { room: resRoom } = res.body
        if (res.status === 200) {
          store.room = resRoom
          this.$router.push('Chat')
        }
      })
    },
    deleteRoom (roomKey) {
      const req = new Req('req:room:delete', { roomKey })
      this.$request(req).then((res) => {
        if (res.status === 200) {
          store.room = {}
          const reqRoomList = new Req('req:room:list', { roomKey: null, startIndex: store.startIndexRoom })
          return this.$request(reqRoomList)
        }
      }).then((res) => {
        if (!res) return
        const { rooms } = res.body
        store.rooms = rooms
      })
    }
  },
  beforeMount () {
    store.startIndexRoom = 0
  }
}
