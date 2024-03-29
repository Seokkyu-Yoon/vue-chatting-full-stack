import ToastAlert from '@/components/ToastAlert'

export default {
  name: 'FileUploader',
  components: {
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
      modal: false,
      uploadProgress: 0,
      isProtected: false,
      passwd: '',
      validate: '',
      expireDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    }
  },
  methods: {
    closeModal () {
      this.passwd = this.validate = ''
      this.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      this.isProtected = false
      this.modal = false
    },
    async uploadFile () {
      const { uploadForm } = this.$refs
      const form = new FormData(uploadForm)
      form.append('roomId', this.roomId)
      form.append('uploadUser', this.user)
      form.append('isProtected', this.isProtected)

      if (this.isProtected) {
        if (this.passwd === '') {
          alert('비밀번호를 입력하세요.')
          return
        } else if (this.passwd !== this.validate) {
          alert('비밀번호가 맞지 않습니다.')
          return
        } else {
          form.append('passwd', this.passwd)
        }
      } else {
        form.append('passwd', '')
      }
      if (this.expireDate === '') {
        alert('다운로드 만료 날짜를 선택하세요.')
        return
      } else {
        form.append('expireDate', this.expireDate)
      }

      try {
        await this.$http.post('/file/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(this.uploadProgress)
          }
        })
        if (this.uploadProgress === 100) {
          this.$bvToast.show('upload-alert')
          this.$emit('upload-success')
          this.closeModal()
        }
      } catch (err) {
        console.error(err)
        throw err
      }
    }
  }
}
