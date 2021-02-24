import store from '@/store'

export default {
  name: 'SignUp',
  data () {
    return {
      id: '',
      pw: '',
      name: '',
      email: '',
      phone: '',
      alertMessage: '',
      showAlert: false,
      ringing: false,
      timeout: undefined
    }
  },
  props: {
    moveToSignIn: Function
  },
  methods: {
    async signUp () {
      try {
        const res = await this.$socketHandler.signUp({ id: this.id, pw: this.pw, name: this.name, email: this.email, phone: this.phone })
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
