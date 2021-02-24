import store from '@/store'
import GroupChat from '@/components/GroupChat.vue'

export default {
  name: 'Users',
  components: {
    GroupChat
  },
  data () {
    return {
      store,
      checked: []
    }
  },
  computed: {
    options () {
      return store.users.map((user) => {
        const value = user
        const text = user.name
        return {
          value,
          text
        }
      })
    }
  },
  methods: {
    isDisableToAddRecipient (id) {
      if (id === store.user.id) return true
      const isAlreadyExists = store.recipients.some(({ id: recipientId }) => recipientId === id)
      if (isAlreadyExists) return true
      return undefined
    },
    setCheck (userId) {
      const userIndex = this.checked.includes(userId)
      if (userIndex > -1) {
        this.checked = [
          ...this.checked.slice(0, userIndex),
          ...this.checked.slice(userIndex + 1)
        ]
      } else {
        this.checked.push(userId)
      }
    },
    addRecipient (user) {
      store.recipients.push(user)
    }
  }
}
