<template>
  <div id="cover-users" class="d-flex flex-fill flex-column bg-users p-2">
    <div
      class="user mb-1"
      v-for="{userName, socketId} in users"
      v-bind:key="`user-${socketId}`">
      <div class="user-key">{{socketId}}</div>
      <div class="user-name">{{userName}}</div>
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
  border-radius: 10px;
  overflow-y: scroll;
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
