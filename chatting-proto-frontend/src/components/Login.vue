<template>
  <div class="m-auto d-flex flex-column align-items-center justify-content-between jumbotron">
    <p class="h1 mb-4">별명</p>
    <div class="form-inline mb-2">
      <input
        ref="nicknameField"
        type="text"
        class="form-control mr-1"
        v-model="userName"
        @input="setUserName"
        v-on:keydown.enter="login"
        placeholder="별명을 입력해주세요"/>
      <button type="button" class="btn btn-primary" v-on:click="login">접속</button>
    </div>
    <div
      v-show="isValid"
      class="alert alert-success w-100"
      role="alert">
      사용가능한 별명입니다
    </div>
    <div
      v-show="!isValid"
      ref="alert"
      class="alert alert-danger w-100"
      role="alert">
      사용불가한 별명입니다
    </div>
  </div>
</template>

<script src="./login.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@keyframes shake {
  0% { transform: translate(5px, 0px); }
  10% { transform: translate(-5px, 0px); }
  20% { transform: translate(4px, 0px); }
  30% { transform: translate(-4px, 0px); }
  40% { transform: translate(3px, 0px); }
  50% { transform: translate(-3px, 0px); }
  60% { transform: translate(-2px, 0px); }
  70% { transform: translate(2px, 0px); }
  80% { transform: translate(-1px, 0px); }
  90% { transform: translate(1px, 0px); }
  100% { transform: translate(0px, 0px); }
}
</style>
