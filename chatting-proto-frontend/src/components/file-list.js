
function convertDate (date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export default {
  name: 'FileList',
  props: {
    room: {
      type: String,
      default: ''
    },
    user: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      fileList: []
    }
  },
  async mounted () {
    console.log(this.user)
    this.$eventBus.$on('upload-success', async () => {
      await this.getFileList()
    })
    await this.getFileList()
  },
  methods: {
    async getFileList () {
      const result = await this.$http.get(`/file/list/${this.room}`)
      this.fileList = result.data.data
      if (this.fileList.length) {
        this.fileList.forEach(item => {
          item.register_date = convertDate(new Date(item.register_date))
          item.expire_date = convertDate(new Date(item.expire_date))
        })
      }
    },
    downloadFile (itm) {
      // const popTitle = 'popupOpener'

      // window.open('', popTitle)

      const frmData = document.frmData
      // frmData.target = popTitle
      frmData.action = `/file/download/${itm.id}`

      if (itm.passwd === 'none') {
        const hiddenField = document.createElement('input')
        hiddenField.setAttribute('type', 'hidden')
        hiddenField.setAttribute('name', 'passwd')
        hiddenField.setAttribute('value', 'none')
        frmData.appendChild(hiddenField)
      }

      frmData.submit()
    },
    async deleteFile (itm) {
      this.$bvModal.msgBoxConfirm(`${itm.filename}`, {
        title: '삭제하시겠습니까?',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: '예',
        cancelTitle: '아니오',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true
      })
        .then(async (value) => {
          if (value) {
            await this.$http.delete(`/file/delete/${itm.id}`)
            await this.getFileList()
          }
        })
    },
    test () {
      console.log('test')
    }
  }
}
