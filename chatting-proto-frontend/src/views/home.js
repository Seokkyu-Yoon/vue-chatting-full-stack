import Login from '@/components/Login.vue'
import Request from '@/core/request'

export default {
  name: 'Home',
  components: {
    Login
  },
  mounted () {
    const req = new Request('broadcast:user:list')
    this.$order(req)
  }
}
