import store from '@/store'

export default {
  name: 'Users',
  data () {
    return {
      store,
      checked: []
    }
  },
  computed: {
    users () {
      return store.users
    }
  }
}
