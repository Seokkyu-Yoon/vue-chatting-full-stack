<template>
  <div class="access align-items-center">
    <b-card class="input-card" title="비밀번호를 입력하세요">
      <form name="frmData" id="frmData" method="post">
        <b-form-input class="mb-3" name="passwd" type="password" v-model="password"></b-form-input>
      </form>
      <!-- <div v-if="validate !== null">비밀번호가 잘못되었습니다.</div> -->
      <b-button class="float-right" @click="openUrl">다운로드</b-button>
    </b-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      content: '',
      validate: null,
      password: ''
    }
  },
  mounted () {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    this.content = urlParams.get('value')
    this.validate = urlParams.get('validate')

    if (this.validate !== null) {
      alert('잘못된 비밀번호입니다.')
    }
  },
  methods: {
    openUrl () {
      if (this.password === '') {
        alert('비밀먼호를 입력하세요')
      } else {
        const popTitle = 'popupOpener'

        window.open('', popTitle)

        const frmData = document.frmData
        frmData.target = popTitle
        frmData.action = `/file/download/${this.content}`

        frmData.submit()
      }
    }
  }
}
</script>

<style scoped>
.input-card {
  width: 400px !important;
}
.access {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  /* text-align: center; */
}
</style>
