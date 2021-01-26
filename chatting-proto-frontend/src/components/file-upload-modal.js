export default {
  name: 'FileUploader',
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
      modal: false,
      uploadProgress: 0,
      passwdOrNot: false,
      passwd: '',
      validate: '',
      expireDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    }
  },
  methods: {
    closeModal () {
      this.passwd = this.validate = ''
      this.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      this.passwdOrNot = false
      this.modal = false
    },
    async uploadFile () {
      const { uploadForm } = this.$refs
      const form = new FormData(uploadForm)
      form.append('room', this.room)
      form.append('author', this.user)

      if (this.passwdOrNot) {
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
        const uploadResult = await this.$http.post('/file/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(this.uploadProgress)
          }
        })
        console.log(uploadResult)
        this.$eventBus.$emit('upload-success')
        this.closeModal()
      } catch (err) {
        console.error(err)
        throw err
      }
    }
  }
}
