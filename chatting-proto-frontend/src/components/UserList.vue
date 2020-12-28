<template>
  <div id="cover-users">
    <div
      class="user mb-1"
      v-for="(user, socketId) in userMap"
      v-bind:key="`user-${socketId}`">
      <div class="user-key">{{socketId}}</div>
      <div class="user-name">{{user.userName}}</div>
    </div>
  </div>
</template>

<script src='./user-list.js'></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  text-align: center;
}
#cover-users {
  display: flex;
  flex: 1;
  flex-direction: column;
  border-radius: 10px;
  background-color: lightgreen;
  overflow-y: scroll;
  padding: 10px;
  margin-bottom: 1rem;
}
.user {
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
