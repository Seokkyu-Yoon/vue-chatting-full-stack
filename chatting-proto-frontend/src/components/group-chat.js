import Req from '@/core/request'
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
      const req = new Req('req:message:write', {
        roomId: store.room.id,
        type: this.type,
        writter: store.userName,
        content: this.content,
        recipients: store.recipients.map(({ name }) => name)
      })
      try {
        await this.$request(req)
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
