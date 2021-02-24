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
  methods: {
    isShown ({ writter, recipients = [] }) {
      return recipients.length === 0 || writter === store.user.id || recipients.includes(store.user.id)
    },
    isDifferentDate (yyyyMMdd1, yyyyMMdd2) {
      const checkList = ['year', 'month', 'date']
      const isSame = checkList.every((checkKey) => yyyyMMdd1[checkKey] === yyyyMMdd2[checkKey])
      return !isSame
    },
    getYearMonthDate ({ writeAt = '' }) {
      const yyyyMMdd = writeAt.split(' ')[0]
      const [year, month, date] = yyyyMMdd.split('-')
      return {
        year, month, date
      }
    },
    getDateFormatted ({ writeAt = '' }) {
      const { year, month, date } = this.getYearMonthDate({ writeAt })
      return `${year}년 ${month}월 ${date}일`
    },
    getTimeFormatted ({ writeAt = '' }) {
      const hhmmss = writeAt.split(' ')[1]
      const [hours, minutes] = hhmmss.split(':')

      let numHours = Number(hours)
      const isAfterNoon = numHours >= 12
      if (isAfterNoon) numHours -= 12
      const AMPM = isAfterNoon ? 'PM' : 'AM'
      const outputHours = `${numHours}`.padStart(2, '0')

      return `${AMPM} ${outputHours}:${minutes}`
    },
    getPrevMsg (index) {
      let msgIndex = index - 1
      while (msgIndex > 0) {
        const prevMsg = store.messages[msgIndex]
        if (this.isRecipient(index)) {
          return prevMsg
        }
        msgIndex -= 1
      }
      return null
    },
    isRecipient (index) {
      const message = store.messages[index]
      if (message.type === 'dummy') return false
      return (
        message.recipients.length === 0 ||
        message.writter === store.user.id ||
        message.recipients.includes(store.user.id)
      )
    },
    isDateChanged (index) {
      if (!this.isRecipient(index)) return false
      if (index === 0) return true
      const currMsg = store.messages[index]
      const prevMsg = this.getPrevMsg(index)

      if (prevMsg === null) return false
      const currYearMonthDate = this.getYearMonthDate(currMsg)
      const prevYearMonthDate = this.getYearMonthDate(prevMsg)

      return this.isDifferentDate(currYearMonthDate, prevYearMonthDate)
    },
    async handleScroll (e) {
      if (e.target.scrollTop !== 0) return
      if (store.minIndex === 0) return
      const res = await this.$socketHandler.getMessagesInRoom({ userId: store.user.id, roomId: store.room.id, minIndex: store.minIndexMessage })
      const { messages, minIndex } = res.body
      store.messages = [...messages, ...store.messages]
      store.minIndexMessage = minIndex
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
    chatBoard.addEventListener('scroll', this.handleScroll)
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
  },
  beforeDestroy () {
    const chatBoard = this.$refs.board
    chatBoard.removeEventListener('scroll', this.handleScroll)
  }
}
