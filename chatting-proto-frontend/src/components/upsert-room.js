import Req from '@/core/request'
import store from '@/store'
export default {
  name: 'Modal',
  props: ['title', 'modifing'],
  data () {
    return {
      defaultSetting: {},
      show: false,
      name: '',
      isPrivate: false,
      password: '',
      maxJoin: '0',
      isInfinity: true,
      description: ''
    }
  },
  methods: {
    setRoomName (e) {
      // this.maxJoin = e.target.value.replace(/^0+/, '')
    },
    setPublic () {
      this.isPrivate = false
      this.password = this.defaultSetting.password || ''
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
    },
    createRoom () {
      const req = new Req('req:room:create', {
        roomName: this.name,
        roomPassword: this.password,
        roomMaxJoin: this.maxJoin,
        roomDesc: this.description
      })
      this.$request(req).then((res) => {
        const { room } = res.body
        store.room = room
        this.$router.push('Chat')
      })
    },
    updateRoom () {
      const req = new Req('req:room:update', {
        roomKey: store.room.roomKey,
        roomName: this.name,
        roomPassword: this.password,
        roomMaxJoin: this.maxJoin,
        roomDesc: this.description
      })
      this.$request(req)
    },
    deleteRoom () {
      const req = new Req('req:room:delete', { roomKey: store.room.roomKey })
      this.$request(req)
    },
    initInputs () {
      const {
        roomName: name = '',
        roomPassword: password = '',
        roomMaxJoin: maxJoin = '0',
        roomDesc: description = ''
      } = store.room || {}

      this.defaultSetting = {
        name,
        isPrivate: password !== '',
        password,
        isInfinity: Number(maxJoin) === 0,
        maxJoin: String(maxJoin),
        description
      }

      this.name = this.defaultSetting.name
      this.isPrivate = this.defaultSetting.isPrivate
      this.password = this.defaultSetting.password
      this.isInfinity = this.defaultSetting.isInfinity
      this.maxJoin = this.defaultSetting.maxJoin
      this.description = this.defaultSetting.description
    }
  },
  watch: {
    isInfinity: {
      handler (value) {
        this.maxJoin = value ? '0' : this.defaultSetting.maxJoin
      }
    },
    isPrivate: {
      handler (value) {
        this.password = value ? this.defaultSetting.password : ''
      }
    }
  }
}
