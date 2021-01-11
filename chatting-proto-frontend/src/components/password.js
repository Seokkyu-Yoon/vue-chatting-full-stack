import store from '@/store'
import Req from '@/core/request'

export default {
  name: 'roomPassword',
  props: ['title'],
  data () {
    return {
      show: false,
      password: ''
    }
  },
  methods: {
    join () {
      if (store.room.joining === store.room.roomMaxJoin) {
        if (store.room.roomMaxJoin !== 0) {
          alert('인원이 꽉 찼습니다')
          this.$refs.modal.hide()
          return
        }
      }

      if (store.room.roomPassword === this.password) {
        const req = new Req('req:room:join', { roomKey: store.room.roomKey })
        this.$request(req).then((res) => {
          const { room: resRoom } = res.body
          if (res.status === 200) {
            store.room = resRoom
            this.$router.push('Chat')
          }
        })
      } else {
        alert('비밀번호를 확인해주세요')
        this.password = ''
        this.$refs.password.focus()
      }
    },
    shown () {
      this.$refs.password.focus()
    },
    hidden () {
      store.room = {}
      this.password = ''
    }
  }
}
