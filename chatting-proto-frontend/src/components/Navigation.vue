<template>
  <nav class="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar bg-dark">
    <a class="navbar-brand" href="https://ieilms.jbnu.ac.kr/">K-HUB</a>
    <div class="ml-auto">
      <button v-if="logined" v-on:click="showMyInfo" class="btn btn-secondary">내 정보</button>
    </div>
  </nav>
</template>
<script src='./navigation.js'></script>

<style scoped></style>
