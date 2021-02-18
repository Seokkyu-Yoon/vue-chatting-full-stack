<template>
  <nav class="navbar navbar-expand navbar-dark bd-navbar bg-dark">
    <a class="navbar-brand d-none d-sm-block">채팅 어플리케이션</a>
    <div class="flex-fill d-flex align-items-center justify-content-end overflow-hidden username" v-if="logined">
      <div>{{store.userName}}</div>
      <a class="btn btn-secondary ml-2" href="/">로그아웃</a>
    </div>
  </nav>
</template>
<script src='./navigation.js'></script>

<style scoped>
.username {
  color: white;
}
</style>
