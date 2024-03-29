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
    alert (msg) {
      this.alertMessage = msg
      this.showAlert = true
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => this.ringEnd(), 1000)
    },
    async signUp () {
      if (!this.id || !this.pw || !this.name) {
        this.alert('id, pw, name is required')
        return
      }

      try {
        const res = await this.$socketHandler.signUp({
          id: this.id, pw: this.pw, name: this.name, email: this.email, phone: this.phone
        })
        const { user } = res.body
        store.user = user
        this.$router.push('Rooms')
      } catch (err) {
        // this.alertMessage = err.body
        this.$refs.idField.focus()
        this.alert(err.body)
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
