<template>
<div>
  <b-card bg-variant="secondary" text-variant="light" border-variant="secondary" no-body class="login p-1">
    <div class="pl-2 pr-2 d-flex align-items-center justify-content-between text-center">User Login
      <b-button size="sm" variant="info" v-on:click="moveToSignUp">가입
      </b-button>
    </div>
  </b-card>
  <b-card bg-variant="light" text-variant="dark" border-variant="secondary" class="login">
    <b-form>
      <div class="d-flex my-1">
        <div class="flex-fill mr-1">
          <b-form-input
            ref="idField"
            type="text"
            class="form-control"
            v-model="id"
            v-on:keydown.enter="$refs.pwField.focus"
            placeholder="아이디를 입력해주세요"
            autofocus
            required
            />
          <b-form-input
            ref="pwField"
            type="password"
            class="form-control mt-1"
            v-model="pw"
            v-on:keydown.enter="signIn"
            placeholder="비밀번호를 입력해주세요"
          />
        </div>
        <button type="button" class="btn btn-primary" v-on:click="signIn">접속</button>
      </div>
      <transition name="shake">
        <b-alert v-if="showAlert" variant="danger" show>
          {{alertMessage}}
        </b-alert>
      </transition>
    </b-form>
  </b-card>
</div>
</template>

<script src="./sign-in.js"></script>

<style scoped>
.login {
  border-radius: 0;
}
</style>
