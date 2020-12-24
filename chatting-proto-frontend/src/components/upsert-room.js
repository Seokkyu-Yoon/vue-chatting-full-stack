export default {
  name: 'Modal',
  props: ['title', 'modifing'],
  data () {
    return {
      roomName: '',
      isPrivate: false,
      password: '',
      maxJoin: '0',
      isInfinity: true,
      description: ''
    }
  },
  methods: {
    setRoomName (e) {
      this.maxJoin = e.target.value.replace(/^0+/, '')
    },
    setPublic () {
      this.isPrivate = false
      this.password = ''
    },
    setPrivate () {
      this.isPrivate = true
    },
    getBtnClass (type) {
      if (type === 'public') {
        const base = 'btn btn-secondary shadow-none'
        if (this.isPrivate) {
          return base
        }
        return `${base} active`
      }
      if (type === 'private') {
        const base = 'btn btn-secondary shadow-none ml-1'
        if (this.isPrivate) {
          return `${base} active`
        }
        return base
      }
      return ''
    }
  },
  watch: {
    isInfinity: {
      handler () {
        this.maxJoin = '0'
      }
    }
  }
}
