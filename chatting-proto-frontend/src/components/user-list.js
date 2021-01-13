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
    options () {
      return store.users.map(({ socketId: value, userName: text }) => {
        return {
          value,
          text
        }
      })
    }
  },
  methods: {
    setCheck (userName) {
      const userIndex = this.checked.includes(userName)
      if (userIndex > -1) {
        this.checked = [
          ...this.checked.slice(0, userIndex),
          ...this.checked.slice(userIndex + 1)
        ]
      } else {
        this.checked.push(userName)
      }
    }
  }
}
