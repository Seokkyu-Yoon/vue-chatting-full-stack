import store from '@/store'

export default {
  data () {
    return { store }
  },
  computed: {
    logined () {
      return store.user !== null
    }
  },
  methods: {
    showMyInfo () {
      // eslint-disable-next-line no-alert
      alert('구현 중')
    }
  }
}
