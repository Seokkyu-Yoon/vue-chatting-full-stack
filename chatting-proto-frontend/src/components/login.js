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
      const req = new Req('req:user:isValid', { userName: this.userName })
      this.$request(req).then((res) => {
        const { isValid } = res.body
        this.isValid = isValid
      }).catch(console.error)
    },
    login () {
      const req = new Req('req:user:login', { userName: this.userName })
      this.$request(req)
        .then((res) => {
          const { isValid, userName, room } = res.body
          this.isValid = isValid
          if (this.isValid) {
            store.userName = userName
            store.room = room
            this.$router.push('Rooms')
          }
        })
        .catch((err) => {
          console.log(err)
          this.$refs.alert.style.animation = 'shake 0.5s 1'
          this.$refs.nicknameField.focus()
        })
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
