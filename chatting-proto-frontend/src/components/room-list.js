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
