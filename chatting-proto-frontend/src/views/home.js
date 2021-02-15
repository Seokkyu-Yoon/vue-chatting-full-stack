import Login from '@/components/Login.vue'

export default {
  name: 'Home',
  components: {
    Login
  },
  beforeMount () {
    sessionStorage.clear()
  }
}
