import SignIn from '@/components/SignIn.vue'
import SignUp from '@/components/SignUp.vue'
import store from '@/store'

export default {
  name: 'Home',
  components: {
    SignIn,
    SignUp
  },
  data () {
    return {
      page: 'signIn'
    }
  },
  computed: {
    showSignIn () {
      return this.page === 'signIn'
    },
    showSignUp () {
      return this.page === 'signUp'
    }
  },
  methods: {
    moveTo (page) {
      this.page = page
    },
    moveToSignIn () {
      this.moveTo('signIn')
    },
    moveToSignUp () {
      this.moveTo('signUp')
    }
  },
  beforeCreate () {
    if (store.user !== null) {
      this.$router.push('Rooms')
    }
  },
  beforeMount () {
    sessionStorage.clear()
  }
}
