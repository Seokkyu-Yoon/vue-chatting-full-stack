<template>
  <div id="cover-enter">
    <h1>닉네임</h1>
    <div id="form-holder">
      <input
        type="text"
        v-model="store.userName"
        v-on:keydown="setUserName"
        v-on:keydown.enter="login"
        placeholder="닉네임을 입력해주세요"/>
      <button v-on:click="login">접속</button>
    </div>
  </div>
</template>

<script>
import store from '@/store';

export default {
  name: 'Login',
  beforeCreate() {
    if (this.$cookies.get('token') !== null) {
      this.$router.replace('/Chat');
    }
    this.$cookies.remove('token');
  },
  data() {
    return {
      store,
    };
  },
  methods: {
    setUserName(e) {
      store.userName = String(e.target.value).replace(' ', '');
    },
    login() {
      if (store.userName === '') {
        // eslint-disable-next-line no-alert
        alert('닉네임을 입력해주세요');
        return;
      }
      this.$request('req:user:login', {
        userName: store.userName,
      });
      this.$router.replace('/Chat');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cover-enter {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
#form-holder {
  margin-bottom: 10%;
}
</style>
