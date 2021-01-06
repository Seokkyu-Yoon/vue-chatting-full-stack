import Request from '@/core/request'
import store from '@/store'

export default {
  name: 'Users',
  data () {
    return {
      store
    }
  },
  computed: {
    users () {
      return store.users
    }
  },
  beforeCreate () {
    const req = new Request('req:user:list', { roomKey: store.room.roomKey })
    this.$request(req).then((res) => {
      const { users = [] } = res.body
      store.users = users
    })
  }
}
