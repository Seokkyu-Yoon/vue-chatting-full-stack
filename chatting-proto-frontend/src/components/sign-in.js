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
      alert.$el.classList.remove('shake')
    }
  },
  mounted () {
    const { idField } = this.$refs
    idField.focus()
  }
}
