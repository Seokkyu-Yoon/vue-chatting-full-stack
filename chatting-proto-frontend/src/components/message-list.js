import Request from '@/core/request'
import store from '@/store'

export default {
  name: 'MessageList',
  data () {
    return {
      store,
      scrollToBottom: true
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
    const chatBoard = this.$refs.board
    this.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight
    chatBoard.scrollTop = this.scrollTop
  },
  beforeUpdate () {
    const chatBoard = this.$refs.board
    this.scrollToBottom = chatBoard.scrollTop === chatBoard.scrollHeight - chatBoard.clientHeight
    this.scrollTop = chatBoard.scrollTop
  },
  updated () {
    const chatBoard = this.$refs.board
    if (this.scrollToBottom) {
      this.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight
    }
    chatBoard.scrollTop = this.scrollTop
  }
}
