<template>
  <nav class="navbar navbar-expand navbar-dark bd-navbar bg-dark">
    <a class="navbar-brand d-none d-sm-block" href="javascript:location.reload(true)">채팅 어플리케이션</a>
    <div class="flex-fill d-flex align-items-center justify-content-end overflow-hidden username" v-if="logined">
      <b-img class="tumbnail mr-1" src='https://picsum.photos/id/800/100'/>
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
.tumbnail {
  width: 2rem;
  height: 2rem;
  border-radius: 1rem;
}
</style>
