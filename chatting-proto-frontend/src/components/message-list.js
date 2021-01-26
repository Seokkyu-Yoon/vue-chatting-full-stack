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
  methods: {
    isShown ({ writter, recipients = [] }) {
      return recipients.length === 0 || writter === store.userName || recipients.includes(store.userName)
    },
    isDifferentDate (yyyyMMdd1, yyyyMMdd2) {
      const checkList = ['year', 'month', 'date']
      const isSame = checkList.every((checkKey) => yyyyMMdd1[checkKey] === yyyyMMdd2[checkKey])
      return !isSame
    },
    getYearMonthDate ({ datetime = '' }) {
      const yyyyMMdd = datetime.split(' ')[0]
      const [year, month, date] = yyyyMMdd.split('-')
      return {
        year, month, date
      }
    },
    getDateFormatted ({ datetime = '' }) {
      const { year, month, date } = this.getYearMonthDate({ datetime })
      return `${year}년 ${month}월 ${date}일`
    },
    getTimeFormatted ({ datetime = '' }) {
      const hhmmss = datetime.split(' ')[1]
      const [hours, minutes] = hhmmss.split(':')

      let numHours = Number(hours)
      const isAfterNoon = numHours >= 12
      if (isAfterNoon) numHours -= 12
      const AMPM = isAfterNoon ? 'PM' : 'AM'
      const outputHours = `${numHours}`.padStart(2, '0')

      return `${AMPM} ${outputHours}:${minutes}`
    },
    isDateChanged (index) {
      if (index === 0) return true
      const currMsg = store.messages[index]
      const prevMsg = store.messages[index - 1]
      const currYearMonthDate = this.getYearMonthDate(currMsg)
      const prevYearMonthDate = this.getYearMonthDate(prevMsg)

      return this.isDifferentDate(currYearMonthDate, prevYearMonthDate)
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
      const req = new Req('req:message:list', { roomId: store.room.id, minIndex: store.minIndexMessage })
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
