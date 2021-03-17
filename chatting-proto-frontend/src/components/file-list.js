import FileUploader from '@/components/FileUploader'
import ToastAlert from '@/components/ToastAlert'

function convertDate (date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export default {
  name: 'FileList',
  components: {
    FileUploader,
    ToastAlert
  },
  props: {
    roomId: {
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
      fileList: [],
      overlayId: '',
      showUploadPannel: false,
      downloadProgress: 0,
      cancelTokens: {}
    }
  },
  async mounted () {
    await this.getFileList()
  },
  methods: {
    async getFileList () {
      const result = await this.$http.get(`/file/list/${this.roomId}`)
      this.fileList = result.data.data
      if (this.fileList.length) {
        this.fileList.forEach(item => {
          item.register_date = convertDate(new Date(item.register_date))
          item.expire_date = convertDate(new Date(item.expire_date))
        })
        this.fileList = this.fileList.map(itm => ({
          ...itm,
          overlay: false,
          inputPasswd: '',
          state: null
        }))
      }
    },
    uploadSuccess (itm) {
      this.fileList.unshift(itm)
      this.showUploadPannel = false
    },
    async downloadFile (itm) {
      this.displayOverlay(itm, 'download')
      const cancelTokenSource = this.$http.CancelToken.source()
      this.cancelTokens[itm.id] = cancelTokenSource
      try {
        const result = await this.$http.post(`/file/download/${itm.id}`,
          { passwd: itm.inputPasswd },
          {
            responseType: 'blob', // important
            cancelToken: cancelTokenSource.token,
            onDownloadProgress: progressEvent => {
              const percentage = Math.round((progressEvent.loaded * 100) / itm.size)
              this.downloadProgress = percentage
            }
          }
        )
        const url = window.URL.createObjectURL(new Blob([result.data], { type: result.headers['content-type'] }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('id', itm.id)
        link.setAttribute('download', itm.filename)
        document.body.appendChild(link)
        link.click()
        document.getElementById(itm.id).remove()
        itm.state = null
        itm.overlay = false
        this.downloadProgress = 0
        delete this.cancelTokens[itm.id]
        this.$bvToast.show('download-alert')
      } catch (error) {
        if (!error.message) {
          itm.overlay = false
          this.downloadProgress = 0
          this.$bvToast.show('download-cancel-alert')
        } else if (error.response.status === 404) {
          itm.state = false
          this.$bvToast.show('invalid-passwd-alert')
          this.displayOverlay(itm, 'passwd')
        }
      }
    },
    async deleteFile (itm) {
      const idx = this.fileList.indexOf(itm)
      this.fileList.splice(idx, 1)
      await this.$http.delete(`/file/delete/${itm.id}`)
      this.$bvToast.show('delete-alert')
    },
    displayOverlay (itm, overlayId) {
      this.overlayId = overlayId
      itm.overlay = true
    },
    closeDownloadOverlay (itm) {
      itm.overlay = false
      itm.inputPasswd = ''
      itm.state = null
    },
    copyToClipboard (itm) {
      const el = document.createElement('textarea')
      el.value = `${process.env.VUE_APP_SERVER_IP}:${process.env.VUE_APP_SERVER_PORT}/file/download/${itm.id}`
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      this.$bvToast.show('clipboard-alert')
      document.body.removeChild(el)
    }
  }
}
