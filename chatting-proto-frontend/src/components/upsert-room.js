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
  mounted () {
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
    async createRoom () {
      if (!this.title) {
        return
      }
      if (Number(this.maxJoin) < 0) {
        window.alert('인원 수 이상해요.😓')
        this.maxJoin = '0'
        return
      }
      await this.$socketHandler.createRoom({
        title: this.title,
        pw: this.pw,
        createBy: store.user.id,
        maxJoin: this.maxJoin,
        description: this.description
      })
    },
    async updateRoom () {
      await this.$socketHandler.updateRoom({
        id: store.room.id,
        title: this.title,
        pw: this.pw,
        maxJoin: this.maxJoin,
        description: this.description
      })
    },
    async deleteRoom () {
      if (window.confirm(`${store.room.id} 방을 진짜 지우시겠습니까? 😱`)) {
        await this.$socketHandler.deleteRoom({ id: store.room.id })
      }
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

      // this.title = this.defaultSetting.title
      this.title = 'MyRoom' + Math.floor(Math.random() * 1000)
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
