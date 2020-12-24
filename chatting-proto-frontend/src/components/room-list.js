import store from '@/store'
import Request from '@/core/request'

export default {
  name: 'RoomList',
  data () {
    return {
      store,
      newRoomName: ''
    }
  },
  methods: {
    setCurrRoom (roomKey) {
      const body = { roomKey }
      const req = new Request('req:room:join', body)
      this.$request(req).then((res) => {
        const { joined } = res.body
        if (joined) {
          store.joiningRoomKey = roomKey
          this.$router.push('Chat')
        }
      })
    },
    deleteRoom (roomKey) {
      const body = { roomKey }
      const req = new Request('req:room:delete', body)
      this.$order(req)
    }
  },
  mounted () {
    const body = {}
    const req = new Request('req:room:list', body)
    this.$request(req).then((res) => {
      const { roomMap } = res.body
      store.roomMap = roomMap
    })
  }
}
