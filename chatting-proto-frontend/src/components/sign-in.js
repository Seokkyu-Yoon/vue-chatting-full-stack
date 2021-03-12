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
        this.showAlert = true
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

        const { alert } = this.$refs
        clearTimeout(this.timeout)
        alert.$el.classList.remove('shake')

        this.showAlert = true
        alert.$el.classList.add('shake')

        this.timeout = setTimeout(() => this.ringEnd(), 1000)
      }
    },
    ringEnd () {
      const { alert } = this.$refs
      this.showAlert = false

      if (typeof alert !== 'undefined') {
        alert.$el.classList.remove('shake')
      }
    }
  },
  mounted () {
    const { idField } = this.$refs
    idField.focus()
  }
}
