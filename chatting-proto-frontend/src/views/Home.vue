<template>
  <div class="d-flex flex-column flex-fill justify-content-center align-items-center">
    <SignIn v-if="showSignIn" v-bind:moveToSignUp="moveToSignUp"/>
    <SignUp v-else-if="showSignUp" v-bind:moveToSignIn="moveToSignIn"/>
  </div>
</template>

<script src="./home.js"></script>
<style scoped>

</style>
