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
      overlayShow: false,
      uploadProgress: 0,
      isProtected: false,
      passwd: '',
      validate: '',
      expireDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    }
  },
  methods: {
    async uploadFile () {
      const { uploadForm } = this.$refs
      const form = new FormData(uploadForm)
      if (!uploadForm[0].value) {
        alert('업로드 된 파일이 없습니다.')
        return
      }
      this.overlayShow = true
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
        const result = await this.$http.post('/file/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(this.uploadProgress)
          }
        })
        if (this.uploadProgress === 100) {
          this.$bvToast.show('upload-alert')
          this.$emit('upload-success', {
            ...result.data.data,
            overlay: false,
            inputPasswd: '',
            state: null
          })
        }
      } catch (err) {
        console.error(err)
        throw err
      }
    }
  }
}
