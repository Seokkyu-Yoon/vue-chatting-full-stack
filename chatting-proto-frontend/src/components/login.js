import store from '@/store'
import Req from '@/core/request'

export default {
  name: 'Login',
  data () {
    return {
      store,
      id: '',
      userName: '',
      isValid: false
    }
  },
  methods: {
    setId (e) {
      this.id = e.target.value.replace(' ', '').replace(/[^0-9]/g, '')
    },
    setUserName (e) {
      this.userName = e.target.value.replace(' ', '')
      const req = new Req('req:user:isValid', { userName: this.userName })
      this.$request(req).then((res) => {
        const { isValid } = res.body
        this.isValid = isValid
      }).catch(console.error)
    },
    login () {
      const req = new Req('req:user:login', { userId: Number(this.id), userName: this.userName })
      this.$request(req)
        .then((res) => {
          const { isValid, userName, userId, room } = res.body
          this.isValid = isValid
          if (isValid) {
            store.userId = userId
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
    const { alert, idField } = this.$refs
    alert.addEventListener('animationend', () => {
      alert.style.removeProperty('animation')
    })
    idField.focus()
  }
}
