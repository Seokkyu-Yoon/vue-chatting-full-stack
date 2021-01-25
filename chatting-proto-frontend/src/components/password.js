import store from '@/store'
import Req from '@/core/request'

export default {
  name: 'roomPassword',
  props: ['propTitle'],
  data () {
    return {
      show: false,
      password: ''
    }
  },
  methods: {
    join () {
      if (store.room.joining === (store.room.maxJoin || -1)) {
        alert('인원이 꽉 찼습니다')
        this.$refs.modal.hide()
        return
      }

      const req = new Req('req:room:join', { id: store.room.id, pw: this.password })
      this.$request(req).then((res) => {
        const { room: resRoom } = res.body
        if (res.status === 200) {
          store.room = resRoom
          this.$router.push({
            name: 'Chat',
            params: {
              roomId: store.room.id,
              userName: store.userName,
              pw: this.password
            }
          })
        }
      }).catch((e) => {
        console.log(e)
        alert('비밀번호를 확인해주세요')
        this.password = ''
        this.$refs.password.focus()
      })
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
