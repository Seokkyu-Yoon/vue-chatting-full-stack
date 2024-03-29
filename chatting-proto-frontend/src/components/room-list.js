import store from '@/store'
import Password from '@/components/Password.vue'

// const confirm = window.confirm

export default {
  name: 'RoomList',
  components: {
    Password
  },
  props: {
    rooms: Array,
    getRooms: Function,
    join: Function,
    scroll: Boolean,
    emptyMessage: String,
    mini: Boolean
  },
  data () {
    return {
      store,
      cardOffsetWidth: 0,
      roomOveray: []
    }
  },
  methods: {
    getFormattedCreateAt ({ createAt }) {
      const yyyyMMdd = createAt.split(' ')[0]
      const [year, month, day] = yyyyMMdd.split('-')
      return `${year}년 ${month}월 ${day}일`
    },
    getClassBadgeSecret ({ pw }) {
      const classBadge = ['badge', 'text-center', 'align-middle']
      if (pw) {
        classBadge.push('badge-secondary')
      } else {
        classBadge.push('badge-info')
      }
      return classBadge.join(' ')
    },
    getClassBadgeMaxJoin ({ joining, maxJoin }) {
      const classBadge = ['badge', 'text-center', 'ml-1']
      if (maxJoin === 0) {
        classBadge.push('badge-dark')
      } else if (joining >= maxJoin) {
        classBadge.push('badge-danger')
      } else if (joining >= maxJoin / 2) {
        classBadge.push('badge-warning')
      } else {
        classBadge.push('badge-success')
      }
      return classBadge.join(' ')
    },
    async deleteRoom (id) {
      if (window.confirm(`${id} 방을 진짜 지우시겠습니까? `)) {
        await this.$socketHandler.deleteRoom({ id })
      }
    },
    async doDelete () {

    },
    async handleScroll (e) {
      if (e.target.scrollTop !== e.target.scrollHeight - e.target.clientHeight) return
      this.getRooms()
    },
    handleResize () {
      const { rooms } = this.$refs
      if (rooms) {
        this.cardOffsetWidth = rooms.offsetWidth / Math.floor(rooms.offsetWidth / 256) - 16
      }
    }
  },
  created () {
    this.getRooms()
  },
  async mounted () {
    const { rooms } = this.$refs
    if (this.scroll) {
      rooms.addEventListener('scroll', this.handleScroll)
    }
    window.addEventListener('resize', this.handleResize)
    if (rooms) {
      this.cardOffsetWidth = rooms.offsetWidth / Math.floor(rooms.offsetWidth / 256) - 16
    }
  },
  beforeDestroy () {
    const { rooms } = this.$refs
    if (this.scroll) {
      rooms.removeEventListener('scroll', this.handleScroll)
    }
    window.removeEventListener('resize', this.handleResize)
  }
}
