<template>
  <div class="d-flex flex-column align-items-center overflow-hidden">
    <div class="d-flex flex-column align-self-center jumbotron m-0 p-3 overflow-hidden">
      <p class="h1 text-center">회원가입</p>
      <div class="d-flex flex-fill flex-column p-3 overflow-auto">
        <div>
          <input
            ref="idField"
            type="text"
            class="form-control"
            v-model="id"
            v-on:keydown.enter="$refs.pwField.focus"
            placeholder="아이디를 입력해주세요"/>
        </div>
        <div>
          <b-form-input
            ref="pwField"
            type="password"
            class="form-control mt-1"
            v-model="pw"
            v-on:keydown.enter="$refs.nameField.focus"
            placeholder="비밀번호를 입력해주세요"
            required
            />
        </div>
        <div>
          <input
            ref="nameField"
            type="text"
            class="form-control mt-1"
            v-model="name"
            v-on:keydown.enter="$refs.emailField.focus"
            placeholder="대화명을 입력해주세요"/>
        </div>
        <div>
          <input
            ref="emailField"
            type="text"
            class="form-control mt-1"
            v-model="email"
            v-on:keydown.enter="$refs.phoneField.focus"
            placeholder="이메일을 입력해주세요"/>
        </div>
        <div>
          <input
            ref="phoneField"
            type="text"
            class="form-control mt-1"
            v-model="phone"
            v-on:keydown.enter="signUp"
            placeholder="핸드폰 번호를 입력해주세요"/>
        </div>
      </div>
      <transition name="shake">
        <b-alert v-if="showAlert" variant="danger" show>
          {{alertMessage}}
        </b-alert>
      </transition>
      <div class="d-flex mt-1 mb-1 justify-content-center">
        <button type="button" class="btn btn-success" v-on:click="signUp">가입</button>
        <button type="button" class="btn btn-danger ml-1" v-on:click="moveToSignIn">취소</button>
      </div>
    </div>
  </div>
</template>

<script src="./sign-up"></script>

<style scoped>

</style>
