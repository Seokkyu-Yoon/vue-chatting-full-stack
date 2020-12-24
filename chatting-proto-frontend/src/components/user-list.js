import Request from '@/core/request'
import store from '@/store'

export default {
  name: 'Users',
  data () {
    return {
      store
    }
  },
  beforeCreate () {
    const req = new Request('req:user:list', { roomKey: store.joiningRoomKey })
    this.$request(req).then((res) => {
      const { userMap } = res.body
      this.store.userMap = userMap
    })
  }
}
