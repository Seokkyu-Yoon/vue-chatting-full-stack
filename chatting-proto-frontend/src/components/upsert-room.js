import Req from '@/core/request'
import store from '@/store'
export default {
  name: 'Modal',
  props: ['modifing'],
  data () {
    return {
      defaultSetting: {},
      show: false,
      title: '',
      isPrivate: false,
      pw: '',
      maxJoin: '0',
      isInfinity: true,
      description: ''
    }
  },
  methods: {
    setPublic () {
      this.isPrivate = false
      this.pw = this.defaultSetting.pw || ''
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
        title: this.title,
        pw: this.pw,
        createBy: store.userName,
        maxJoin: this.maxJoin,
        description: this.description
      })
      this.$request(req).catch(console.log)
    },
    updateRoom () {
      const req = new Req('req:room:update', {
        title: this.title,
        pw: this.pw,
        maxJoin: this.maxJoin,
        description: this.description
      })
      this.$request(req)
    },
    deleteRoom () {
      const req = new Req('req:room:delete', { title: store.room.title })
      this.$request(req)
    },
    initInputs () {
      const {
        title = '',
        pw = '',
        maxJoin = '0',
        description = ''
      } = store.room || {}

      this.defaultSetting = {
        title,
        isPrivate: pw !== '',
        pw,
        isInfinity: Number(maxJoin) === 0,
        maxJoin: String(maxJoin),
        description
      }

      this.title = this.defaultSetting.title
      this.isPrivate = this.defaultSetting.isPrivate
      this.pw = this.defaultSetting.pw
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
        this.pw = value ? this.defaultSetting.pw : ''
      }
    }
  }
}
