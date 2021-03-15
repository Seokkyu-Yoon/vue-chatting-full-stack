import store from '@/store'

export default {
  name: 'SignIn',
  props: {
    moveToSignUp: Function
  },
  data () {
    return {
      id: '',
      pw: '',
      alertMessage: '',
      showAlert: false,
      ringing: false,
      timeout: undefined
    }
  },
  methods: {
    async signIn () {
      if (!this.id || !this.pw) {
        this.alertMessage = 'ID와 비밀번호를 반드시 입력하세요'

        clearTimeout(this.timeout)
        this.showAlert = true

        this.timeout = setTimeout(() => this.ringEnd(), 1000)
        return
      }
      try {
        const res = await this.$socketHandler.signIn({ id: this.id, pw: this.pw })
        const { user } = res.body
        store.user = user
        this.$router.push('Rooms')
      } catch (err) {
        this.alertMessage = err.body
        this.$refs.idField.focus()

        clearTimeout(this.timeout)
        this.showAlert = true
        this.timeout = setTimeout(() => this.ringEnd(), 1000)
      }
    },
    ringEnd () {
      this.showAlert = false
    }
  },
  mounted () {
    const { idField } = this.$refs
    idField.focus()
  }
}
