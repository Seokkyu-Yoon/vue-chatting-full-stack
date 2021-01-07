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
  }
}
