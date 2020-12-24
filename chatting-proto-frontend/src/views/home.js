import Login from '@/components/Login.vue'
import Req from '@/core/request'

export default {
  name: 'Home',
  components: {
    Login
  },
  mounted () {
    const req = new Req('broadcast:user:list')
    this.$order(req)
  }
}
