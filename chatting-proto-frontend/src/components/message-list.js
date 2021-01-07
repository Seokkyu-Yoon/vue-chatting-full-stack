import Req from '@/core/request'
import store from '@/store'

export default {
  name: 'MessageList',
  props: ['sended'],
  data () {
    return {
      store,
      scrollToBottom: true,
      scrollHeightBeforeUpdate: 0
    }
  },
  watch: {
    sended: {
      handler () {
        const chatBoard = this.$refs.board
        chatBoard.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight
      }
    }
  },
  mounted () {
    const chatBoard = this.$refs.board
    chatBoard.addEventListener('scroll', (e) => {
      if (e.target.scrollTop !== 0) return
      if (store.minIndex === 0) return
      const req = new Req('req:message:list', { roomKey: store.room.roomKey, minIndex: store.minIndexMessage })
      this.$request(req).then((res) => {
        const { messages, minIndex } = res.body
        store.messages = [...messages, ...store.messages]
        store.minIndexMessage = minIndex
      })
    })
    chatBoard.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight
  },
  beforeUpdate () {
    const chatBoard = this.$refs.board
    this.scrollToBottom = chatBoard.scrollTop === chatBoard.scrollHeight - chatBoard.clientHeight
    this.scrollTop = chatBoard.scrollTop
    this.scrollHeightBeforeUpdate = chatBoard.scrollHeight
  },
  updated () {
    const chatBoard = this.$refs.board
    if (this.scrollToBottom) {
      this.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight
    } else if (this.scrollTop === 0) {
      this.scrollTop = chatBoard.scrollHeight - this.scrollHeightBeforeUpdate
    }
    chatBoard.scrollTop = this.scrollTop
  }
}
