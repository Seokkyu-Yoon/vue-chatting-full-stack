<template>
  <div id="cover-enter">
    <h1>닉네임</h1>
    <div id="form-holder">
      <input
        type="text"
        v-model="userName"
        v-on:keyup="setUserName"
        v-on:keyup.enter="enter"
        placeholder="닉네임을 입력해주세요"/>
      <button v-on:click="enter">접속</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Enter',
  data() {
    return {
      userName: '',
    };
  },
  methods: {
    setUserName(e) {
      this.userName = String(e.target.value).replace(' ', '');
    },
    enter() {
      if (!this.userName) {
        // eslint-disable-next-line no-alert
        alert('닉네임을 입력해주세요');
        return;
      }
      this.$socket.emit('create', { userName: this.userName });
      this.$router.push('Chat');
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
