import Request from '@/core/request'
import store from '@/store'

export default {
  name: 'MessageList',
  data () {
    return {
      store,
      scrollToBottom: true,
      newMessage: '',
      blockSend: false
    }
  },
  methods: {
    send () {
      if (this.newMessage.trim() === '') return
      if (this.blockSend) return

      const req = new Request('req:room:write', { roomKey: store.joiningRoomKey, text: this.newMessage })
      this.blockSend = true
      this.$request(req).then((res) => {
        const { wrote } = res.body
        if (wrote) {
          this.newMessage = ''
          this.blockSend = false
        }
      })
    }
  },
  beforeCreate () {
    const req = new Request('req:room:messages', { roomKey: store.joiningRoomKey })
    this.$request(req).then((res) => {
      const { messages } = res.body
      this.store.messages = messages
    })
  },
  mounted () {
    const chatBoard = document.querySelector('#chat-board')
    this.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight
    chatBoard.scrollTop = this.scrollTop
  },
  beforeUpdate () {
    const chatBoard = document.querySelector('#chat-board')
    this.scrollToBottom = chatBoard.scrollTop === chatBoard.scrollHeight - chatBoard.clientHeight
    this.scrollTop = chatBoard.scrollTop
  },
  updated () {
    const chatBoard = document.querySelector('#chat-board')
    if (this.scrollToBottom) {
      this.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight
    }
    chatBoard.scrollTop = this.scrollTop
  }
}
