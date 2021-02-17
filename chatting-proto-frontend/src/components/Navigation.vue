<template>
  <nav class="navbar navbar-expand navbar-dark bd-navbar bg-dark">
    <a class="navbar-brand" href="/">채팅 어플리케이션</a>
    <div class="ml-auto username" v-if="logined">
      {{store.userName}}
    </div>
  </nav>
</template>
<script src='./navigation.js'></script>

<style scoped>
.username {
  color: white;
}
</style>
