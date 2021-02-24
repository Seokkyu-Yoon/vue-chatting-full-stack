import store from '@/store'

export default {
  name: 'GroupChat',
  data () {
    return {
      store,
      content: '',
      type: 'text',
      blockSend: false
    }
  },
  computed: {
    recipientsText () {
      return store.recipients.map(({ name }) => name).join(', ')
    }
  },
  methods: {
    removeRecipient (index) {
      store.recipients = [
        ...store.recipients.slice(0, index),
        ...store.recipients.slice(index + 1)
      ]
    },
    removeAllRecipients () {
      store.recipients = []
    },
    async send () {
      if (this.content.trim() === '') {
        this.content = ''
        return
      }
      if (store.recipients.length === 0) {
        this.content = ''
        return
      }
      if (this.blockSend) return
      this.blockSend = true

      try {
        await this.$socketHandler.writeMessage({
          roomId: store.room.id,
          type: this.type,
          writter: store.user.id,
          content: this.content,
          recipients: store.recipients.map(({ id }) => id)
        })
        this.content = ''
        this.sended = !this.sended
      } catch (e) {
        console.error(e)
      } finally {
        this.blockSend = false
      }
    }
  }
}
