<template>
  <div id="cover-users">
    <h1>사용자 목록</h1>
    <div id="holder-users">
      <div
        class="user"
        v-for="user in users"
        v-bind:key="`user-${user.key}`">
        <div class="user-key">{{user.key}}</div>
        <div class="user-name">{{user.name}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import myFetch from '@/core/fetch';

export default {
  name: 'Users',
  data() {
    return {
      userMap: {},
    };
  },
  created() {
    myFetch.get(`${store.serverIp}/user`).then((result) => {
      this.userMap = result;
    }).catch(console.error);

    this.$socket.on('user-changed', (userMap) => {
      console.log('user-changed');
      this.userMap = userMap;
    });
  },
  computed: {
    users() {
      return Object.keys(this.userMap).map((userKey) => ({
        key: userKey,
        ...this.userMap[userKey],
      }));
    },
  },
  methods: {
    makeuser() {
      if (!this.newuserName) {
        // eslint-disable-next-line no-alert
        alert('방 이름을 입력해주세요');
        return;
      }
      myFetch.put(`${store.serverIp}/user`, {
        userName: this.newuserName,
      }).catch(console.error);
      this.newuserName = '';
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  text-align: center;
}
#cover-users {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 10px;
}

#holder-users {
  overflow-y: scroll;
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  background-color: lightgreen;
}

.user {
  margin-bottom: 10px;
  border-radius: 5px;
  padding: 5px;
  background-color: coral;
}

.selected {
  background-color: aquamarine;
}

.user-name {
  font-size: 16px;
  font-weight: bold;
}

.user-key {
  font-size: 12px;
  text-align: right;
  font-style: italic;
}

</style>
