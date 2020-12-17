<template>
  <nav class="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar bg-dark">
    <a class="navbar-brand" href="https://ieilms.jbnu.ac.kr/">K-HUB</a>
    <div class="ml-md-auto"></div>
    <button v-if="logined" class="btn btn-secondary">내 정보</button>
  </nav>
</template>
<script src='./navigation.js'></script>

<style scoped></style>
