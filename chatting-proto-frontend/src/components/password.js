export default {
  name: 'roomPassword',
  props: {
    room: Object,
    join: Function
  },
  data () {
    return {
      show: false,
      password: ''
    }
  },
  methods: {
    shown () {
      this.$refs.password.focus()
    },
    hidden () {
      this.password = ''
    }
  }
}
