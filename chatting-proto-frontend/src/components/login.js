import store from '@/store'
import Req from '@/core/request'

export default {
  name: 'Login',
  data () {
    return {
      store,
      userName: '',
      isValid: false
    }
  },
  methods: {
    setUserName (e) {
      this.userName = e.target.value.replace(' ', '')
      const body = { userName: this.userName }
      const req = new Req('req:user:isValid', body)
      this.$request(req).then((res) => {
        this.isValid = res.body.isValid
      }).catch(console.error)
    },
    login () {
      const body = { userName: this.userName }
      const req = new Req('req:user:login', body)
      this.$request(req).then((res) => {
        const { isValid, userName } = res.body
        this.isValid = isValid
        if (this.isValid) {
          store.userName = userName
          this.$router.push('Rooms')
          return
        }
        this.$refs.alert.style.animation = 'shake 0.5s 1'
        this.$refs.nicknameField.focus()
      }).catch(console.error)
    }
  },
  beforeCreate () {
    if (store.userName) {
      this.$router.push('Rooms')
    }
  },
  mounted () {
    const { alert, nicknameField } = this.$refs
    alert.addEventListener('animationend', () => {
      alert.style.removeProperty('animation')
    })
    nicknameField.focus()
  }
}
