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
    isDisableToAddRecipient (name) {
      if (name === store.userName) return true

      const isAlreadyExists = store.recipients.some(({ name: recipientName }) => recipientName === name)
      if (isAlreadyExists) return true

      return undefined
    },
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
    },
    addRecipient (user) {
      store.recipients.push(user)
    },
    removeRecipient (index) {
      store.recipients = [
        ...store.recipients.slice(0, index),
        ...store.recipients.slice(index + 1)
      ]
    },
    removeAllRecipients () {
      store.recipients = []
    }
  }
}
