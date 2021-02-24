<template>
  <div class="d-flex flex-column align-items-center">
    <b-alert ref="alert" class="alert mt-2" v-visible="showAlert" variant="danger" show>{{alertMessage}}</b-alert>
    <div class="d-flex flex-column align-self-center jumbotron">
      <p class="h1 text-center">Chatting</p>
      <div class="d-flex my-2">
        <div class="flex-fill mr-1">
          <input
            ref="idField"
            type="text"
            class="form-control"
            v-model="id"
            v-on:keydown.enter="$refs.pwField.focus"
            placeholder="아이디를 입력해주세요"/>
          <input
            ref="pwField"
            type="password"
            class="form-control mt-1"
            v-model="pw"
            v-on:keydown.enter="signIn"
            placeholder="비밀번호를 입력해주세요"/>
        </div>
        <button type="button" class="btn btn-primary" v-on:click="signIn">접속</button>
        <button type="button" class="btn btn-success ml-1" v-on:click="moveToSignUp">가입</button>
      </div>
    </div>
  </div>
</template>

<script src="./sign-in.js"></script>

<style scoped>
.alert {
  position: absolute
}
</style>
